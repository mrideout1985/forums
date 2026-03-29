package com.rideout.forums.post;

import java.util.UUID;

public record AuthorInfo(
        UUID id,
        String username
) {}
