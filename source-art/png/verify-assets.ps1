Add-Type -AssemblyName System.Drawing
$assetFolder = $PSScriptRoot
$spec = Get-Content -LiteralPath (Join-Path $assetFolder 'prompts.json') -Raw | ConvertFrom-Json
$rows = foreach ($entry in $spec.assets) {
    $assetPath = Join-Path $assetFolder $entry.file
    if (-not (Test-Path -LiteralPath $assetPath)) { throw "Missing asset: $($entry.file)" }
    $bitmap = [System.Drawing.Bitmap]::FromFile($assetPath)
    try {
        $minAlpha = 255
        $maxAlpha = 0
        for ($y = 0; $y -lt $bitmap.Height; $y += 17) {
            for ($x = 0; $x -lt $bitmap.Width; $x += 17) {
                $alpha = $bitmap.GetPixel($x, $y).A
                $minAlpha = [Math]::Min($minAlpha, $alpha)
                $maxAlpha = [Math]::Max($maxAlpha, $alpha)
            }
        }
        [pscustomobject]@{
            File = $entry.file
            Width = $bitmap.Width
            Height = $bitmap.Height
            RequestedWidth = $entry.target_width
            RequestedHeight = $entry.target_height
            HasTransparency = ($minAlpha -lt 255)
            HasVisibleContent = ($maxAlpha -gt 0)
            Bytes = (Get-Item -LiteralPath $assetPath).Length
        }
    } finally { $bitmap.Dispose() }
}
$rows | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $assetFolder 'manifest.json') -Encoding UTF8
$rows | Format-Table File,Width,Height,HasTransparency,HasVisibleContent
