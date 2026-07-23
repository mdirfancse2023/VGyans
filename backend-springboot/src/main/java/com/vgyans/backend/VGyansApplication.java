package com.vgyans.backend;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class VGyansApplication {

    private static final Logger log = LoggerFactory.getLogger(VGyansApplication.class);

    public static void main(String[] args) {
        log.info("Starting VGyans Spring Boot 4.0 Application...");
        SpringApplication.run(VGyansApplication.class, args);
        log.info("VGyans Spring Boot 4.0 Application started successfully.");
    }
}
