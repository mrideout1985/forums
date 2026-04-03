package com.rideout.forums.service.vote;

import com.rideout.forums.repository.user.UserRepository;
import com.rideout.forums.repository.vote.VoteRepository;
import com.rideout.forums.user.User;
import com.rideout.forums.vote.Vote;
import com.rideout.forums.vote.VoteRequest;
import com.rideout.forums.vote.VoteResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class VoteService {

    private static final Set<String> VALID_TARGET_TYPES = Set.of("POST", "COMMENT");
    private static final Set<Integer> VALID_VALUES = Set.of(-1, 0, 1);

    private final VoteRepository voteRepository;
    private final UserRepository userRepository;

    public VoteResponse castVote(VoteRequest request, UUID userId) {
        String targetType = request.targetType().toUpperCase();
        if (!VALID_TARGET_TYPES.contains(targetType)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Invalid target type: " + request.targetType() + ". Must be POST or COMMENT");
        }

        if (!VALID_VALUES.contains(request.value())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Invalid vote value: " + request.value() + ". Must be -1, 0, or 1");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found: " + userId));

        Optional<Vote> existing = voteRepository
                .findByUserIdAndTargetTypeAndTargetId(userId, targetType, request.targetId());

        if (request.value() == 0) {
            // Remove vote
            existing.ifPresent(voteRepository::delete);
        } else if (existing.isPresent()) {
            // Update existing vote
            Vote vote = existing.get();
            vote.setValue(request.value());
            voteRepository.save(vote);
        } else {
            // Create new vote
            Vote vote = Vote.builder()
                    .user(user)
                    .targetType(targetType)
                    .targetId(request.targetId())
                    .value(request.value())
                    .build();
            voteRepository.save(vote);
        }

        // Flush to ensure counts are accurate
        voteRepository.flush();

        long upvotes = voteRepository.countByTargetTypeAndTargetIdAndValue(targetType, request.targetId(), 1);
        long downvotes = voteRepository.countByTargetTypeAndTargetIdAndValue(targetType, request.targetId(), -1);

        Integer userVote = request.value() == 0 ? null : request.value();

        return new VoteResponse(upvotes, downvotes, userVote);
    }
}
