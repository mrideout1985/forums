package com.rideout.forums.repository.vote;

import com.rideout.forums.vote.Vote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface VoteRepository extends JpaRepository<Vote, Long> {

    Optional<Vote> findByUserIdAndTargetTypeAndTargetId(UUID userId, String targetType, String targetId);

    long countByTargetTypeAndTargetIdAndValue(String targetType, String targetId, int value);
}
