param(
    [string]$File,
    [string]$Where
)

if ([string]::IsNullOrWhiteSpace($File)) {
    Write-Host "Please provide env file path using -File"
    exit 1
}

if (-Not (Test-Path $File)) {
    Write-Host "File not found: $File"
    exit 1
}

Get-Content $File | ForEach-Object {

    # Skip empty lines & comments
    if ($_ -match '^\s*$' -or $_ -match '^\s*#') {
        return
    }

    $parts = $_ -split '=', 2

    if ($parts.Count -ne 2) {
        return
    }

    $key = $parts[0].Trim()
    $value = $parts[1].Trim()

    Write-Host "Syncing secret: $key"

    if ([string]::IsNullOrWhiteSpace($Where)) {
        # Repository secret
        gh secret set $key --body $value
    }
    else {
        # Environment secret
        gh secret set $key --env $Where --body $value
    }
}