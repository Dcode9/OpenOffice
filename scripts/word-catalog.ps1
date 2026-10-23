param(
  [int]$Limit = 0,
  [string]$Out = "research/word-ui/word-catalog.jsonl"
)

$ErrorActionPreference = 'Stop'
$data = Get-Content -Raw -LiteralPath 'research/word-ui/word-controls.json' | ConvertFrom-Json
$ids = @($data.ids)
if ($Limit -gt 0) { $ids = $ids[0..([Math]::Min($Limit, $ids.Count) - 1)] }

$outPath = Join-Path (Get-Location) $Out
if (Test-Path $outPath) { Remove-Item -LiteralPath $outPath -Force }

$sw = [System.Diagnostics.Stopwatch]::StartNew()
$word = New-Object -ComObject Word.Application
$doc = $null
try {
  $word.Visible = $false
  $word.DisplayAlerts = 0
  $word.ScreenUpdating = $false
  $word.Options.SaveInterval = 0
  $word.Options.SaveNormalPrompt = $false
  $doc = $word.Documents.Add()
  $bars = $word.CommandBars
  $i = 0
  $ok = 0
  $bad = 0
  foreach ($id in $ids) {
    $i++
    $entry = [ordered]@{ id = $id }
    foreach ($m in @('Label', 'Screentip', 'Supertip', 'Enabled', 'Visible', 'Pressed')) {
      try {
        $v = switch ($m) {
          'Label' { $bars.GetLabelMso($id) }
          'Screentip' { $bars.GetScreentipMso($id) }
          'Supertip' { $bars.GetSupertipMso($id) }
          'Enabled' { $bars.GetEnabledMso($id) }
          'Visible' { $bars.GetVisibleMso($id) }
          'Pressed' { $bars.GetPressedMso($id) }
        }
        $entry[$m.ToLower()] = $v
        if ($m -eq 'Label') { $ok++ }
      } catch {
        if ($m -eq 'Label') {
          $bad++
          $entry['labelError'] = $_.Exception.Message
        }
        $entry[$m.ToLower()] = $null
      }
    }
    ($entry | ConvertTo-Json -Compress) | Add-Content -LiteralPath $outPath -Encoding utf8
    if ($i % 250 -eq 0) {
      Write-Host ("{0}/{1}  ok={2} bad={3}  {4:n1}s" -f $i, $ids.Count, $ok, $bad, $sw.Elapsed.TotalSeconds)
    }
  }
  Write-Host ("DONE {0} ids  ok={1} bad={2}  {3:n1}s" -f $ids.Count, $ok, $bad, $sw.Elapsed.TotalSeconds)
} finally {
  if ($doc) { try { $doc.Close(0) } catch {} }
  try { $word.Quit(0) } catch {}
  foreach ($o in @($doc, $word)) {
    if ($o) { try { [System.Runtime.InteropServices.Marshal]::ReleaseComObject($o) | Out-Null } catch {} }
  }
  [GC]::Collect()
  [GC]::WaitForPendingFinalizers()
}
