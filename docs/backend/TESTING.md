# Testing

## Comandos

```powershell
cd backend
./mvnw test
./mvnw verify
```

En contenedor:

```powershell
docker run --rm -v agora-maven-cache:/root/.m2 -v ${PWD}:/workspace -w /workspace eclipse-temurin:21-jdk-alpine ./mvnw -B verify
```

## Cobertura actual

La suite cubre:

- Seguridad JWT.
- Ciclo auth con refresh token.
- Administracion de usuarios.
- Gestion academica.
- Constructor de casos.
- Simulacion determinista.
- Bitacora y retroalimentacion.
- IA desacoplada con fallback.
- Regla ArchUnit sin ciclos entre modulos.

Resultado validado en Fase 9: 50 tests, 0 fallos, 0 errores.

## Pruebas manuales

Usar la coleccion Postman:

`testing/postman/agora-backend.postman_collection.json`

Variables minimas:

- `baseUrl`
- `accessToken`
- `refreshToken`
- `adminEmail`
- `docenteEmail`
- `estudianteEmail`
- `password`

