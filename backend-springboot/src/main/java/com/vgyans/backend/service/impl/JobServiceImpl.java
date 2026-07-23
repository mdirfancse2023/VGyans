package com.vgyans.backend.service.impl;

import com.vgyans.backend.dto.response.JobResponseDto;
import com.vgyans.backend.service.JobService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class JobServiceImpl implements JobService {

    private static final Logger log = LoggerFactory.getLogger(JobServiceImpl.class);

    @Override
    public List<JobResponseDto> getJobs(String category, String location) {
        log.info("Fetching job listings for category: '{}', location: '{}'", category, location);
        return List.of(
                JobResponseDto.builder()
                        .id("job-1")
                        .title("Senior Java Spring Boot Engineer")
                        .company("VGyans Technologies")
                        .location("Remote / India")
                        .type("Full-Time")
                        .experience("3-5 Years")
                        .salary("₹18,00,000 - ₹28,00,000 P.A.")
                        .description("Lead the migration and optimization of high-concurrency microservices using Spring Boot 4.0, Java 21, and Resilience4j.")
                        .link("https://virtualgyans.me/careers")
                        .postedDate("2026-07-23")
                        .build(),
                JobResponseDto.builder()
                        .id("job-2")
                        .title("Full Stack React & Cloud Developer")
                        .company("VGyans AI Labs")
                        .location("Bengaluru, KA")
                        .type("Full-Time")
                        .experience("2-4 Years")
                        .salary("₹15,00,000 - ₹24,00,000 P.A.")
                        .description("Build interactive React 19 web applications with responsive glassmorphism designs and real-time audio integration.")
                        .link("https://virtualgyans.me/careers")
                        .postedDate("2026-07-22")
                        .build()
        );
    }
}
