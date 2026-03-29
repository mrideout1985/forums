package com.rideout.forums.forum;

import jakarta.validation.constraints.Size;

public record ForumUpdateRequest(
        @Size(min = 3, max = 255, message = "Name must be 3-255 characters")
        String name,

        @Size(max = 1000, message = "Description must not exceed 1000 characters")
        String description
) {}
