# Setup Windows Task Scheduler to auto-push every 30 minutes
# Run this script with Administrator privileges

$scriptPath = "P:\Projects\E-commers\boilabin-marketplace\scripts\auto-push.ps1"
$taskName = "GitAutoPush-BoilabinMarketplace"
$taskDescription = "Automatically commit and push changes to GitHub every 30 minutes"

# Check if running as admin
$currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
$principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
$isAdmin = $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator" -ForegroundColor Red
    Write-Host "Please open PowerShell as Administrator and run again" -ForegroundColor Yellow
    exit 1
}

# Verify script exists
if (-not (Test-Path $scriptPath)) {
    Write-Host "ERROR: Script not found at $scriptPath" -ForegroundColor Red
    exit 1
}

# Check if task already exists
$existingTask = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue

if ($existingTask) {
    Write-Host "Task '$taskName' already exists" -ForegroundColor Yellow
    $response = Read-Host "Do you want to remove and recreate it? (y/n)"
    
    if ($response -eq 'y') {
        Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
        Write-Host "Task removed" -ForegroundColor Green
    } else {
        Write-Host "Setup cancelled" -ForegroundColor Yellow
        exit 0
    }
}

# Create the scheduled task
$action = New-ScheduledTaskAction `
    -Execute "PowerShell.exe" `
    -Argument "-NoProfile -ExecutionPolicy Bypass -File '$scriptPath'"

$trigger = New-ScheduledTaskTrigger `
    -RepetitionInterval (New-TimeSpan -Minutes 30) `
    -AtStartup

$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -RunOnlyIfNetworkAvailable

Register-ScheduledTask `
    -TaskName $taskName `
    -Action $action `
    -Trigger $trigger `
    -Settings $settings `
    -Description $taskDescription `
    -Force

Write-Host "✓ Scheduled task created successfully!" -ForegroundColor Green
Write-Host "" -ForegroundColor White
Write-Host "Task Details:" -ForegroundColor Cyan
Write-Host "  Name: $taskName" -ForegroundColor White
Write-Host "  Schedule: Every 30 minutes" -ForegroundColor White
Write-Host "  Script: $scriptPath" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "Setup complete! Auto-push is now active." -ForegroundColor Green
