package com.vgyans.backend.controller;

import com.vgyans.backend.dto.response.SongResponseDto;
import com.vgyans.backend.service.SongService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/songs")
public class SongController {

    private static final Logger log = LoggerFactory.getLogger(SongController.class);
    private final SongService songService;

    public SongController(SongService songService) {
        this.songService = songService;
    }

    @GetMapping
    public ResponseEntity<List<SongResponseDto>> getSongs(
            @RequestParam(value = "query", required = false, defaultValue = "latest hindi songs") String query,
            @RequestParam(value = "max_results", required = false, defaultValue = "10") int maxResults) {

        log.info("HTTP GET /api/songs - query: '{}', max_results: {}", query, maxResults);
        List<SongResponseDto> songs = songService.searchSongs(query, maxResults);
        return ResponseEntity.ok(songs);
    }
}
