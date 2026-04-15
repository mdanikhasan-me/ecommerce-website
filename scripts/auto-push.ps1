# Auto-push to GitHub if there are changes
# This script checks for uncommitted changes and pushes them every 30 minutes

param(
    [string]$RepoPath = "P:\Projects\E-commers\boilabin-marketplace"
)

Set-Location $RepoPath

# Check if there are any changes
$status = git status --porcelain

if ($status) {
    Write-Host "Changes detected. Committing and pushing..." -ForegroundColor Green
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $commitMessage = "Auto-push: $timestamp"
    
    try {
        git add -A
        git commit -m $commitMessage
        git push
        Write-Host "Successfully pushed changes at $timestamp" -ForegroundColor Green
    } catch {
        Write-Host "Error during push: $_" -ForegroundColor Red
    }
} else {
    Write-Host "No changes to commit at $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Yellow
}
