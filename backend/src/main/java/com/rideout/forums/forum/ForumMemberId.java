package com.rideout.forums.forum;

import java.io.Serializable;
import java.util.UUID;

public record ForumMemberId(UUID userId, UUID forumId) implements Serializable {

    public ForumMemberId() {
        this(null, null);
    }
}
