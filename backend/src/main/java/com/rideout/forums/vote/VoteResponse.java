package com.rideout.forums.vote;

public record VoteResponse(
        long upvotes,
        long downvotes,
        Integer userVote
) {}
