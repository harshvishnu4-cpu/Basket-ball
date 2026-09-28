# Resizes the raw PNG art in ../../source-art/png into game-ready sizes under ../assets/images.
# Backgrounds become JPEG (no alpha needed); sprites stay PNG with alpha.
Add-Type -AssemblyName System.Drawing
$src = Join-Path $PSScriptRoot '..\..\source-art\png'
$dst = Join-Path $PSScriptRoot '..\assets\images'

function Resize([string]$file, [string]$outRel, [int]$w, [int]$h, [string]$fmt) {
  $inPath = Join-Path $src $file
  $outPath = Join-Path $dst $outRel
  $bmp = [System.Drawing.Bitmap]::FromFile($inPath)
  try {
    if ($w -le 0) { $w = [int][Math]::Round($bmp.Width * $h / $bmp.Height) }
    if ($h -le 0) { $h = [int][Math]::Round($bmp.Height * $w / $bmp.Width) }
    $out = New-Object System.Drawing.Bitmap $w, $h, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($out)
    $g.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $attr = New-Object System.Drawing.Imaging.ImageAttributes
    $attr.SetWrapMode([System.Drawing.Drawing2D.WrapMode]::TileFlipXY)
    $rect = New-Object System.Drawing.Rectangle 0, 0, $w, $h
    $g.DrawImage($bmp, $rect, 0, 0, $bmp.Width, $bmp.Height, [System.Drawing.GraphicsUnit]::Pixel, $attr)
    $g.Dispose()
    New-Item -ItemType Directory -Force (Split-Path $outPath) | Out-Null
    if ($fmt -eq 'jpg') {
      $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
      $ep = New-Object System.Drawing.Imaging.EncoderParameters 1
      $ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), 86L
      $flat = New-Object System.Drawing.Bitmap $w, $h, ([System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
      $g2 = [System.Drawing.Graphics]::FromImage($flat); $g2.DrawImage($out, 0, 0, $w, $h); $g2.Dispose()
      $flat.Save($outPath, $codec, $ep); $flat.Dispose()
    } else {
      $out.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    }
    $out.Dispose()
    $kb = [int]((Get-Item $outPath).Length / 1KB)
    Write-Output ("{0,-42} {1}x{2}  {3} KB" -f $outRel, $w, $h, $kb)
  } finally { $bmp.Dispose() }
}

# Backgrounds: full 1920x1080 JPEG
foreach ($b in 'bg_court_title','bg_court_game','bg_court_two_hoops','bg_court_complete') {
  Resize "$b.png" "backgrounds\$b.jpg" 1920 1080 'jpg'
}
# Characters (height-fit). Coach Riya (characters/coach_riya_point.png) is authored directly in assets/images, not generated here.
Resize 'player_shooter_ready.png'   'characters\player_shooter_ready.png'   0 700 'png'
Resize 'player_shooter_release.png' 'characters\player_shooter_release.png' 0 700 'png'
foreach ($p in 'players_react_yes','players_react_no','players_waiting') {
  Resize "$p.png" "characters\$p.png" 0 620 'png'
}
# Props
Resize 'ball_basketball.png'   'props\ball_basketball.png'   200 200 'png'
Resize 'ball_shadow.png'       'props\ball_shadow.png'       300 0   'png'
# Sensor device + sensor FX are authored directly at 520px in assets/images (props/sensor_*.png, fx/fx_sensor_*.png); not generated here.
Resize 'hoop_rim_highlight.png' 'props\hoop_rim_highlight.png' 400 400 'png'
# FX
Resize 'fx_correct_spark.png'   'fx\fx_correct_spark.png'   300 300 'png'
Resize 'fx_needs_fix.png'       'fx\fx_needs_fix.png'       400 400 'png'
Resize 'fx_completion_glow.png' 'fx\fx_completion_glow.png' 900 900 'png'
Resize 'zone_above.png'         'fx\zone_above.png'         700 0   'png'
Resize 'zone_hoop.png'          'fx\zone_hoop.png'          700 0   'png'
Resize 'zone_below.png'         'fx\zone_below.png'         700 0   'png'
# Path helper overlays (optional static trails)
foreach ($p in 'path_score','path_rattle_out','path_bank_score','path_rim_miss') {
  Resize "$p.png" "paths\$p.png" 600 600 'png'
}
# UI (the shell chrome itself comes from the Figma SVGs in assets/images/ui/skai, not from here)
Resize 'ui_icon_replay.png'    'ui\ui_icon_replay.png'    128 128 'png'
Resize 'ui_skai_logo_mark.png' 'ui\ui_skai_logo_mark.png' 128 128 'png'
Resize 'ui_rule_connector.png' 'ui\ui_rule_connector.png' 160 160 'png'
Write-Output 'done'
