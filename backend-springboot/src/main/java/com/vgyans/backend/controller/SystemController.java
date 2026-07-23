package com.vgyans.backend.controller;

import com.vgyans.backend.dto.request.FeedbackRequestDto;
import com.vgyans.backend.dto.response.ApiResponseDto;
import com.vgyans.backend.dto.response.SystemStatsDto;
import com.vgyans.backend.service.SystemService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping
public class SystemController {

    private static final Logger log = LoggerFactory.getLogger(SystemController.class);
    private final SystemService systemService;

    public SystemController(SystemService systemService) {
        this.systemService = systemService;
    }

    @GetMapping("/")
    public ResponseEntity<Map<String, String>> rootHealthCheck() {
        log.info("HTTP GET / - Root Health Check");
        return ResponseEntity.ok(Map.of(
                "status", "online",
                "framework", "Spring Boot 4.0 (Java 21)",
                "app", "VGyans Production API"
        ));
    }

    @GetMapping("/api/stats")
    public ResponseEntity<SystemStatsDto> getStats() {
        log.info("HTTP GET /api/stats");
        return ResponseEntity.ok(systemService.getSystemStats());
    }

    @PostMapping("/api/feedback")
    public ResponseEntity<ApiResponseDto<String>> submitFeedback(@Valid @RequestBody FeedbackRequestDto request) {
        log.info("HTTP POST /api/feedback from email: {}", request.email());
        return ResponseEntity.ok(ApiResponseDto.success("Thank you for your feedback!", "Feedback received successfully"));
    }
}
