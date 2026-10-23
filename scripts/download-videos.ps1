$ErrorActionPreference = 'Continue'
$root = 'C:\Users\Dhairya Shah\.t3\projects\openoffice'
Set-Location $root
$log = Join-Path $root 'research\download.log'
New-Item -ItemType Directory -Force -Path (Join-Path $root 'research\videos') | Out-Null

$urls = @(
  'https://www.youtube.com/watch?v=Uriqg5T8Uzo',
  'https://www.youtube.com/watch?v=0Y5ai_u5etI',
  'https://www.youtube.com/watch?v=YJjYHRIiDzQ',
  'https://www.youtube.com/watch?v=fL1hd6NlPsM',
  'https://www.youtube.com/watch?v=IvAHYchBIak',
  'https://www.youtube.com/watch?v=s2EzLiIL5B4',
  'https://www.youtube.com/watch?v=uELfu0qaIJQ',
  'https://www.youtube.com/watch?v=k2UfPX5caCo',
  'https://www.youtube.com/watch?v=mFqCvTOpOL0',
  'https://www.youtube.com/watch?v=1-gby_qDsHo',
  'https://www.youtube.com/watch?v=2MCmnr2L50o',
  'https://www.youtube.com/watch?v=K-9C1t30Yr4',
  'https://www.youtube.com/watch?v=L4TPfHitbKI'
)

foreach ($u in $urls) {
  "[$(Get-Date -Format o)] START $u" | Out-File -Append -Encoding utf8 $log
  & yt-dlp --no-update --no-warnings --no-playlist --force-ipv4 `
    --extractor-args "youtube:player_client=android" `
    -f "18" `
    --write-auto-subs --sub-langs "en.*" --convert-subs srt `
    -o "research/videos/%(id)s.%(ext)s" $u *>> $log
  "[$(Get-Date -Format o)] END $u exit=$LASTEXITCODE" | Out-File -Append -Encoding utf8 $log
}
"[$(Get-Date -Format o)] ALL DONE" | Out-File -Append -Encoding utf8 $log
