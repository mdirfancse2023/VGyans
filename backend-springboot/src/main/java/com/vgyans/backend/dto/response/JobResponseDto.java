package com.vgyans.backend.dto.response;

public record JobResponseDto(
        String id,
        String title,
        String company,
        String location,
        String type,
        String experience,
        String salary,
        String description,
        String link,
        String postedDate
) {
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String id;
        private String title;
        private String company;
        private String location;
        private String type;
        private String experience;
        private String salary;
        private String description;
        private String link;
        private String postedDate;

        public Builder id(String id) { this.id = id; return this; }
        public Builder title(String title) { this.title = title; return this; }
        public Builder company(String company) { this.company = company; return this; }
        public Builder location(String location) { this.location = location; return this; }
        public Builder type(String type) { this.type = type; return this; }
        public Builder experience(String experience) { this.experience = experience; return this; }
        public Builder salary(String salary) { this.salary = salary; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder link(String link) { this.link = link; return this; }
        public Builder postedDate(String postedDate) { this.postedDate = postedDate; return this; }

        public JobResponseDto build() {
            return new JobResponseDto(id, title, company, location, type, experience, salary, description, link, postedDate);
        }
    }
}
