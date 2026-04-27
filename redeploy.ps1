$env:SUPABASE_ACCESS_TOKEN = "sbp_ce92133a12e81c42999a965a03083a574c6f3565"
Write-Host "Deploying ai-campaign-init (with worldSeed support)..."
& ".\supabase_bin\supabase.exe" functions deploy ai-campaign-init --project-ref lalidbpqeobhzgtymcwu
Write-Host "Done!"
