# Open Google Chrome at mobile viewport (430x932) for Pixel 10 Pro / iPhone 16 Pro Max.
# Requires Chrome installed. Run from basestrike: .\scripts\open-chrome-mobile.ps1
$url = "http://localhost:3000"
$width = 430
$height = 932
$chromePaths = @(
    "${env:ProgramFiles}\Google\Chrome\Application\chrome.exe",
    "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
    "chrome.exe"
)
$chrome = $null
foreach ($p in $chromePaths) {
    if ($p -eq "chrome.exe") {
        $chrome = Get-Command chrome -ErrorAction SilentlyContinue
        if ($chrome) { $chrome = $chrome.Source }
    } else {
        if (Test-Path $p) { $chrome = $p; break }
    }
    if ($chrome) { break }
}
if (-not $chrome) {
    Write-Error "Google Chrome not found. Install Chrome or add it to PATH."
    exit 1
}
Start-Process -FilePath $chrome -ArgumentList "--window-size=$width,$height", $url
