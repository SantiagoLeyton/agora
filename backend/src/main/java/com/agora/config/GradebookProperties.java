package com.agora.config;

import java.math.BigDecimal;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "agora.gradebook")
@Getter
@Setter
public class GradebookProperties {

    private BigDecimal approvalThreshold = BigDecimal.valueOf(3.0);
}
