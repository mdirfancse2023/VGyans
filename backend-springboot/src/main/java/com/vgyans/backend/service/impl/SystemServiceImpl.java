package com.vgyans.backend.service.impl;

import com.vgyans.backend.dto.response.SystemStatsDto;
import com.vgyans.backend.service.SystemService;
import org.springframework.stereotype.Service;

@Service
public class SystemServiceImpl implements SystemService {

    @Override
    public SystemStatsDto getSystemStats() {
        return SystemStatsDto.builder()
                .status("UP")
                .service("VGyans Spring Boot 4.0 Backend")
                .version("4.0.0-RELEASE")
                .totalResources(250L)
                .totalQuestions(180L)
                .totalNotes(95L)
                .totalJobs(45L)
                .build();
    }
}
