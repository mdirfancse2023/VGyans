package com.vgyans.backend.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vgyans.backend.dto.response.SongResponseDto;
import com.vgyans.backend.service.SongService;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

@Service
public class SongServiceImpl implements SongService {

    private static final Logger log = LoggerFactory.getLogger(SongServiceImpl.class);

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${spotify.client-id:ba75cb280ed54a35b755e4d562d08260}")
    private String clientId;

    @Value("${spotify.client-secret:40a7ab923a1e412f899f1d9cf9b23983}")
    private String clientSecret;

    private String cachedToken = null;
    private long tokenExpiresAt = 0;

    public SongServiceImpl(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    private synchronized String getSpotifyAccessToken() {
        long now = System.currentTimeMillis() / 1000;
        if (cachedToken != null && tokenExpiresAt > now) {
            return cachedToken;
        }

        log.info("Requesting fresh Spotify client credentials access token...");
        try {
            String credentials = clientId + ":" + clientSecret;
            String authHeader = "Basic " + Base64.getEncoder().encodeToString(credentials.getBytes(StandardCharsets.UTF_8));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            headers.set("Authorization", authHeader);

            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("grant_type", "client_credentials");

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity("https://accounts.spotify.com/api/token", request, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                cachedToken = root.path("access_token").asText();
                long expiresIn = root.path("expires_in").asLong(3600);
                tokenExpiresAt = now + expiresIn - 60;
                log.info("Successfully acquired Spotify access token.");
                return cachedToken;
            }
        } catch (Exception e) {
            log.error("Failed to authenticate with Spotify Accounts API", e);
        }
        return null;
    }

    @Override
    @CircuitBreaker(name = "spotifyService", fallbackMethod = "getFallbackSongs")
    public List<SongResponseDto> searchSongs(String query, int limit) {
        String searchTerm = (query == null || query.trim().isEmpty()) ? "latest hindi songs" : query.trim();
        int safeLimit = Math.min(Math.max(1, limit), 10);

        log.debug("Searching Spotify songs for query: '{}', limit: {}", searchTerm, safeLimit);
        String token = getSpotifyAccessToken();
        if (token == null) {
            log.warn("Spotify token unavailable. Returning fallback song catalog.");
            return getFallbackSongs(query, safeLimit, new RuntimeException("Missing Spotify Token"));
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(token);
            headers.setAccept(List.of(MediaType.APPLICATION_JSON));
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            String uri = UriComponentsBuilder.fromHttpUrl("https://api.spotify.com/v1/search")
                    .queryParam("q", searchTerm)
                    .queryParam("type", "track")
                    .queryParam("limit", safeLimit)
                    .build()
                    .toUriString();

            ResponseEntity<String> response = restTemplate.exchange(uri, HttpMethod.GET, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode items = objectMapper.readTree(response.getBody()).path("tracks").path("items");
                List<SongResponseDto> songs = new ArrayList<>();

                if (items.isArray()) {
                    for (JsonNode item : items) {
                        String sId = item.path("id").asText("");
                        String title = item.path("name").asText("Untitled");
                        
                        List<String> artists = new ArrayList<>();
                        for (JsonNode artistNode : item.path("artists")) {
                            artists.add(artistNode.path("name").asText(""));
                        }
                        String artistStr = artists.isEmpty() ? "Official Artist" : String.join(", ", artists);
                        
                        JsonNode album = item.path("album");
                        String albumName = album.path("name").asText(searchTerm);
                        String coverUrl = album.path("images").has(0) 
                                ? album.path("images").get(0).path("url").asText("https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500")
                                : "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500";
                        
                        int durSec = item.path("duration_ms").asInt(240000) / 1000;
                        String previewUrl = item.path("preview_url").asText("");
                        String spotifyLink = item.path("external_urls").path("spotify").asText("https://open.spotify.com/track/" + sId);

                        songs.add(SongResponseDto.builder()
                                .id("sp-" + sId)
                                .spotifyId(sId)
                                .title(title)
                                .artist(artistStr)
                                .album(albumName)
                                .category(searchTerm)
                                .coverUrl(coverUrl)
                                .audioUrl(previewUrl.isEmpty() ? "https://jiotunepreview.jio.com/content/Converted/010910141580615.mp3" : previewUrl)
                                .url(spotifyLink)
                                .embedUrl("https://open.spotify.com/embed/track/" + sId)
                                .duration(durSec)
                                .provider("spotify")
                                .build());
                    }
                }

                if (!songs.isEmpty()) {
                    return songs;
                }
            }
        } catch (Exception e) {
            log.error("Error calling Spotify Search API: {}", e.getMessage());
        }

        return getFallbackSongs(query, safeLimit, new RuntimeException("Spotify API Empty Response"));
    }

    public List<SongResponseDto> getFallbackSongs(String query, int limit, Throwable t) {
        log.warn("Executing Resilience4j fallback for Spotify songs due to: {}", t.getMessage());
        return List.of(
                SongResponseDto.builder()
                        .id("sp-fb1")
                        .spotifyId("1ai3itvPFcWilE9NX0JTCf")
                        .title("Mera Mann Kehne Laga")
                        .artist("Falak Shabir")
                        .album("Nautanki Saala!")
                        .category("Hindi")
                        .coverUrl("https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500")
                        .audioUrl("https://jiotunepreview.jio.com/content/Converted/010912023321219.mp3")
                        .url("https://open.spotify.com/track/1ai3itvPFcWilE9NX0JTCf")
                        .embedUrl("https://open.spotify.com/embed/track/1ai3itvPFcWilE9NX0JTCf")
                        .duration(225)
                        .provider("spotify")
                        .build(),
                SongResponseDto.builder()
                        .id("sp-fb2")
                        .spotifyId("0qVNxbFE4EUV3mNFodXiln")
                        .title("Saadi Galli Aaja")
                        .artist("Ayushmann Khurrana, Neeti Mohan")
                        .album("Nautanki Saala!")
                        .category("Hindi")
                        .coverUrl("https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500")
                        .audioUrl("https://jiotunepreview.jio.com/content/Converted/010910090394927.mp3")
                        .url("https://open.spotify.com/track/0qVNxbFE4EUV3mNFodXiln")
                        .embedUrl("https://open.spotify.com/embed/track/0qVNxbFE4EUV3mNFodXiln")
                        .duration(255)
                        .provider("spotify")
                        .build(),
                SongResponseDto.builder()
                        .id("sp-fb3")
                        .spotifyId("0Y6YW1552df031DjV8qBHv")
                        .title("Kesariya")
                        .artist("Arijit Singh, Pritam")
                        .album("Brahmastra")
                        .category("Hindi")
                        .coverUrl("https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500")
                        .audioUrl("https://jiotunepreview.jio.com/content/Converted/010910141580615.mp3")
                        .url("https://open.spotify.com/track/0Y6YW1552df031DjV8qBHv")
                        .embedUrl("https://open.spotify.com/embed/track/0Y6YW1552df031DjV8qBHv")
                        .duration(268)
                        .provider("spotify")
                        .build()
        );
    }
}
