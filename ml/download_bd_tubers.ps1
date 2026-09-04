param([Parameter(Mandatory=$true)][string]$Root)
$ErrorActionPreference='Stop'
$folder=Join-Path $Root 'downloads/bd-original'
New-Item -ItemType Directory -Force -Path $folder | Out-Null
$files=Invoke-RestMethod 'https://data.mendeley.com/public-api/datasets/5m38z6jthb/files?folder_id=af72f9f1-f7ed-47b6-9ab7-07f79b822ec1&version=1'
$files | ForEach-Object -Parallel {
    $file=$_
    $target=Join-Path $using:folder ([IO.Path]::GetFileName($file.filename))
    $expected=$file.content_details.sha256_hash
    if ((Test-Path -LiteralPath $target) -and (Get-FileHash -LiteralPath $target -Algorithm SHA256).Hash.ToLower() -eq $expected) { return }
    $url=[uri]$file.content_details.download_url
    if ($url.Scheme -ne 'https' -or $url.Host -ne 'data.mendeley.com') { throw 'Unexpected download source' }
    Invoke-WebRequest -Uri $url -OutFile $target -TimeoutSec 60 -MaximumRetryCount 2 -RetryIntervalSec 1
    if ((Get-FileHash -LiteralPath $target -Algorithm SHA256).Hash.ToLower() -ne $expected) { throw 'Checksum mismatch' }
    Write-Output "Verified $($file.filename)"
} -ThrottleLimit 4
if ((Get-ChildItem -LiteralPath $folder -Filter '*.jpg').Count -ne $files.Count) { throw 'Incomplete originals' }
Compress-Archive -Path (Join-Path $folder '*.jpg') -DestinationPath (Join-Path $Root 'downloads/bd_healthy.zip') -Force
Write-Output "Verified and archived $($files.Count) healthy Bangladesh originals."
