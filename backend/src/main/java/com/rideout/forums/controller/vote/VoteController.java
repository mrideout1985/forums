package com.rideout.forums.controller.vote;

import com.rideout.forums.service.vote.VoteService;
import com.rideout.forums.user.User;
import com.rideout.forums.vote.VoteRequest;
import com.rideout.forums.vote.VoteResponse;
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
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@RestController
@RequestMapping("/api/votes")
@Tag(name = "Votes", description = "Voting endpoints")
@RequiredArgsConstructor
@Slf4j
public class VoteController {

    private final VoteService voteService;

    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'MODERATOR')")
    @Operation(summary = "Cast a vote", description = "Upvote or downvote a post or comment. Send value 0 to remove vote.")
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Vote recorded successfully",
                    content = @Content(schema = @Schema(implementation = VoteResponse.class))
            ),
            @ApiResponse(responseCode = "400", description = "Invalid input"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<VoteResponse> castVote(
            @Valid @RequestBody VoteRequest request
    ) {
        UUID userId = getUserId();
        log.info("User {} casting vote on {} {}: {}", userId, request.targetType(), request.targetId(), request.value());
        VoteResponse response = voteService.castVote(request, userId);
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
