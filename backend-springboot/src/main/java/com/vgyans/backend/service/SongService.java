package com.vgyans.backend.service;

import com.vgyans.backend.dto.response.SongResponseDto;
import java.util.List;

public interface SongService {
    List<SongResponseDto> searchSongs(String query, int limit);
}
