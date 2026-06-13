param(
  [string]$OutputDir = (Join-Path $PSScriptRoot "..\images\iso7010"),
  [int]$DelayMilliseconds = 1500,
  [string]$UserAgent = "SDS-AI-Placard-Generator/1.0 (local safety placard project)"
)

$ErrorActionPreference = "Stop"

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

$api = "https://en.wikipedia.org/w/api.php"
$headers = @{ "User-Agent" = $UserAgent }
$parse = Invoke-RestMethod -Uri "${api}?action=parse&page=ISO_7010&prop=images&format=json" -Headers $headers
$images = $parse.parse.images |
  Where-Object { $_ -match "^ISO_7010_[EFMPW][0-9]{3}" } |
  Sort-Object -Unique

$metadata = @()

for ($i = 0; $i -lt $images.Count; $i += 20) {
  $end = [Math]::Min($i + 19, $images.Count - 1)
  $chunk = $images[$i..$end]
  $titles = ($chunk | ForEach-Object { "File:" + $_ }) -join "|"
  $queryUrl = $api + "?action=query&prop=imageinfo&iiprop=url|mime&format=json&titles=" + [uri]::EscapeDataString($titles)
  $info = Invoke-RestMethod -Uri $queryUrl -Headers $headers

  foreach ($page in $info.query.pages.PSObject.Properties.Value) {
    if (-not $page.imageinfo) { continue }

    $filename = $page.title -replace "^File:", ""
    $url = $page.imageinfo[0].url
    $local = Join-Path $OutputDir $filename

    if (-not (Test-Path $local)) {
      Invoke-WebRequest -Uri $url -Headers $headers -OutFile $local
      Start-Sleep -Milliseconds $DelayMilliseconds
    }

    $code = [regex]::Match($filename, "ISO_7010_([EFMPW][0-9]{3})").Groups[1].Value
    $label = $filename -replace "^ISO_7010_[EFMPW][0-9]{3}_?-?_?", "" -replace "\.svg$", "" -replace "_", " "
    if ([string]::IsNullOrWhiteSpace($label)) { $label = $code }

    $metadata += [pscustomobject]@{
      code = $code
      label = $label
      file = "images/iso7010/$filename"
      source = $url
      mime = $page.imageinfo[0].mime
    }
  }
}

$metadata |
  Sort-Object code, file |
  ConvertTo-Json -Depth 3 |
  Set-Content -Encoding UTF8 (Join-Path $OutputDir "metadata.json")

Write-Output "Downloaded $((Get-ChildItem $OutputDir -Filter *.svg).Count) ISO 7010 SVG files to $OutputDir"
