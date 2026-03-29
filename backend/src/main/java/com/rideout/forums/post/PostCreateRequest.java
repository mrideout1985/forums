package com.rideout.forums.post;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PostCreateRequest(
        @NotBlank(message = "Forum slug is required")
        String forumSlug,

        @NotBlank(message = "Post slug is required")
        @Size(min = 3, max = 255, message = "Slug must be 3-255 characters")
        String slug,

        @NotBlank(message = "Title is required")
        @Size(min = 5, max = 500, message = "Title must be 5-500 characters")
        String title,

        @NotBlank(message = "Body is required")
        @Size(min = 10, message = "Body must be at least 10 characters")
        String body,

        String status
) {}
