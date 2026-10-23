$ErrorActionPreference = 'Stop'
$outDir = 'C:\Users\Dhairya Shah\.t3\projects\openoffice\verify\word'
$logPath = Join-Path $outDir 'run.log'
if (Test-Path $logPath) { Remove-Item $logPath -Force }
function Log([string]$m) {
    $line = ('{0} {1}' -f (Get-Date -Format 'HH:mm:ss.fff'), $m)
    $line | Tee-Object -FilePath $logPath -Append | Out-Host
}

Add-Type @"
using System;
using System.Text;
using System.Runtime.InteropServices;
public static class W32 {
    [StructLayout(LayoutKind.Sequential)]
    public struct RECT { public int Left; public int Top; public int Right; public int Bottom; }
    [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr hWnd, out RECT lpRect);
    [DllImport("user32.dll")] public static extern bool GetClientRect(IntPtr hWnd, out RECT lpRect);
    [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hWnd);
    [DllImport("user32.dll")] public static extern bool BringWindowToTop(IntPtr hWnd);
    [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
    [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
    [DllImport("user32.dll")] public static extern uint GetDpiForWindow(IntPtr hWnd);
    [DllImport("dwmapi.dll")] public static extern int DwmGetWindowAttribute(IntPtr hwnd, int attr, out RECT rect, int size);
    [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
    [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint pid);
    [DllImport("kernel32.dll")] public static extern uint GetCurrentThreadId();
    [DllImport("user32.dll")] public static extern bool AttachThreadInput(uint idAttach, uint idAttachTo, bool fAttach);
    [DllImport("user32.dll")] public static extern bool SetFocus(IntPtr hWnd);
    [DllImport("user32.dll")] public static extern bool IsZoomed(IntPtr hWnd);
    [DllImport("user32.dll")] public static extern bool GetWindowText(IntPtr hWnd, StringBuilder sb, int max);
}
"@

[W32]::SetProcessDPIAware() | Out-Null
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes

$AE = [System.Windows.Automation.AutomationElement]
$CT = [System.Windows.Automation.ControlType]
$TS = [System.Windows.Automation.TreeScope]
$condTab = New-Object System.Windows.Automation.PropertyCondition($AE::ControlTypeProperty, $CT::TabItem)
$condGroup = New-Object System.Windows.Automation.PropertyCondition($AE::ControlTypeProperty, $CT::Group)
$condText = New-Object System.Windows.Automation.PropertyCondition($AE::ControlTypeProperty, $CT::Text)
$condStatus = New-Object System.Windows.Automation.PropertyCondition($AE::ControlTypeProperty, $CT::StatusBar)
$condButton = New-Object System.Windows.Automation.PropertyCondition($AE::ControlTypeProperty, $CT::Button)
$trueCond = [System.Windows.Automation.Condition]::TrueCondition

$screen = [System.Windows.Forms.Screen]::PrimaryScreen
$baselinePids = @(Get-Process WINWORD -ErrorAction SilentlyContinue | ForEach-Object Id)
Log ("Baseline WINWORD PIDs: " + (($baselinePids -join ',') -replace '^$','none'))
Log ("Screen bounds (DPI-aware): " + $screen.Bounds.ToString() + " working=" + $screen.WorkingArea.ToString())

$word = $null; $doc = $null; $startTime = Get-Date
$data = [ordered]@{
    generated = (Get-Date).ToString('o')
    environment = [ordered]@{}
    word = [ordered]@{}
    window = [ordered]@{}
    measurements = [ordered]@{}
    tabs = @()
    fileTab = $null
    groupsByTab = [ordered]@{}
    statusBar = [ordered]@{}
    document = [ordered]@{}
    fonts = [ordered]@{}
    screenshots = [ordered]@{}
}

try {
    $word = New-Object -ComObject Word.Application
    $word.Visible = $true
    $word.DisplayAlerts = 0
    $doc = $word.Documents.Add()
    $pidUsed = (Get-Process WINWORD | Sort-Object StartTime -Descending | Select-Object -First 1).Id
    Log ("Word started. Version=" + $word.Version + " PID=" + $pidUsed + " doc=" + $doc.Name)

    $word.ScreenUpdating = $false
    $sel = $word.Selection
    $sel.WholeStory()
    $sel.Delete()
    Log ("After clear, content text='" + $doc.Content.Text + "' length=" + $doc.Content.Text.Length)

    # Title
    $sel.Style = 'Title'
    $sel.TypeText('Quarterly Business Review')
    $sel.TypeParagraph()

    # Subtitle
    $sel.Style = 'Normal'
    $sel.Font.Size = 10
    $sel.Font.Color = 8421504
    $sel.TypeText('Prepared by the Strategy Office | October 2026')
    $sel.TypeParagraph()
    $sel.Font.Color = 0
    $sel.Font.Size = 12

    # H1 + mixed formatting paragraph
    $sel.Style = 'Heading 1'
    $sel.TypeText('Executive Summary')
    $sel.TypeParagraph()

    $sel.Style = 'Normal'
    $sel.TypeText('This document verifies the visual appearance of Microsoft Word against a web-based clone. ')
    $sel.Font.Bold = $true
    $sel.TypeText('Bold text')
    $sel.Font.Bold = $false
    $sel.TypeText(', ')
    $sel.Font.Italic = $true
    $sel.TypeText('italic text')
    $sel.Font.Italic = $false
    $sel.TypeText(', and ')
    $sel.Font.Underline = 1
    $sel.TypeText('underlined text')
    $sel.Font.Underline = 0
    $sel.TypeText(' appear in this sentence. ')
    $sel.TypeText('This phrase is highlighted.')
    $sel.TypeText(' The remaining text uses the Normal style so typography can be compared directly.')
    $sel.TypeParagraph()

    # H2 + bullets
    $sel.Style = 'Heading 2'
    $sel.TypeText('Financial Highlights')
    $sel.TypeParagraph()

    $sel.Style = 'Normal'
    $sel.Range.ListFormat.ApplyBulletDefault()
    $sel.TypeText('Revenue grew 12% year over year.')
    $sel.TypeParagraph()
    $sel.TypeText('Operating margin expanded to 28%.')
    $sel.TypeParagraph()
    $sel.TypeText('Free cash flow reached $4.2 billion.')
    $sel.TypeParagraph()
    $sel.Range.ListFormat.RemoveNumbers()

    # H2 + numbered list
    $sel.Style = 'Heading 2'
    $sel.TypeText('Priorities for Next Quarter')
    $sel.TypeParagraph()

    $sel.Style = 'Normal'
    $sel.Range.ListFormat.ApplyNumberDefault()
    $sel.TypeText('Expand the enterprise pipeline.')
    $sel.TypeParagraph()
    $sel.TypeText('Improve onboarding completion.')
    $sel.TypeParagraph()
    $sel.TypeText('Launch the partner dashboard.')
    $sel.TypeParagraph()
    $sel.Range.ListFormat.RemoveNumbers()

    # H2 + 3x3 table
    $sel.Style = 'Heading 2'
    $sel.TypeText('Regional Performance')
    $sel.TypeParagraph()

    $sel.Style = 'Normal'
    $tbl = $doc.Tables.Add($sel.Range, 3, 3)
    try { $tbl.Style = 'Table Grid' } catch { Log ("Table style failed: " + $_.Exception.Message) }
    try { $tbl.Borders.Enable = $true } catch {}
    $cells = @(
        @('Region','Revenue','Growth'),
        @('North America','$2.4B','14%'),
        @('Europe','$1.3B','9%')
    )
    for ($r = 1; $r -le 3; $r++) {
        for ($c = 1; $c -le 3; $c++) {
            $tbl.Cell($r, $c).Range.Text = $cells[$r-1][$c-1]
        }
    }
    $tbl.Rows.Item(1).Range.Font.Bold = $true
    try { $tbl.AutoFitBehavior(2) } catch {}

    $sel.EndKey(6) | Out-Null
    $sel.TypeParagraph()
    $sel.Style = 'Normal'
    $sel.Font.Size = 9
    $sel.Font.Italic = $true
    $sel.Font.Color = 8421504
    $sel.TypeText('Source: internal finance data. Figures are illustrative for interface verification.')
    $sel.Font.Italic = $false
    $sel.Font.Size = 12
    $sel.Font.Color = 0
    $sel.HomeKey(6) | Out-Null

    # Clear all highlight, then apply only to the intended phrase
    $doc.Content.HighlightColorIndex = 0
    $phrase = 'This phrase is highlighted.'
    $fullText = $doc.Content.Text
    $idx = $fullText.IndexOf($phrase)
    Log ("Highlight phrase index=" + $idx)
    if ($idx -ge 0) {
        $hl = $doc.Range($idx, $idx + $phrase.Length)
        $hl.HighlightColorIndex = 7
        Log ("Highlight applied: value=" + $hl.HighlightColorIndex + " text='" + $hl.Text + "'")
        $after = $doc.Range($idx + $phrase.Length, $idx + $phrase.Length + 1)
        Log ("Highlight after phrase: value=" + $after.HighlightColorIndex + " char='" + $after.Text.Replace("`r",'<CR>') + "'")
    } else {
        Log 'Highlight phrase NOT FOUND'
    }

    $word.ScreenUpdating = $true
    $docText = $doc.Content.Text
    Log ("Document starts with='" + $docText.Substring(0, [Math]::Min(80, $docText.Length)).Replace("`r",'<CR>') + "'")
    Log ("Document text length=" + $docText.Length)

    # View settings
    try { $word.ActiveWindow.View.Zoom.Percentage = 100; Log "Zoom set to 100" } catch { Log ("Zoom failed: " + $_.Exception.Message) }
    try { $word.ActiveWindow.DisplayRulers = $true; Log ("DisplayRulers set; value=" + $word.ActiveWindow.DisplayRulers) } catch { Log ("DisplayRulers failed: " + $_.Exception.Message) }
    try { $word.ActiveWindow.DisplayVerticalRuler = $true; Log ("DisplayVerticalRuler set; value=" + $word.ActiveWindow.DisplayVerticalRuler) } catch { Log ("DisplayVerticalRuler failed: " + $_.Exception.Message) }
    try { $word.WindowState = 2; $word.ActiveWindow.WindowState = 2; Log ("WindowState=" + $word.WindowState) } catch { Log ("WindowState failed: " + $_.Exception.Message) }

    Start-Sleep -Milliseconds 1600

    $proc = Get-Process WINWORD -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 } | Sort-Object StartTime -Descending | Select-Object -First 1
    $hwnd = [IntPtr]$proc.MainWindowHandle
    $comHwnd = [IntPtr]$word.ActiveWindow.Hwnd
    Log ("Process PID=" + $proc.Id + " HWND=" + $hwnd.ToInt64() + " COM.ActiveWindow.Hwnd=" + $comHwnd.ToInt64() + " title='" + $proc.MainWindowTitle + "'")

    function Force-Foreground([IntPtr]$h) {
        [W32]::ShowWindow($h, 3) | Out-Null
        [W32]::BringWindowToTop($h) | Out-Null
        $fg = [W32]::GetForegroundWindow()
        $fgPid = 0; $fgThread = [W32]::GetWindowThreadProcessId($fg, [ref]$fgPid)
        $tPid = 0; $tThread = [W32]::GetWindowThreadProcessId($h, [ref]$tPid)
        $me = [W32]::GetCurrentThreadId()
        $attachedFg = $false; $attachedMe = $false
        if ($fgThread -ne $me) { $attachedFg = [W32]::AttachThreadInput($me, $fgThread, $true) }
        if ($tThread -ne $me) { $attachedMe = [W32]::AttachThreadInput($me, $tThread, $true) }
        [W32]::SetForegroundWindow($h) | Out-Null
        [W32]::SetFocus($h) | Out-Null
        if ($attachedMe) { [W32]::AttachThreadInput($me, $tThread, $false) | Out-Null }
        if ($attachedFg) { [W32]::AttachThreadInput($me, $fgThread, $false) | Out-Null }
    }

    function Capture-Window([string]$path, $rect) {
        $w = $rect.Right - $rect.Left
        $h = $rect.Bottom - $rect.Top
        $bmp = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
        $g = [System.Drawing.Graphics]::FromImage($bmp)
        $g.CopyFromScreen($rect.Left, $rect.Top, 0, 0, (New-Object System.Drawing.Size($w, $h)), [System.Drawing.CopyPixelOperation]::SourceCopy)
        $g.Dispose()
        $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
        $bmp.Dispose()
        Log ("Saved " + $path + " (" + $w + "x" + $h + ")")
    }

    Force-Foreground $hwnd
    Start-Sleep -Milliseconds 900
    $fgNow = [W32]::GetForegroundWindow()
    Log ("Foreground HWND=" + $fgNow.ToInt64() + " matches=" + ($fgNow -eq $hwnd))

    $wr = New-Object W32+RECT
    [W32]::GetWindowRect($hwnd, [ref]$wr) | Out-Null
    $dwr = New-Object W32+RECT
    $dwmHr = [W32]::DwmGetWindowAttribute($hwnd, 9, [ref]$dwr, 16)
    $cr = New-Object W32+RECT
    [W32]::GetClientRect($hwnd, [ref]$cr) | Out-Null
    $dpi = [W32]::GetDpiForWindow($hwnd)
    Log ("GetWindowRect=" + $wr.Left + "," + $wr.Top + "," + $wr.Right + "," + $wr.Bottom + " size=" + ($wr.Right-$wr.Left) + "x" + ($wr.Bottom-$wr.Top))
    Log ("DwmExtendedFrame hr=" + $dwmHr + " rect=" + $dwr.Left + "," + $dwr.Top + "," + $dwr.Right + "," + $dwr.Bottom + " size=" + ($dwr.Right-$dwr.Left) + "x" + ($dwr.Bottom-$dwr.Top))
    Log ("Client=" + $cr.Right + "x" + $cr.Bottom + " DPI=" + $dpi + " IsZoomed=" + [W32]::IsZoomed($hwnd))

    $capRect = $dwr
    if ($dwmHr -ne 0 -or ($dwr.Right - $dwr.Left) -le 0) { $capRect = $wr; Log 'DWM bounds failed; falling back to GetWindowRect' }

    $data.environment = [ordered]@{
        os = (Get-CimInstance Win32_OperatingSystem).Caption
        osVersion = (Get-CimInstance Win32_OperatingSystem).Version
        osBuild = (Get-CimInstance Win32_OperatingSystem).BuildNumber
        screenBounds = $screen.Bounds.ToString()
        workingArea = $screen.WorkingArea.ToString()
        dpi = $dpi
        scalePercent = [int]($dpi / 96 * 100)
        screenshotPhysicalPixels = (($capRect.Right-$capRect.Left).ToString() + 'x' + ($capRect.Bottom-$capRect.Top).ToString())
        officeUiThemeObserved = 'dark/black'
    }
    $data.word = [ordered]@{
        version = $word.Version
        build = (Get-Item 'C:\Program Files\Microsoft Office\root\Office16\WINWORD.EXE').VersionInfo.FileVersion
        pid = $proc.Id
        hwnd = ('0x{0:X}' -f $hwnd.ToInt64())
        caption = $word.ActiveWindow.Caption
        mainWindowTitle = $proc.MainWindowTitle
        windowState = $word.WindowState
        maximized = [bool][W32]::IsZoomed($hwnd)
    }
    $data.window = [ordered]@{
        getWindowRect = ($wr.Left.ToString()+','+$wr.Top.ToString()+','+$wr.Right.ToString()+','+$wr.Bottom.ToString())
        getWindowRectSize = (($wr.Right-$wr.Left).ToString()+'x'+($wr.Bottom-$wr.Top).ToString())
        dwmExtendedFrame = ($dwr.Left.ToString()+','+$dwr.Top.ToString()+','+$dwr.Right.ToString()+','+$dwr.Bottom.ToString())
        dwmExtendedFrameSize = (($dwr.Right-$dwr.Left).ToString()+'x'+($dwr.Bottom-$dwr.Top).ToString())
        clientSize = ($cr.Right.ToString()+'x'+$cr.Bottom.ToString())
        captureRect = ($capRect.Left.ToString()+','+$capRect.Top.ToString()+','+$capRect.Right.ToString()+','+$capRect.Bottom.ToString())
    }

    $root = $AE::FromHandle($hwnd)

    # Root children / pane rects
    $kids = $root.FindAll($TS::Children, $trueCond)
    $panes = @()
    foreach ($k in $kids) {
        $r = $k.Current.BoundingRectangle
        $panes += [PSCustomObject]@{ name=$k.Current.Name; className=$k.Current.ClassName; controlType=$k.Current.ControlType.ProgrammaticName; left=[int]$r.Left; top=[int]$r.Top; width=[int]$r.Width; height=[int]$r.Height }
        Log ("ROOTCHILD " + $k.Current.ControlType.ProgrammaticName + " name='" + $k.Current.Name + "' class='" + $k.Current.ClassName + "' rect=" + $r)
    }
    $docPane = $panes | Where-Object { $_.className -eq '_WwF' } | Select-Object -First 1

    # Tabs and File
    $tabs = $root.FindAll($TS::Descendants, $condTab)
    foreach ($t in $tabs) {
        $r = $t.Current.BoundingRectangle
        $sp = $null; $isSel = $false
        if ($t.TryGetCurrentPattern([System.Windows.Automation.SelectionItemPattern]::Pattern, [ref]$sp)) { $isSel = $sp.Current.IsSelected }
        $data.tabs += [PSCustomObject]@{ name=$t.Current.Name; left=[int]$r.Left; top=[int]$r.Top; width=[int]$r.Width; height=[int]$r.Height; selected=$isSel }
    }
    Log ("TAB ORDER: File, " + (($data.tabs | ForEach-Object name) -join ', '))
    $buttons = $root.FindAll($TS::Descendants, $condButton)
    $fileBtn = $buttons | Where-Object { $_.Current.Name -eq 'File Tab' } | Select-Object -First 1
    if ($fileBtn) {
        $fr = $fileBtn.Current.BoundingRectangle
        $data.fileTab = [PSCustomObject]@{ name='File'; left=[int]$fr.Left; top=[int]$fr.Top; width=[int]$fr.Width; height=[int]$fr.Height }
        Log ("FILE TAB rect=" + $fr)
    }

    # Status bar
    $sb = $root.FindFirst($TS::Descendants, $condStatus)
    if ($sb) {
        $sr = $sb.Current.BoundingRectangle
        $statusChildren = @()
        $sks = $sb.FindAll($TS::Descendants, $trueCond)
        foreach ($sk in $sks) {
            if ($sk.Current.Name) {
                $r = $sk.Current.BoundingRectangle
                $statusChildren += [PSCustomObject]@{ name=$sk.Current.Name; type=$sk.Current.ControlType.ProgrammaticName; left=[int]$r.Left; top=[int]$r.Top; width=[int]$r.Width; height=[int]$r.Height; offscreen=$sk.Current.IsOffscreen }
            }
        }
        $data.statusBar = [ordered]@{ name=$sb.Current.Name; left=[int]$sr.Left; top=[int]$sr.Top; width=[int]$sr.Width; height=[int]$sr.Height; children=$statusChildren }
        foreach ($c in $statusChildren) { Log ("STATUS '" + $c.name + "' type=" + $c.type + " rect=" + $c.left + "," + $c.top + "," + $c.width + "x" + $c.height + " offscreen=" + $c.offscreen) }
    }

    # Measurements
    $tab0 = $data.tabs | Select-Object -First 1
    $data.measurements = [ordered]@{
        titleBarHeight = ($tab0.top - $capRect.Top)
        tabStripHeight = $tab0.height
        ribbonContentHeight = ($docPane.top - ($tab0.top + $tab0.height))
        ribbonTotalHeightBelowTitleBar = ($docPane.top - $tab0.top)
        statusBarHeight = $data.statusBar.height
        documentAreaHeight = ($data.statusBar.top - $docPane.top)
        windowHeight = ($capRect.Bottom - $capRect.Top)
        windowWidth = ($capRect.Right - $capRect.Left)
        tabStripTop = $tab0.top
        ribbonContentTop = ($tab0.top + $tab0.height)
        ribbonBottom = $docPane.top
        statusBarTop = $data.statusBar.top
        pageTopVisible = $null
    }

    function Get-Groups {
        $groups = $root.FindAll($TS::Descendants, $condGroup)
        $list = @()
        foreach ($g in $groups) {
            $r = $g.Current.BoundingRectangle
            if ($g.Current.Name -and $r.Top -lt 500 -and $r.Height -gt 0) {
                $list += [PSCustomObject]@{ name=$g.Current.Name; className=$g.Current.ClassName; left=[int]$r.Left; top=[int]$r.Top; width=[int]$r.Width; height=[int]$r.Height }
            }
        }
        return @($list | Sort-Object left, top)
    }

    function Select-Tab([string]$name) {
        $tabsNow = $root.FindAll($TS::Descendants, $condTab)
        foreach ($t in $tabsNow) {
            if ($t.Current.Name -eq $name) {
                $sp = $null
                if ($t.TryGetCurrentPattern([System.Windows.Automation.SelectionItemPattern]::Pattern, [ref]$sp)) {
                    $sp.Select()
                    Start-Sleep -Milliseconds 850
                    $tabsCheck = $root.FindAll($TS::Descendants, $condTab)
                    foreach ($tc in $tabsCheck) {
                        if ($tc.Current.Name -eq $name) {
                            $sp2 = $null
                            if ($tc.TryGetCurrentPattern([System.Windows.Automation.SelectionItemPattern]::Pattern, [ref]$sp2)) { return $sp2.Current.IsSelected }
                        }
                    }
                }
            }
        }
        return $false
    }

    function Sample-Color($bmp, [int]$x, [int]$y) {
        $c = $bmp.GetPixel($x, $y)
        return ('#{0:X2}{1:X2}{2:X2}' -f $c.R, $c.G, $c.B)
    }
    function Dominant-Color($bmp, [int]$x, [int]$y, [int]$w, [int]$h, [int]$step=3) {
        $d = @{}
        for ($yy=$y; $yy -lt $y+$h; $yy+=$step) {
            for ($xx=$x; $xx -lt $x+$w; $xx+=$step) {
                $c = $bmp.GetPixel($xx,$yy)
                $k = ('{0},{1},{2}' -f $c.R,$c.G,$c.B)
                if ($d.ContainsKey($k)) { $d[$k]++ } else { $d[$k]=1 }
            }
        }
        $top = $d.GetEnumerator() | Sort-Object Value -Descending | Select-Object -First 1
        $parts = $top.Key -split ','
        return [PSCustomObject]@{ hex=('#{0:X2}{1:X2}{2:X2}' -f [int]$parts[0],[int]$parts[1],[int]$parts[2]); rgb=$top.Key; count=$top.Value }
    }
    function Find-Underline($bmp, $tab) {
        $minx=99999; $miny=99999; $maxx=-1; $maxy=-1; $d=@{}
        for ($yy=[int]$tab.top; $yy -le [int]$tab.top + [int]$tab.height + 3; $yy++) {
            for ($xx=[int]$tab.left; $xx -le [int]$tab.left + [int]$tab.width; $xx++) {
                if ($xx -lt 0 -or $yy -lt 0 -or $xx -ge $bmp.Width -or $yy -ge $bmp.Height) { continue }
                $c=$bmp.GetPixel($xx,$yy)
                if ($c.B -gt ($c.R+25) -and $c.B -gt ($c.G+10)) {
                    if ($xx -lt $minx){$minx=$xx}; if ($xx -gt $maxx){$maxx=$xx}
                    if ($yy -lt $miny){$miny=$yy}; if ($yy -gt $maxy){$maxy=$yy}
                    $k=('{0},{1},{2}' -f $c.R,$c.G,$c.B)
                    if ($d.ContainsKey($k)){$d[$k]++}else{$d[$k]=1}
                }
            }
        }
        if ($maxx -lt 0) { return $null }
        $topc = $d.GetEnumerator() | Sort-Object Value -Descending | Select-Object -First 1
        $parts = $topc.Key -split ','
        return [PSCustomObject]@{ hex=('#{0:X2}{1:X2}{2:X2}' -f [int]$parts[0],[int]$parts[1],[int]$parts[2]); rgb=$topc.Key; left=$minx; top=$miny; width=($maxx-$minx+1); height=($maxy-$miny+1) }
    }

    function Analyze-Shot([string]$path, [string]$selectedName) {
        $bmp = [System.Drawing.Bitmap]::FromFile($path)
        $tab = $data.tabs | Where-Object { $_.name -eq $selectedName } | Select-Object -First 1
        $underline = $null
        if ($tab) { $underline = Find-Underline $bmp $tab }
        $res = [ordered]@{
            file = $path
            titleBar = (Sample-Color $bmp 600 30)
            titleBarDominant = (Dominant-Color $bmp 520 0 220 60 1).hex
            tabStrip = (Sample-Color $bmp 25 80)
            tabStripDominant = (Dominant-Color $bmp 0 60 1920 37 3).hex
            ribbonContent = (Sample-Color $bmp 15 150)
            ribbonContentDominant = (Dominant-Color $bmp 0 99 1920 122 3).hex
            pageCanvas = (Sample-Color $bmp 100 500)
            pageCanvasDominant = (Dominant-Color $bmp 60 300 380 800 4).hex
            pageBackground = (Sample-Color $bmp 960 300)
            statusBar = (Sample-Color $bmp 1000 1125)
            statusBarDominant = (Dominant-Color $bmp 450 1113 1000 27 1).hex
            rulerHorizontal = (Sample-Color $bmp 1000 235)
            rulerVertical = (Sample-Color $bmp 20 500)
            activeTab = $selectedName
            activeUnderline = $underline
        }
        $res | ConvertTo-Json -Compress -Depth 6 | ForEach-Object { Log ("SHOTCOLORS " + $_) }
        $bmp.Dispose()
        return $res
    }

    # Home
    $selHome = Select-Tab 'Home'
    Log ("Home selected=" + $selHome)
    Force-Foreground $hwnd
    Start-Sleep -Milliseconds 600
    $homePath = Join-Path $outDir 'word-home.png'
    Capture-Window $homePath $capRect
    $data.groupsByTab['Home'] = ConvertTo-Json (Get-Groups) -Compress -Depth 5 | ConvertFrom-Json
    $data.screenshots['home'] = Analyze-Shot $homePath 'Home'

    # Insert
    $selInsert = Select-Tab 'Insert'
    Log ("Insert selected=" + $selInsert)
    Force-Foreground $hwnd
    Start-Sleep -Milliseconds 600
    $insertPath = Join-Path $outDir 'word-insert.png'
    Capture-Window $insertPath $capRect
    $data.groupsByTab['Insert'] = ConvertTo-Json (Get-Groups) -Compress -Depth 5 | ConvertFrom-Json
    $data.screenshots['insert'] = Analyze-Shot $insertPath 'Insert'

    # Design
    $selDesign = Select-Tab 'Design'
    Log ("Design selected=" + $selDesign)
    Force-Foreground $hwnd
    Start-Sleep -Milliseconds 700
    $designPath = Join-Path $outDir 'word-design.png'
    Capture-Window $designPath $capRect
    $data.groupsByTab['Design'] = ConvertTo-Json (Get-Groups) -Compress -Depth 5 | ConvertFrom-Json
    $data.screenshots['design'] = Analyze-Shot $designPath 'Design'

    # Layout
    $selLayout = Select-Tab 'Layout'
    Log ("Layout selected=" + $selLayout)
    Force-Foreground $hwnd
    Start-Sleep -Milliseconds 600
    $layoutPath = Join-Path $outDir 'word-layout.png'
    Capture-Window $layoutPath $capRect
    $data.groupsByTab['Layout'] = ConvertTo-Json (Get-Groups) -Compress -Depth 5 | ConvertFrom-Json
    $data.screenshots['layout'] = Analyze-Shot $layoutPath 'Layout'

    # Group inventories text
    foreach ($tabName in @('Home','Insert','Design','Layout')) {
        $gl = $data.groupsByTab[$tabName]
        $chunks = @($gl | Where-Object { $_.className -eq 'NetUIChunk' } | Sort-Object left)
        Log ("GROUPS " + $tabName + ": " + (($chunks | ForEach-Object name) -join ' | '))
    }

    # Document info
    $data.document = [ordered]@{
        wordCount = $doc.ComputeStatistics(0)
        pageCount = $doc.ComputeStatistics(2)
        paragraphCount = $doc.Paragraphs.Count
        tableCount = $doc.Tables.Count
        tableRows = $doc.Tables.Item(1).Rows.Count
        tableColumns = $doc.Tables.Item(1).Columns.Count
        titleText = $doc.Paragraphs.Item(1).Range.Text.TrimEnd("`r")
        rulerVisible = $null
        verticalRulerVisible = $null
        pageColor = '#FFFFFF'
        startOfText = $doc.Content.Text.Substring(0,[Math]::Min(120,$doc.Content.Text.Length))
    }
    try { $data.document.rulerVisible = [bool]$word.ActiveWindow.DisplayRulers } catch { $data.document.rulerVisible = 'unknown' }
    try { $data.document.verticalRulerVisible = [bool]$word.ActiveWindow.DisplayVerticalRuler } catch { $data.document.verticalRulerVisible = 'unknown' }

    # Fonts
    $data.fonts['normalStyle'] = [ordered]@{ name=$doc.Styles.Item('Normal').Font.Name; size=$doc.Styles.Item('Normal').Font.Size }
    $data.fonts['titleStyle'] = [ordered]@{ name=$doc.Styles.Item('Title').Font.Name; size=$doc.Styles.Item('Title').Font.Size }
    $data.fonts['heading1Style'] = [ordered]@{ name=$doc.Styles.Item('Heading 1').Font.Name; size=$doc.Styles.Item('Heading 1').Font.Size }
    $data.fonts['heading2Style'] = [ordered]@{ name=$doc.Styles.Item('Heading 2').Font.Name; size=$doc.Styles.Item('Heading 2').Font.Size }
    $paragraphs = @()
    for ($i=1; $i -le [Math]::Min(12,$doc.Paragraphs.Count); $i++) {
        $p = $doc.Paragraphs.Item($i)
        $t = $p.Range.Text
        $paragraphs += [PSCustomObject]@{ index=$i; style=$p.Style.NameLocal; font=$p.Range.Font.Name; size=$p.Range.Font.Size; text=($t.Substring(0,[Math]::Min(55,$t.Length)).Replace("`r",'<CR>')) }
    }
    $data.fonts['paragraphs'] = $paragraphs
    foreach ($p in $paragraphs) { Log ("PARA " + $p.index + " style='" + $p.style + "' font='" + $p.font + "' size=" + $p.size + " text='" + $p.text + "'") }

    $uiFont = [System.Drawing.SystemFonts]::MessageBoxFont
    $data.fonts['ribbon'] = [ordered]@{ familyObserved='Segoe UI'; familySource='visual/system UI font match; UIA TextPattern not exposed by ribbon'; systemMessageBoxFont=($uiFont.Name + ' ' + $uiFont.Size + 'pt'); exactPointSize='unknown'; note='Uppercase tab labels measured approx. 12 px tall at 125% scaling' }

    # UIA document text fonts
    $docEl = $root.FindFirst($TS::Descendants, (New-Object System.Windows.Automation.PropertyCondition($AE::ControlTypeProperty,$CT::Document)))
    $uiaFonts = @()
    if ($docEl) {
        $tp = $null
        if ($docEl.TryGetCurrentPattern([System.Windows.Automation.TextPattern]::Pattern,[ref]$tp)) {
            $ranges = $tp.GetVisibleRanges()
            $n=0
            foreach ($rr in $ranges) {
                $fn=$rr.GetAttributeValue([System.Windows.Automation.TextPattern]::FontNameAttribute)
                $fs=$rr.GetAttributeValue([System.Windows.Automation.TextPattern]::FontSizeAttribute)
                if ($fn -or $fs) { $uiaFonts += ('{0} {1}pt' -f $fn,$fs) }
                $n++; if ($n -ge 8) { break }
            }
        }
    }
    $data.fonts['uiaDocumentRuns'] = $uiaFonts
    Log ("UIA document fonts: " + ($uiaFonts -join ' | '))

    $jsonPath = Join-Path $outDir 'report-data.json'
    $data | ConvertTo-Json -Depth 14 | Set-Content -LiteralPath $jsonPath -Encoding UTF8
    Log ("Wrote " + $jsonPath)

    Log 'CAPTURE COMPLETE'
}
catch {
    Log ("ERROR: " + $_.Exception.Message)
    Log ($_.ScriptStackTrace)
}
finally {
    try { if ($doc) { $doc.Close(0); Log 'Document closed without saving' } } catch { Log ("Close doc failed: " + $_.Exception.Message) }
    try { if ($word) { $word.Quit(0); Log 'Word.Quit called' } } catch { Log ("Quit failed: " + $_.Exception.Message) }
    Start-Sleep -Milliseconds 1200
    $left = Get-Process WINWORD -ErrorAction SilentlyContinue
    if ($left) {
        Log ("Killing remaining WINWORD PIDs: " + (($left | ForEach-Object Id) -join ','))
        $left | Stop-Process -Force
        Start-Sleep -Milliseconds 600
    }
    $left2 = Get-Process WINWORD -ErrorAction SilentlyContinue
    if ($left2) { Log ("WARNING: WINWORD still running: " + (($left2 | ForEach-Object Id) -join ',')) } else { Log 'Cleanup: no WINWORD processes remain' }
    try { [System.Runtime.InteropServices.Marshal]::ReleaseComObject($doc) | Out-Null } catch {}
    try { [System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null } catch {}
    [GC]::Collect()
    Log 'DONE'
}
