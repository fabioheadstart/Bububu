# Run this in PowerShell from any directory
$downloads = "$env:USERPROFILE\Downloads"
$dest = "$env:USERPROFILE\OneDrive\Documentos\Claude\Projects\Bububu\public"

$sounds = @("bub_chomp.mp3","bub_fart1.mp3","bub_fart2.mp3","bub_fart3.mp3","bub_fart4.mp3","bub_burp.mp3")
foreach ($f in $sounds) {
  $src = Join-Path $downloads $f
  if (Test-Path $src) {
    Copy-Item $src (Join-Path $dest $f) -Force
    Write-Host "Copied $f"
  } else {
    Write-Host "NOT FOUND: $f"
  }
}
Write-Host "Done."
