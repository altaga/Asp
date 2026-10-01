# Build + flash the XIAO ESP32-C5 with esptool directly.
# `pio run -t upload` on pioarduino 55.03.30 can report SUCCESS without producing firmware.bin.
# Usage: .\scripts\flash-xiao.ps1 [-Port COM15]
param([string]$Port = "COM15")
$ErrorActionPreference = "Stop"

$pioHome = "$env:USERPROFILE\.platformio"
$py = "$pioHome\penv\Scripts\python.exe"
$esptool = "$pioHome\packages\tool-esptoolpy\esptool.py"
$bootElf = "$pioHome\packages\framework-arduinoespressif32-libs\esp32c5\bin\bootloader_qio_80m.elf"
$bootApp0 = "$pioHome\packages\framework-arduinoespressif32\tools\partitions\boot_app0.bin"
$build = Join-Path $PSScriptRoot "..\.pio\build\xiao_esp32c5"
$env:PATH = "$pioHome\penv\Scripts;$env:PATH"
$env:PYTHONIOENCODING = "utf-8"

Push-Location (Join-Path $PSScriptRoot "..")
try {
  & "$pioHome\penv\Scripts\pio.exe" run -e xiao_esp32c5
  if ($LASTEXITCODE -ne 0) { throw "build failed" }

  $image = @("--chip", "esp32c5", "elf2image", "--flash-mode", "dio", "--flash-freq", "80m", "--flash-size", "8MB")
  & $py $esptool @image -o "$build\bootloader.bin" $bootElf
  & $py $esptool @image --elf-sha256-offset 0xb0 -o "$build\firmware.bin" "$build\firmware.elf"

  & $py $esptool --chip esp32c5 -p $Port -b 460800 --before default-reset --after hard-reset `
    write-flash -z --flash-mode dio --flash-freq 80m --flash-size 8MB `
    0x2000 "$build\bootloader.bin" 0x8000 "$build\partitions.bin" 0xe000 $bootApp0 0x10000 "$build\firmware.bin"
  if ($LASTEXITCODE -ne 0) { throw "flash failed" }
} finally {
  Pop-Location
}
