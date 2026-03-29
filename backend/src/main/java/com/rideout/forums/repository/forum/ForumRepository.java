package com.rideout.forums.repository.forum;

import com.rideout.forums.forum.Forum;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ForumRepository extends JpaRepository<Forum, UUID> {
    Optional<Forum> findBySlug(String slug);
}
