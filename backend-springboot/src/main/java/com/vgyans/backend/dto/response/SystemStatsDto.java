package com.vgyans.backend.dto.response;

public record SystemStatsDto(
        String status,
        String service,
        String version,
        long totalResources,
        long totalQuestions,
        long totalNotes,
        long totalJobs
) {
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String status;
        private String service;
        private String version;
        private long totalResources;
        private long totalQuestions;
        private long totalNotes;
        private long totalJobs;

        public Builder status(String status) { this.status = status; return this; }
        public Builder service(String service) { this.service = service; return this; }
        public Builder version(String version) { this.version = version; return this; }
        public Builder totalResources(long totalResources) { this.totalResources = totalResources; return this; }
        public Builder totalQuestions(long totalQuestions) { this.totalQuestions = totalQuestions; return this; }
        public Builder totalNotes(long totalNotes) { this.totalNotes = totalNotes; return this; }
        public Builder totalJobs(long totalJobs) { this.totalJobs = totalJobs; return this; }

        public SystemStatsDto build() {
            return new SystemStatsDto(status, service, version, totalResources, totalQuestions, totalNotes, totalJobs);
        }
    }
}
