package com.rideout.forums.repository.forum;

import com.rideout.forums.forum.Forum;
import com.rideout.forums.forum.ForumMember;
import com.rideout.forums.forum.ForumMemberId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Set;
import java.util.UUID;

@Repository
public interface ForumMemberRepository extends JpaRepository<ForumMember, ForumMemberId> {

    boolean existsByUserIdAndForumId(UUID userId, UUID forumId);

    void deleteByUserIdAndForumId(UUID userId, UUID forumId);

    long countByForumId(UUID forumId);

    @Query("SELECT fm.forumId FROM ForumMember fm WHERE fm.userId = :userId")
    Set<UUID> findForumIdsByUserId(@Param("userId") UUID userId);

    @Query("SELECT fm.forum FROM ForumMember fm WHERE fm.userId = :userId")
    Page<Forum> findForumsByUserId(@Param("userId") UUID userId, Pageable pageable);
}
