package com.rideout.forums.repository.vote;

import com.rideout.forums.vote.PostUserVote;
import com.rideout.forums.vote.PostVoteStats;
import com.rideout.forums.vote.Vote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VoteRepository extends JpaRepository<Vote, Long> {

    Optional<Vote> findByUserIdAndTargetTypeAndTargetId(UUID userId, String targetType, String targetId);

    long countByTargetTypeAndTargetIdAndValue(String targetType, String targetId, int value);

    @Query("""
            SELECT new com.rideout.forums.vote.PostVoteStats(
                v.targetId,
                SUM(CASE WHEN v.value = 1 THEN 1 ELSE 0 END),
                SUM(CASE WHEN v.value = -1 THEN 1 ELSE 0 END)
            )
            FROM Vote v
            WHERE v.targetType = 'POST' AND v.targetId IN :postIds
            GROUP BY v.targetId
            """)
    List<PostVoteStats> findVoteStatsByPostIds(@Param("postIds") List<String> postIds);

    @Query("""
            SELECT new com.rideout.forums.vote.PostUserVote(v.targetId, v.value)
            FROM Vote v
            WHERE v.user.id = :userId AND v.targetType = 'POST' AND v.targetId IN :postIds
            """)
    List<PostUserVote> findUserVotesByPostIds(@Param("userId") UUID userId, @Param("postIds") List<String> postIds);
}
