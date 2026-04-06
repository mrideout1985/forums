package com.rideout.forums.controller.forum;

import com.rideout.forums.forum.ForumResponse;
import com.rideout.forums.service.forum.ForumMembershipService;
import com.rideout.forums.user.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@RequestMapping("/api/forums")
@Tag(name = "Forum Membership", description = "Forum join/leave endpoints")
@RequiredArgsConstructor
@Slf4j
public class ForumMembershipController {

    private final ForumMembershipService forumMembershipService;

    @PostMapping("/{slug}/membership")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'MODERATOR')")
    @Operation(summary = "Join a forum", description = "Join a forum (authenticated users)")
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Successfully joined forum",
                    content = @Content(schema = @Schema(implementation = ForumResponse.class))
            ),
            @ApiResponse(responseCode = "401", description = "Not authenticated"),
            @ApiResponse(responseCode = "404", description = "Forum not found"),
            @ApiResponse(responseCode = "409", description = "Already a member")
    })
    public ResponseEntity<ForumResponse> joinForum(@PathVariable String slug) {
        UUID userId = getUserId();
        log.info("User {} joining forum: {}", userId, slug);
        ForumResponse response = forumMembershipService.joinForum(slug, userId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{slug}/membership")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'MODERATOR')")
    @Operation(summary = "Leave a forum", description = "Leave a forum (authenticated users)")
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Successfully left forum",
                    content = @Content(schema = @Schema(implementation = ForumResponse.class))
            ),
            @ApiResponse(responseCode = "401", description = "Not authenticated"),
            @ApiResponse(responseCode = "404", description = "Forum not found or not a member")
    })
    public ResponseEntity<ForumResponse> leaveForum(@PathVariable String slug) {
        UUID userId = getUserId();
        log.info("User {} leaving forum: {}", userId, slug);
        ForumResponse response = forumMembershipService.leaveForum(slug, userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/joined")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'MODERATOR')")
    @Operation(summary = "List joined forums", description = "Retrieve the forums the current user has joined")
    @ApiResponse(
            responseCode = "200",
            description = "Joined forums retrieved"
    )
    public ResponseEntity<Page<ForumResponse>> listJoinedForums(Pageable pageable) {
        UUID userId = getUserId();
        log.info("Listing joined forums for user: {}", userId);
        Page<ForumResponse> response = forumMembershipService.listJoinedForums(userId, pageable);
        return ResponseEntity.ok(response);
    }

    private UUID getUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof User user)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        return user.getId();
    }
}
