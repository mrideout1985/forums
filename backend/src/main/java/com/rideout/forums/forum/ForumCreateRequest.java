package com.rideout.forums.forum;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ForumCreateRequest(
        @NotBlank(message = "Slug is required")
        @Size(min = 3, max = 64, message = "Slug must be 3-64 characters")
        String slug,

        @NotBlank(message = "Name is required")
        @Size(min = 3, max = 255, message = "Name must be 3-255 characters")
        String name,

        @Size(max = 1000, message = "Description must not exceed 1000 characters")
        String description
) {}
