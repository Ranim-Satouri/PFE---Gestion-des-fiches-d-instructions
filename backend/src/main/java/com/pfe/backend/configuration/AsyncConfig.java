package com.pfe.backend.configuration;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

//classe hedhy lezma juste lel annaotation @EnableAsync bech Async tekhdem lel les emails

@Configuration
@EnableAsync
@EnableScheduling
public class AsyncConfig {
}
