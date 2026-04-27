$env:SUPABASE_ACCESS_TOKEN = "sbp_e49432e1a2856692e6f7e7fedbefefba02b31caa"

# File was already downloaded as supabase_cli.zip (which is actually a tar.gz)
# Use tar.exe (built into Windows 10+) to extract
Write-Host "Extracting with tar..."
if (!(Test-Path ".\supabase_bin")) { New-Item -ItemType Directory -Path ".\supabase_bin" | Out-Null }
& tar -xzf "supabase_cli.zip" -C ".\supabase_bin"
Write-Host "Extract done."
$exe = Get-ChildItem -Path ".\supabase_bin" -Filter "supabase.exe" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
if (!$exe) {
    Write-Host "Files in supabase_bin:"
    Get-ChildItem -Path ".\supabase_bin" -Recurse | ForEach-Object { Write-Host $_.FullName }
} else {
    Write-Host "Found CLI at: $($exe.FullName)"
    & "$($exe.FullName)" --version
}
