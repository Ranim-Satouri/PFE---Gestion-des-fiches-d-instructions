package com.pfe.backend.configuration;


import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

//classe hedhy lezma juste lel annaotation @EnableAsync bech Async tekhdem

@Configuration
@EnableAsync
@EnableScheduling  // heyya teb3a configuration ta3 scheduling amma najem nhotha lenna maghyr ma naaml classe okhra
public class AsyncConfig {
}
