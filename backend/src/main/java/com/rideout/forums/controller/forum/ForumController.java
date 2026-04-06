package com.rideout.forums.controller.forum;

import com.rideout.forums.forum.ForumCreateRequest;
import com.rideout.forums.forum.ForumResponse;
import com.rideout.forums.forum.ForumUpdateRequest;
import com.rideout.forums.service.forum.ForumService;
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

import java.util.UUID;

@RestController
@RequestMapping("/api/forums")
@Tag(name = "Forums", description = "Forum management endpoints")
@RequiredArgsConstructor
@Slf4j
public class ForumController {

    private final ForumService forumService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new forum", description = "Create a new forum (admin only)")
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "201",
                    description = "Forum created successfully",
                    content = @Content(schema = @Schema(implementation = ForumResponse.class))
            ),
            @ApiResponse(responseCode = "400", description = "Invalid input or slug already exists"),
            @ApiResponse(responseCode = "403", description = "Unauthorized - admin role required")
    })
    public ResponseEntity<ForumResponse> createForum(@Valid @RequestBody ForumCreateRequest request) {
        log.info("Creating forum with slug: {}", request.slug());
        ForumResponse response = forumService.createForum(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{slug}")
    @Operation(summary = "Get forum by slug", description = "Retrieve a forum by its slug")
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Forum retrieved successfully",
                    content = @Content(schema = @Schema(implementation = ForumResponse.class))
            ),
            @ApiResponse(responseCode = "404", description = "Forum not found")
    })
    public ResponseEntity<ForumResponse> getForum(@PathVariable String slug) {
        log.info("Retrieving forum: {}", slug);
        ForumResponse response = forumService.getForum(slug, getCurrentUserIdOrNull());
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @Operation(summary = "List all forums", description = "Retrieve a paginated list of all forums")
    @ApiResponse(
            responseCode = "200",
            description = "Forums retrieved successfully"
    )
    public ResponseEntity<Page<ForumResponse>> listForums(Pageable pageable) {
        log.info("Listing forums with pagination: page={}, size={}", pageable.getPageNumber(), pageable.getPageSize());
        Page<ForumResponse> response = forumService.listForums(pageable, getCurrentUserIdOrNull());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{slug}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update forum", description = "Update forum details (admin only)")
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Forum updated successfully",
                    content = @Content(schema = @Schema(implementation = ForumResponse.class))
            ),
            @ApiResponse(responseCode = "404", description = "Forum not found"),
            @ApiResponse(responseCode = "403", description = "Unauthorized - admin role required")
    })
    public ResponseEntity<ForumResponse> updateForum(
            @PathVariable String slug,
            @Valid @RequestBody ForumUpdateRequest request
    ) {
        log.info("Updating forum: {}", slug);
        ForumResponse response = forumService.updateForum(slug, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{slug}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete forum", description = "Delete a forum and all its posts (admin only)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Forum deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Forum not found"),
            @ApiResponse(responseCode = "403", description = "Unauthorized - admin role required")
    })
    public ResponseEntity<Void> deleteForum(@PathVariable String slug) {
        log.info("Deleting forum: {}", slug);
        forumService.deleteForum(slug);
        return ResponseEntity.noContent().build();
    }

    private UUID getCurrentUserIdOrNull() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof User user) {
            return user.getId();
        }
        return null;
    }
}
