package com.rideout.forums.controller.post;

import com.rideout.forums.post.PostCreateRequest;
import com.rideout.forums.post.PostResponse;
import com.rideout.forums.post.PostStatus;
import com.rideout.forums.post.PostUpdateRequest;
import com.rideout.forums.service.post.PostService;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@RestController
@RequestMapping("/api/posts")
@Tag(name = "Posts", description = "Post management endpoints")
@RequiredArgsConstructor
@Slf4j
public class PostController {

    private final PostService postService;

    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'MODERATOR')")
    @Operation(summary = "Create a new post", description = "Create a new post in a forum (authenticated users)")
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "201",
                    description = "Post created successfully",
                    content = @Content(schema = @Schema(implementation = PostResponse.class))
            ),
            @ApiResponse(responseCode = "400", description = "Invalid input or slug already exists"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - authentication required"),
            @ApiResponse(responseCode = "404", description = "Forum not found")
    })
    public ResponseEntity<PostResponse> createPost(
            @Valid @RequestBody PostCreateRequest request
    ) {
        UUID userId = getUserId();
        log.info("Creating post with slug: {} by user: {}", request.slug(), userId);
        PostResponse response = postService.createPost(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{slug}")
    @Operation(summary = "Get post by slug", description = "Retrieve a post by its slug")
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Post retrieved successfully",
                    content = @Content(schema = @Schema(implementation = PostResponse.class))
            ),
            @ApiResponse(responseCode = "404", description = "Post not found")
    })
    public ResponseEntity<PostResponse> getPost(
            @PathVariable String slug
    ) {
        UUID currentUserId = getOptionalUserId();
        log.info("Retrieving post: {}", slug);
        PostResponse response = postService.getPost(slug, currentUserId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/forum/{forumSlug}")
    @Operation(summary = "List posts by forum", description = "Retrieve a paginated list of posts in a forum")
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Posts retrieved successfully"
            ),
            @ApiResponse(responseCode = "404", description = "Forum not found")
    })
    public ResponseEntity<Page<PostResponse>> listPostsByForum(
            @PathVariable String forumSlug,
            @RequestParam(required = false) String status,
            Pageable pageable
    ) {
        UUID currentUserId = getOptionalUserId();
        log.info("Listing posts for forum: {} with status filter: {}", forumSlug, status);

        Page<PostResponse> response;
        if (status != null && !status.isBlank()) {
            try {
                PostStatus postStatus = PostStatus.valueOf(status.toUpperCase());
                response = postService.listPostsByForumAndStatus(forumSlug, postStatus, currentUserId, pageable);
            } catch (IllegalArgumentException e) {
                                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status: " + status);
            }
        } else {
            response = postService.listPostsByForum(forumSlug, currentUserId, pageable);
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping("/author/{userId}")
    @Operation(summary = "List posts by author", description = "Retrieve a paginated list of posts by a specific user")
    @ApiResponse(
            responseCode = "200",
            description = "Posts retrieved successfully"
    )
    public ResponseEntity<Page<PostResponse>> listPostsByAuthor(
            @PathVariable UUID userId,
            Pageable pageable
    ) {
        UUID currentUserId = getOptionalUserId();
        log.info("Listing posts for author: {}", userId);
        Page<PostResponse> response = postService.listPostsByAuthor(userId, currentUserId, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/hot")
    @Operation(summary = "Get hot posts", description = "Retrieve trending posts sorted by engagement score")
    @ApiResponse(
            responseCode = "200",
            description = "Hot posts retrieved successfully"
    )
    public ResponseEntity<Page<PostResponse>> getHotPosts(Pageable pageable) {
        UUID currentUserId = getOptionalUserId();
        log.info("Retrieving hot posts, page: {}, size: {}", pageable.getPageNumber(), pageable.getPageSize());
        Page<PostResponse> response = postService.getHotPosts(currentUserId, pageable);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{slug}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'MODERATOR')")
    @Operation(summary = "Update post", description = "Update post details (author or admin only)")
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Post updated successfully",
                    content = @Content(schema = @Schema(implementation = PostResponse.class))
            ),
            @ApiResponse(responseCode = "404", description = "Post not found"),
            @ApiResponse(responseCode = "403", description = "Unauthorized - owner or admin role required"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - authentication required")
    })
    public ResponseEntity<PostResponse> updatePost(
            @PathVariable String slug,
            @Valid @RequestBody PostUpdateRequest request
    ) {
        UUID userId = getUserId();
        log.info("Updating post: {} by user: {}", slug, userId);
        PostResponse response = postService.updatePost(slug, request, userId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{slug}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'MODERATOR')")
    @Operation(summary = "Delete post", description = "Delete a post (author or admin only)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Post deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Post not found"),
            @ApiResponse(responseCode = "403", description = "Unauthorized - owner or admin role required"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - authentication required")
    })
    public ResponseEntity<Void> deletePost(
            @PathVariable String slug
    ) {
        UUID userId = getUserId();
        log.info("Deleting post: {} by user: {}", slug, userId);
        postService.deletePost(slug, userId);
        return ResponseEntity.noContent().build();
    }

    private UUID getUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal();
        return user.getId();
    }

    private UUID getOptionalUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof User) {
            return getUserId();
        }
        return null;
    }
}
