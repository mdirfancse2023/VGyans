package com.vgyans.backend.dto.response;

public record SongResponseDto(
        String id,
        String spotifyId,
        String title,
        String artist,
        String album,
        String category,
        String coverUrl,
        String audioUrl,
        String url,
        String embedUrl,
        Integer duration,
        String provider
) {
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String id;
        private String spotifyId;
        private String title;
        private String artist;
        private String album;
        private String category;
        private String coverUrl;
        private String audioUrl;
        private String url;
        private String embedUrl;
        private Integer duration;
        private String provider;

        public Builder id(String id) { this.id = id; return this; }
        public Builder spotifyId(String spotifyId) { this.spotifyId = spotifyId; return this; }
        public Builder title(String title) { this.title = title; return this; }
        public Builder artist(String artist) { this.artist = artist; return this; }
        public Builder album(String album) { this.album = album; return this; }
        public Builder category(String category) { this.category = category; return this; }
        public Builder coverUrl(String coverUrl) { this.coverUrl = coverUrl; return this; }
        public Builder audioUrl(String audioUrl) { this.audioUrl = audioUrl; return this; }
        public Builder url(String url) { this.url = url; return this; }
        public Builder embedUrl(String embedUrl) { this.embedUrl = embedUrl; return this; }
        public Builder duration(Integer duration) { this.duration = duration; return this; }
        public Builder provider(String provider) { this.provider = provider; return this; }

        public SongResponseDto build() {
            return new SongResponseDto(id, spotifyId, title, artist, album, category, coverUrl, audioUrl, url, embedUrl, duration, provider);
        }
    }
}
