# Pre-push secret gate. Fails (exit 1) on any finding.
#   pwsh scripts/secret-scan.ps1            -> staged changes + tracked files + full history
param([switch]$StagedOnly)

$ErrorActionPreference = 'Stop'
Set-Location (git rev-parse --show-toplevel)
$failed = $false

$forbidden = '(?i)(^|/)(\.env(\..+)?|creds\.h|process(\..+)?\.json|wallet[^/]*\.json|[^/]+\.(pem|key|ppk)|tx_audit\.json|gacha-device-creds\.json)$|^(VM|old|Docs|Skills|\.cursor|@altaga-x402-sui)/'
$files = if ($StagedOnly) { git diff --cached --name-only --diff-filter=ACMR } else { git ls-files }
$bad = $files | Where-Object { $_ -match $forbidden -and $_ -notmatch '\.env\.example$' }
if ($bad) {
  Write-Host "Forbidden paths tracked/staged:" -ForegroundColor Red
  $bad | ForEach-Object { Write-Host "  $_" }
  $failed = $true
}

if ($StagedOnly) {
  gitleaks protect --staged --config .gitleaks.toml --redact --no-banner
} else {
  gitleaks detect --config .gitleaks.toml --redact --no-banner
}
if ($LASTEXITCODE -ne 0) { $failed = $true }

if ($failed) { Write-Host "Secret scan FAILED - do not commit/push." -ForegroundColor Red; exit 1 }
Write-Host "Secret scan clean." -ForegroundColor Green
