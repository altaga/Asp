#include <Arduino.h>
#include <esp_log.h>
#include "GachaOS.h"
#include "GachaMotor.h"

GachaOS gacha;
volatile bool dispenseBusy = false;
String pendingReceiptTxId = "";

void executeCommand(String tx_id, JsonArray args) {
  String action = args.size() > 0 ? args[0].as<String>() : "";

  if (action != "DISPENSE_ONCE") {
    Serial.println("[gacha] ignore unknown action: " + action);
    gacha.publishReceipt(tx_id, action, "ignored");
    return;
  }

  if (dispenseBusy || gachaMotorBusy()) {
    Serial.println("[gacha] busy — refuse second DISPENSE_ONCE");
    gacha.publishReceipt(tx_id, "DISPENSE_ONCE", "busy");
    return;
  }

  if (!gachaMotorDispenseOnce()) {
    gacha.publishReceipt(tx_id, "DISPENSE_ONCE", "busy");
    return;
  }

  dispenseBusy = true;
  pendingReceiptTxId = tx_id;
  Serial.println("[gacha] DISPENSE_ONCE started tx_id=" + tx_id);
}

void setup() {
  // Keep Serial always on for logs / bench / reflash-via-USB.
  // Never while(!Serial) — that would hang on external power with no host.
#if ARDUINO_USB_CDC_ON_BOOT && ARDUINO_USB_MODE
  // HWCDC blocks each write until timeout when USB is plugged but no monitor is open,
  // and IDF logs (wifi/tls/mqtt tasks) stall the same way on USB-Serial-JTAG.
  // Must be >= 1: HWCDC::write() decrements a uint32 retry counter seeded with this value,
  // so 0 wraps and spins until a host reads the port.
  Serial.setTxTimeoutMs(1);
  esp_log_level_set("*", ESP_LOG_NONE);
#endif
  Serial.begin(115200);
  delay(500);
  statusLedInit();
  gachaMotorInit();

  gacha.bindCapability(executeCommand);
  gacha.boot();

  Serial.println("Bench: serial 'start' = local 1 turn (no MQTT receipt).");
}

void loop() {
  // Local bench trigger (does not publish a gateway receipt).
  if (Serial.available() > 0) {
    String command = Serial.readStringUntil('\n');
    command.trim();
    if (command == "start") {
      if (dispenseBusy || gachaMotorBusy()) {
        Serial.println("Busy.");
      } else if (gachaMotorDispenseOnce()) {
        Serial.println("Local spin...");
      }
    }
  }

  gacha.loop();
  gachaMotorLoop();
  statusLedTickFromNet();

  if (dispenseBusy && !gachaMotorBusy() && pendingReceiptTxId.length() > 0) {
    gacha.publishReceipt(pendingReceiptTxId, "DISPENSE_ONCE", "success");
    Serial.println("[gacha] DISPENSE_ONCE done tx_id=" + pendingReceiptTxId);
    pendingReceiptTxId = "";
    dispenseBusy = false;
  }
}
