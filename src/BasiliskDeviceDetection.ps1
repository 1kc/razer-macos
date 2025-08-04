Write-Host "=== Basilisk V3 X HyperSpeed Detection ===" -ForegroundColor Green

# Check for the specific device
$basilisk = Get-PnpDevice | Where-Object {
    ($_.HardwareID -like "*VID_1532*PID_00B9*") -or 
    ($_.FriendlyName -like "*Basilisk*")
}

if ($basilisk) {
    Write-Host "✓ Basilisk Found!" -ForegroundColor Green
    $basilisk | ForEach-Object {
        Write-Host "  Name: $($_.FriendlyName)" -ForegroundColor Yellow
        Write-Host "  Status: $($_.Status)" -ForegroundColor Cyan
        # Fix for null array issue - check if HardwareID exists and is not empty
        if ($_.HardwareID -and $_.HardwareID.Count -gt 0) {
            Write-Host "  Hardware ID: $($_.HardwareID[0])" -ForegroundColor Gray
        } else {
            Write-Host "  Hardware ID: Not available" -ForegroundColor Gray
        }
    }
} else {
    Write-Host "✗ Basilisk not found. Checking all Razer devices..." -ForegroundColor Red
    $razer = Get-PnpDevice | Where-Object {$_.FriendlyName -like "*Razer*"}
    if ($razer) {
        $razer | ForEach-Object {
            Write-Host "  - $($_.FriendlyName)" -ForegroundColor White
        }
    } else {
        Write-Host "No Razer devices detected!" -ForegroundColor Red
    }
}

# Check USB devices
Write-Host "`nUSB Device Check:" -ForegroundColor Yellow
$usb = Get-WmiObject Win32_USBHub | Where-Object {$_.DeviceID -like "*VID_1532*PID_00B9*"}
if ($usb) {
    Write-Host "✓ USB connection confirmed" -ForegroundColor Green
} else {
    Write-Host "✗ USB connection not detected" -ForegroundColor Red
}