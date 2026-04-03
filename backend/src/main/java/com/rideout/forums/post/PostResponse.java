package com.rideout.forums.post;

import java.time.LocalDateTime;
import java.util.UUID;

public record PostResponse(
        UUID id,
        UUID forumId,
        String forumSlug,
        String slug,
        String title,
        String body,
        PostStatus status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        AuthorInfo author,
        long upvotes,
        long downvotes,
        Integer userVote,
        long commentCount
) {
    public static PostResponse from(Post post) {
        return from(post, 0, 0, null, 0);
    }

    public static PostResponse from(Post post, long upvotes, long downvotes,
                                     Integer userVote, long commentCount) {
        return new PostResponse(
                post.getId(),
                post.getForum().getId(),
                post.getForum().getSlug(),
                post.getSlug(),
                post.getTitle(),
                post.getBody(),
                post.getStatus(),
                post.getCreatedAt(),
                post.getUpdatedAt(),
                new AuthorInfo(post.getAuthor().getId(), post.getAuthor().getUsername()),
                upvotes,
                downvotes,
                userVote,
                commentCount
        );
    }
}
