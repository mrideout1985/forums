package com.rideout.forums.repository.comment;

import com.rideout.forums.comment.Comment;
import com.rideout.forums.comment.PostCommentCount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByPostIdAndParentCommentIsNullOrderByCreatedAtDesc(UUID postId);

    long countByPostId(UUID postId);

    @Query("""
            SELECT new com.rideout.forums.comment.PostCommentCount(c.post.id, COUNT(c))
            FROM Comment c
            WHERE c.post.id IN :postIds
            GROUP BY c.post.id
            """)
    List<PostCommentCount> countByPostIds(@Param("postIds") List<UUID> postIds);
}
