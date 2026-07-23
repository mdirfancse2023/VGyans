package com.vgyans.backend.dto.response;

import java.time.Instant;

public record ApiResponseDto<T>(
        boolean success,
        String message,
        T data,
        String timestamp
) {
    public static <T> ApiResponseDto<T> success(T data, String message) {
        return new ApiResponseDto<>(true, message, data, Instant.now().toString());
    }

    public static <T> ApiResponseDto<T> error(String message) {
        return new ApiResponseDto<>(false, message, null, Instant.now().toString());
    }
}
