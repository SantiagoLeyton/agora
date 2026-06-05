package com.agora;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class AgoraApplication {

    public static void main(String[] args) {
        SpringApplication.run(AgoraApplication.class, args);
    }
}
