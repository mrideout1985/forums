package com.rideout.forums.comment;

import com.rideout.forums.post.AuthorInfo;

import java.time.OffsetDateTime;
import java.util.List;

public record CommentResponse(
        Long id,
        String postSlug,
        AuthorInfo author,
        String body,
        Long parentCommentId,
        long upvotes,
        long downvotes,
        Integer userVote,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt,
        List<CommentResponse> replies
) {
    public static CommentResponse from(Comment comment, long upvotes, long downvotes,
                                       Integer userVote, List<CommentResponse> replies) {
        return new CommentResponse(
                comment.getId(),
                comment.getPost().getSlug(),
                new AuthorInfo(comment.getAuthor().getId(), comment.getAuthor().getUsername()),
                comment.getBody(),
                comment.getParentComment() != null ? comment.getParentComment().getId() : null,
                upvotes,
                downvotes,
                userVote,
                comment.getCreatedAt(),
                comment.getUpdatedAt(),
                replies
        );
    }
}
