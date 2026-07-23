package com.vgyans.backend.service;

import com.vgyans.backend.dto.response.JobResponseDto;
import java.util.List;

public interface JobService {
    List<JobResponseDto> getJobs(String category, String location);
}
