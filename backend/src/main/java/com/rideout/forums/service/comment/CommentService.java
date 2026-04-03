package com.rideout.forums.service.comment;

import com.rideout.forums.comment.Comment;
import com.rideout.forums.comment.CommentCreateRequest;
import com.rideout.forums.comment.CommentResponse;
import com.rideout.forums.post.Post;
import com.rideout.forums.repository.comment.CommentRepository;
import com.rideout.forums.repository.post.PostRepository;
import com.rideout.forums.repository.user.UserRepository;
import com.rideout.forums.repository.vote.VoteRepository;
import com.rideout.forums.user.User;
import com.rideout.forums.vote.Vote;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final VoteRepository voteRepository;

    public CommentResponse createComment(CommentCreateRequest request, UUID authorId) {
        Post post = postRepository.findBySlug(request.postSlug())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Post not found: " + request.postSlug()));

        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found: " + authorId));

        Comment parentComment = null;
        if (request.parentCommentId() != null) {
            parentComment = commentRepository.findById(request.parentCommentId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND, "Parent comment not found: " + request.parentCommentId()));
        }

        Comment comment = Comment.builder()
                .post(post)
                .author(author)
                .parentComment(parentComment)
                .body(request.body())
                .build();

        Comment saved = commentRepository.save(comment);
        return CommentResponse.from(saved, 0, 0, null, List.of());
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> getCommentsForPost(String postSlug, UUID currentUserId) {
        Post post = postRepository.findBySlug(postSlug)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Post not found: " + postSlug));

        List<Comment> topLevel = commentRepository
                .findByPostIdAndParentCommentIsNullOrderByCreatedAtDesc(post.getId());

        return topLevel.stream()
                .map(comment -> buildCommentTree(comment, currentUserId))
                .toList();
    }

    public void deleteComment(Long commentId, UUID requestingUserId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Comment not found: " + commentId));

        if (!isOwnerOrAdmin(comment.getAuthor().getId(), requestingUserId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only the comment author or an admin can delete this comment");
        }

        commentRepository.delete(comment);
    }

    private CommentResponse buildCommentTree(Comment comment, UUID currentUserId) {
        long upvotes = voteRepository.countByTargetTypeAndTargetIdAndValue("COMMENT", comment.getId().toString(), 1);
        long downvotes = voteRepository.countByTargetTypeAndTargetIdAndValue("COMMENT", comment.getId().toString(), -1);

        Integer userVote = null;
        if (currentUserId != null) {
            userVote = voteRepository
                    .findByUserIdAndTargetTypeAndTargetId(currentUserId, "COMMENT", comment.getId().toString())
                    .map(Vote::getValue)
                    .orElse(null);
        }

        List<CommentResponse> replies = comment.getReplies().stream()
                .map(reply -> buildCommentTree(reply, currentUserId))
                .toList();

        return CommentResponse.from(comment, upvotes, downvotes, userVote, replies);
    }

    private boolean isOwnerOrAdmin(UUID authorId, UUID requestingUserId) {
        if (authorId.equals(requestingUserId)) {
            return true;
        }

        User user = userRepository.findById(requestingUserId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found: " + requestingUserId));

        return user.getRoles().stream()
                .anyMatch(role -> role.getName().equals("ROLE_ADMIN"));
    }
}
