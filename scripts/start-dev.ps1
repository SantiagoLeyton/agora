$ErrorActionPreference = "Stop"
docker compose up -d postgres pgadmin
Push-Location "$PSScriptRoot\..\backend"
try {
    .\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=dev"
} finally {
    Pop-Location
}

