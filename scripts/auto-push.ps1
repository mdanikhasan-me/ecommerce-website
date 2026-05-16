<#
Auto-push script: commits and pushes any local changes in the repository.
Run with: powershell -NoProfile -ExecutionPolicy Bypass -File ".\scripts\auto-push.ps1"
#>

param(
    [string]$RepoPath = ''
)

$ErrorActionPreference = 'Stop'

function Log($msg) {
    $timestamp = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss')
    try {
        $logFile = Join-Path $PSScriptRoot 'auto-push.log'
        "$timestamp - $msg" | Out-File -FilePath $logFile -Append -Encoding UTF8
    } catch {
        Write-Output "$timestamp - $msg"
    }
}

try {
    if (-not $RepoPath -or $RepoPath -eq '') {
        $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
        $repoRoot = Resolve-Path (Join-Path $scriptDir '..')
        $RepoPath = $repoRoot.Path
    } else {
        $RepoPath = Resolve-Path $RepoPath
        $RepoPath = $RepoPath.Path
    }

    Push-Location $RepoPath

    $git = Get-Command git -ErrorAction SilentlyContinue
    if (-not $git) {
        Log 'Git not found in PATH; aborting.'
        exit 2
    }

    $status = git status --porcelain
    if (-not $status) {
        Log 'No changes to commit.'
        exit 0
    }

    git add -A

    $branch = git rev-parse --abbrev-ref HEAD

    $commitMessage = "Auto-commit from auto-push: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"

    # Only commit if there are staged changes
    $staged = git diff --cached --name-only
    if ($staged) {
        $commitOutput = & git commit -m $commitMessage 2>&1
        $commitExit = $LASTEXITCODE

        if ($commitExit -ne 0) {
            Log "git commit returned $commitExit."
            if ($commitOutput) {
                foreach ($line in $commitOutput) { Log "git commit: $line" }
            }
        } else {
            Log "Committed changes: $commitMessage"
            if ($commitOutput) {
                foreach ($line in $commitOutput) { if ($line) { Log "git commit: $line" } }
            }
        }
    } else {
        Log 'No staged changes to commit.'
    }

    # Ensure we're up-to-date before pushing to avoid non-fast-forward errors
    $fetchOutput = & git fetch origin $branch 2>&1
    $fetchExit = $LASTEXITCODE
    if ($fetchExit -ne 0) {
        Log "git fetch returned $fetchExit."
        if ($fetchOutput) { foreach ($line in $fetchOutput) { Log "git fetch: $line" } }
    } else {
        if ($fetchOutput) { foreach ($line in $fetchOutput) { if ($line) { Log "git fetch: $line" } } }
    }

    $pullOutput = & git pull --rebase --autostash origin $branch 2>&1
    $pullExit = $LASTEXITCODE
    if ($pullExit -ne 0) {
        Log "git pull returned $pullExit."
        if ($pullOutput) { foreach ($line in $pullOutput) { Log "git pull: $line" } }
    } else {
        Log "Pulled latest changes for $branch."
        if ($pullOutput) { foreach ($line in $pullOutput) { if ($line) { Log "git pull: $line" } } }
    }

    # Try pushing; if it fails due to remote changes, retry after pulling (rebase)
    $maxAttempts = 3
    $attempt = 0
    while ($attempt -lt $maxAttempts) {
        $attempt++
        $pushOutput = & git push origin $branch 2>&1
        $pushExit = $LASTEXITCODE

        if ($pushExit -eq 0) {
            Log "Pushed to origin/$branch on attempt $attempt."
            if ($pushOutput) { foreach ($line in $pushOutput) { if ($line) { Log "git push: $line" } } }
            break
        }

        Log "git push attempt $attempt returned $pushExit."
        if ($pushOutput) { foreach ($line in $pushOutput) { Log "git push: $line" } }

        if ($attempt -lt $maxAttempts) {
            Log "Attempting to pull/rebase and retry push (attempt $($attempt + 1))."
            $pullOutput = & git pull --rebase --autostash origin $branch 2>&1
            $pullExit = $LASTEXITCODE
            if ($pullExit -ne 0) {
                Log "git pull for retry returned $pullExit."
                if ($pullOutput) { foreach ($line in $pullOutput) { Log "git pull: $line" } }
                break
            }
        } else {
            Log "Max push attempts reached; aborting."
        }
    }

} catch {
    Log "Error: $_"
    exit 1
} finally {
    Pop-Location -ErrorAction SilentlyContinue
}
