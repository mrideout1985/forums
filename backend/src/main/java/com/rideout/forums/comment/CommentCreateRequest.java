package com.rideout.forums.comment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CommentCreateRequest(
        @NotBlank(message = "Post slug is required")
        String postSlug,

        @NotBlank(message = "Comment body is required")
        @Size(max = 10000, message = "Comment body must not exceed 10000 characters")
        String body,

        Long parentCommentId
) {}
