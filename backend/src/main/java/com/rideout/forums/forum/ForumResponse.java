package com.rideout.forums.forum;

import java.time.LocalDateTime;
import java.util.UUID;

public record ForumResponse(
        UUID id,
        String slug,
        String name,
        String description,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static ForumResponse from(Forum forum) {
        return new ForumResponse(
                forum.getId(),
                forum.getSlug(),
                forum.getName(),
                forum.getDescription(),
                forum.getCreatedAt(),
                forum.getUpdatedAt()
        );
    }
}
