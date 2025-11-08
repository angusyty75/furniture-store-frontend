$path = 'C:\Project\reactjs\furnitureStore\tmp_actions_runs.json'
if (-not (Test-Path $path)) { Write-Host "File not found: $path"; exit 1 }
$json = Get-Content -Raw $path | ConvertFrom-Json
if ($json.workflow_runs.Count -gt 0) {
  $run = $json.workflow_runs[0]
  Write-Host "Latest run id: $($run.id)"
  Write-Host "status: $($run.status)"
  Write-Host "conclusion: $($run.conclusion)"
  Write-Host "url: $($run.html_url)"
} else {
  Write-Host 'No workflow runs found.'
}
