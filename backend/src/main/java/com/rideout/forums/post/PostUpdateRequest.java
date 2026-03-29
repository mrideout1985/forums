package com.rideout.forums.post;

import jakarta.validation.constraints.Size;

public record PostUpdateRequest(
        @Size(min = 5, max = 500, message = "Title must be 5-500 characters")
        String title,

        @Size(min = 10, message = "Body must be at least 10 characters")
        String body,

        String status
) {}
