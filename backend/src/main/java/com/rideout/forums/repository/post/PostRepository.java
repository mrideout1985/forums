package com.rideout.forums.repository.post;

import com.rideout.forums.post.Post;
import com.rideout.forums.post.PostStatus;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PostRepository extends JpaRepository<Post, UUID> {
    Optional<Post> findBySlug(String slug);

    Page<Post> findByForumIdOrderByCreatedAtDesc(UUID forumId, Pageable pageable);

    Page<Post> findByAuthorIdOrderByCreatedAtDesc(UUID authorId, Pageable pageable);

    Page<Post> findByForumIdAndStatusOrderByCreatedAtDesc(UUID forumId, PostStatus status, Pageable pageable);
}
