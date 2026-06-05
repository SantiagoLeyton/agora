$ErrorActionPreference = "Stop"
Push-Location "$PSScriptRoot\..\backend"
try {
    .\mvnw.cmd clean verify
} finally {
    Pop-Location
}

