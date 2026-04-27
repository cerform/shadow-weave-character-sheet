$env:SUPABASE_ACCESS_TOKEN = "sbp_e49432e1a2856692e6f7e7fedbefefba02b31caa"
Write-Host "Deploying ai-campaign-init..."
& ".\supabase_bin\supabase.exe" functions deploy ai-campaign-init --project-ref lalidbpqeobhzgtymcwu
Write-Host "Deploying ai-dm-orchestrator..."
& ".\supabase_bin\supabase.exe" functions deploy ai-dm-orchestrator --project-ref lalidbpqeobhzgtymcwu
Write-Host "Deploying ai-image-generator..."
& ".\supabase_bin\supabase.exe" functions deploy ai-image-generator --project-ref lalidbpqeobhzgtymcwu
Write-Host "All done!"
