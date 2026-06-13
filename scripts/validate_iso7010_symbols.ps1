$ErrorActionPreference = "Stop"

$dir = Join-Path $PSScriptRoot "..\images\iso7010"
if (-not (Test-Path $dir)) {
  Write-Output "Missing folder: $dir"
  exit 1
}

$files = Get-ChildItem $dir -File | Where-Object { $_.Name -match "\.(svg|png)$" -or $_.Name -match "\.svg\.png$" }
if (-not $files) {
  Write-Output "No SVG or PNG files found in $dir"
  exit 1
}

$valid = @()
$invalid = @()

foreach ($file in $files) {
  $bytes = [System.IO.File]::ReadAllBytes($file.FullName)
  $isPng = $bytes.Length -ge 8 -and
    $bytes[0] -eq 0x89 -and
    $bytes[1] -eq 0x50 -and
    $bytes[2] -eq 0x4e -and
    $bytes[3] -eq 0x47

  $head = ""
  if (-not $isPng) {
    $head = (Get-Content $file.FullName -TotalCount 5) -join "`n"
  }

  if ($isPng -or $head -match "<svg[\s>]") {
    $valid += $file
  } else {
    $invalid += $file
  }
}

Write-Output "Valid ISO symbol images: $($valid.Count)"
Write-Output "Invalid or HTML wrapper files: $($invalid.Count)"

$requiredCodes = @("M003", "M004", "M008", "M009", "M010", "M013", "M014", "M015", "M016", "M017", "M026", "M059")
$presentCodes = $valid | ForEach-Object {
  if ($_.Name -match "ISO_7010_(M\d{3})") { $matches[1] }
}
$missingCodes = $requiredCodes | Where-Object { $presentCodes -notcontains $_ }

Write-Output "Required PPE ISO codes present: $(($requiredCodes.Count - $missingCodes.Count))/$($requiredCodes.Count)"
if ($missingCodes.Count -gt 0) {
  Write-Output "Missing required PPE ISO codes: $($missingCodes -join ', ')"
}

if ($invalid.Count -gt 0) {
  Write-Output ""
  Write-Output "These files are not raw SVG images:"
  $invalid | ForEach-Object { Write-Output " - $($_.Name)" }
  Write-Output ""
  Write-Output "Open the Wikimedia file page, click the original SVG/file preview, then save the raw SVG content."
}
