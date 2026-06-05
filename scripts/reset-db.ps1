$ErrorActionPreference = "Stop"
$answer = Read-Host "Delete Agora local PostgreSQL and pgAdmin volumes? Type RESET to continue"
if ($answer -ne "RESET") {
    Write-Host "Reset cancelled."
    exit 0
}
docker compose down --volumes
docker compose up -d postgres pgadmin

