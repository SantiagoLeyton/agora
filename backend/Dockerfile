FROM maven:3.9.11-eclipse-temurin-21-alpine AS build
WORKDIR /workspace
COPY pom.xml .
RUN mvn -B dependency:go-offline
COPY src src
RUN mvn -B clean package

FROM eclipse-temurin:21-jre-alpine
RUN addgroup -S agora && adduser -S agora -G agora
WORKDIR /app
COPY --from=build /workspace/target/agora-backend-*.jar app.jar
USER agora
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]

