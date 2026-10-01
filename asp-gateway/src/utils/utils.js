import { settings } from '../services/settings/settings.js';

export function describeConfig(log) {
  const g = settings.gateway;
  const description = {
    monadAddress: settings.monad.address || '(no GATEWAY_ADDRESS set)',
    monadNetwork: settings.monad.network,
    monadRpc:     settings.monad.rpcUrls[0],
    usdc:         settings.monad.usdc,
    mqttBroker:  settings.mqtt.brokerUrl,
    mqttUser:    g.id,
    httpHost:    settings.http.host,
    httpPort:    settings.http.port,
    gatewayId:   g.id,
    gatewayRole: g.role,
    devices:     Array.isArray(settings.devices) ? settings.devices.map((d) => d.id) : [],
  };
  
  if (log) {
    for (const [k, v] of Object.entries(description)) {
      if (v !== undefined && v !== null && v !== '') {
        log(`${k.padEnd(18)} ${v}`);
      }
    }
  }
  return description;
}
