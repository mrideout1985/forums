package com.rideout.forums.vote;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record VoteRequest(
        @NotBlank(message = "Target type is required")
        String targetType,

        @NotBlank(message = "Target ID is required")
        String targetId,

        @NotNull(message = "Vote value is required")
        Integer value
) {}
