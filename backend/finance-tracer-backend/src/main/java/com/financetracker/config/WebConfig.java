package com.financetracker.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            // Specify actual origins instead of using wildcards with allowCredentials
            .allowedOrigins("http://localhost:3000")
            // Remove .allowedOriginPatterns("*") - can't use with allowCredentials(true)
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .exposedHeaders("Authorization") // Allow Authorization header to be exposed
            .allowCredentials(true);
    }
}