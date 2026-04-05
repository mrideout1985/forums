package com.rideout.forums.comment;

import java.util.UUID;

public record PostCommentCount(UUID postId, long commentCount) {}
