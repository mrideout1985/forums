package com.rideout.forums.controller.comment;

import com.rideout.forums.comment.CommentCreateRequest;
import com.rideout.forums.comment.CommentResponse;
import com.rideout.forums.service.comment.CommentService;
import com.rideout.forums.user.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/comments")
@Tag(name = "Comments", description = "Comment management endpoints")
@RequiredArgsConstructor
@Slf4j
public class CommentController {

    private final CommentService commentService;

    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'MODERATOR')")
    @Operation(summary = "Create a comment", description = "Add a comment to a post (authenticated users)")
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "201",
                    description = "Comment created successfully",
                    content = @Content(schema = @Schema(implementation = CommentResponse.class))
            ),
            @ApiResponse(responseCode = "400", description = "Invalid input"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "404", description = "Post or parent comment not found")
    })
    public ResponseEntity<CommentResponse> createComment(
            @Valid @RequestBody CommentCreateRequest request
    ) {
        UUID userId = getUserId();
        log.info("Creating comment on post: {} by user: {}", request.postSlug(), userId);
        CommentResponse response = commentService.createComment(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/post/{postSlug}")
    @Operation(summary = "Get comments for a post", description = "Retrieve all comments for a post as a threaded tree")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Comments retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Post not found")
    })
    public ResponseEntity<List<CommentResponse>> getCommentsForPost(
            @PathVariable String postSlug
    ) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UUID currentUserId = authentication != null && authentication.getPrincipal() instanceof User ? getUserId() : null;
        log.info("Retrieving comments for post: {}", postSlug);
        List<CommentResponse> response = commentService.getCommentsForPost(postSlug, currentUserId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{commentId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'MODERATOR')")
    @Operation(summary = "Delete a comment", description = "Delete a comment (author or admin only)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Comment deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Comment not found"),
            @ApiResponse(responseCode = "403", description = "Unauthorized - owner or admin role required"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long commentId
    ) {
        UUID userId = getUserId();
        log.info("Deleting comment: {} by user: {}", commentId, userId);
        commentService.deleteComment(commentId, userId);
        return ResponseEntity.noContent().build();
    }

    private UUID getUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof User user)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        return user.getId();
    }
}
