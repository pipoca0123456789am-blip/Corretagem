$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$nextCommand = Join-Path $projectRoot 'node_modules\.bin\next.cmd'
$siteUrl = 'http://localhost:3001/'
$deadline = (Get-Date).AddSeconds(120)

function Test-ImovelHubAvailable {
  try {
    $response = Invoke-WebRequest -Uri $siteUrl -UseBasicParsing -TimeoutSec 3
    return $response.StatusCode -eq 200 -and $response.Content.Contains('Hub')
  } catch {
    return $false
  }
}

function Show-StartupError($message) {
  Add-Type -AssemblyName System.Windows.Forms
  [System.Windows.Forms.MessageBox]::Show(
    $message,
    'ImovelHub - falha ao iniciar',
    [System.Windows.Forms.MessageBoxButtons]::OK,
    [System.Windows.Forms.MessageBoxIcon]::Error
  ) | Out-Null
}

if (-not (Test-ImovelHubAvailable)) {
  if (-not (Test-Path -LiteralPath $nextCommand)) {
    Show-StartupError "Next.js was not found at '$nextCommand'. Restore the project dependencies."
    exit 1
  }

  $listener = [System.Net.Sockets.TcpClient]::new()
  $portOccupied = $false
  try {
    $connection = $listener.BeginConnect('127.0.0.1', 3001, $null, $null)
    $portOccupied = $connection.AsyncWaitHandle.WaitOne(500) -and $listener.Connected
  } finally {
    $listener.Close()
  }

  if ($portOccupied) {
    Show-StartupError 'Port 3001 is already in use; ImovelHub was not started.'
    exit 1
  }

  try {
    Start-Process `
      -FilePath $env:ComSpec `
      -ArgumentList @('/c', "`"$nextCommand`" dev --webpack -p 3001") `
      -WorkingDirectory $projectRoot `
      -WindowStyle Minimized
  } catch {
    Show-StartupError "Could not start the ImovelHub server. $($_.Exception.Message)"
    exit 1
  }
}

while ((Get-Date) -lt $deadline) {
  if (Test-ImovelHubAvailable) {
    Start-Process $siteUrl
    exit 0
  }
  Start-Sleep -Seconds 2
}

Show-StartupError 'ImovelHub did not start within 2 minutes. Check the project dependencies and port 3001.'
exit 1
