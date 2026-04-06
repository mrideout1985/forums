package com.rideout.forums.forum;

import java.time.LocalDateTime;
import java.util.UUID;

public record ForumResponse(
        UUID id,
        String slug,
        String name,
        String description,
        Boolean joined,
        Long memberCount,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static ForumResponse from(Forum forum) {
        return new ForumResponse(
                forum.getId(),
                forum.getSlug(),
                forum.getName(),
                forum.getDescription(),
                false,
                0L,
                forum.getCreatedAt(),
                forum.getUpdatedAt()
        );
    }

    public static ForumResponse from(Forum forum, boolean joined, long memberCount) {
        return new ForumResponse(
                forum.getId(),
                forum.getSlug(),
                forum.getName(),
                forum.getDescription(),
                joined,
                memberCount,
                forum.getCreatedAt(),
                forum.getUpdatedAt()
        );
    }
}
