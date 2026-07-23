package com.vgyans.backend.controller;

import com.vgyans.backend.dto.response.JobResponseDto;
import com.vgyans.backend.service.JobService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    private static final Logger log = LoggerFactory.getLogger(JobController.class);
    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    @GetMapping
    public ResponseEntity<List<JobResponseDto>> getJobs(
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "location", required = false) String location) {

        log.info("HTTP GET /api/jobs - category: '{}', location: '{}'", category, location);
        List<JobResponseDto> jobs = jobService.getJobs(category, location);
        return ResponseEntity.ok(jobs);
    }
}
