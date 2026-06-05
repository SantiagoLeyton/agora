package com.agora.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    OpenAPI agoraOpenApi() {
        return new OpenAPI()
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
                .components(new Components().addSecuritySchemes("bearerAuth",
                        new SecurityScheme().type(SecurityScheme.Type.HTTP).scheme("bearer").bearerFormat("JWT")))
                .info(new Info()
                        .title("Agora API")
                        .description("""
                                Backend REST para Agora, plataforma academica de simulaciones educativas.
                                Modulos expuestos: autenticacion, usuarios, roles, auditoria, gestion academica,
                                constructor de casos, simulaciones, bitacoras, retroalimentacion e IA desacoplada
                                con MockAIProvider. La IA no define calificaciones academicas ni reglas de negocio.
                                """)
                        .version("0.9.0")
                        .contact(new Contact().name("Agora Backend Team")));
    }
}
