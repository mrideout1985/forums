package com.rideout.forums.vote;

import com.rideout.forums.repository.user.UserRepository;
import com.rideout.forums.repository.vote.VoteRepository;
import com.rideout.forums.service.vote.VoteService;
import com.rideout.forums.user.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashSet;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;
import static org.mockito.Mockito.never;

@ExtendWith(MockitoExtension.class)
class VoteServiceTests {

    @Mock
    private VoteRepository voteRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private VoteService voteService;

    private static final UUID USER_ID = UUID.randomUUID();
    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(USER_ID)
                .username("testuser")
                .email("test@example.com")
                .passwordHash("hash")
                .isActive(true)
                .roles(new HashSet<>())
                .build();
    }

    @Nested
    @DisplayName("castVote - new vote")
    class NewVote {

        @Test
        @DisplayName("Should create a new upvote on a post")
        void shouldCreateNewUpvote() {
            var request = new VoteRequest("POST", "post-id-123", 1);

            given(userRepository.findById(USER_ID)).willReturn(Optional.of(testUser));
            given(voteRepository.findByUserIdAndTargetTypeAndTargetId(USER_ID, "POST", "post-id-123"))
                    .willReturn(Optional.empty());
            given(voteRepository.countByTargetTypeAndTargetIdAndValue("POST", "post-id-123", 1)).willReturn(1L);
            given(voteRepository.countByTargetTypeAndTargetIdAndValue("POST", "post-id-123", -1)).willReturn(0L);

            VoteResponse result = voteService.castVote(request, USER_ID);

            assertThat(result.upvotes()).isEqualTo(1);
            assertThat(result.downvotes()).isEqualTo(0);
            assertThat(result.userVote()).isEqualTo(1);
            then(voteRepository).should().save(any(Vote.class));
        }

        @Test
        @DisplayName("Should create a new downvote on a comment")
        void shouldCreateNewDownvote() {
            var request = new VoteRequest("COMMENT", "42", -1);

            given(userRepository.findById(USER_ID)).willReturn(Optional.of(testUser));
            given(voteRepository.findByUserIdAndTargetTypeAndTargetId(USER_ID, "COMMENT", "42"))
                    .willReturn(Optional.empty());
            given(voteRepository.countByTargetTypeAndTargetIdAndValue("COMMENT", "42", 1)).willReturn(0L);
            given(voteRepository.countByTargetTypeAndTargetIdAndValue("COMMENT", "42", -1)).willReturn(1L);

            VoteResponse result = voteService.castVote(request, USER_ID);

            assertThat(result.upvotes()).isEqualTo(0);
            assertThat(result.downvotes()).isEqualTo(1);
            assertThat(result.userVote()).isEqualTo(-1);
        }
    }

    @Nested
    @DisplayName("castVote - update existing")
    class UpdateVote {

        @Test
        @DisplayName("Should update an existing vote")
        void shouldUpdateExistingVote() {
            var existing = Vote.builder()
                    .id(1L)
                    .user(testUser)
                    .targetType("POST")
                    .targetId("post-id-123")
                    .value(1)
                    .build();
            var request = new VoteRequest("POST", "post-id-123", -1);

            given(userRepository.findById(USER_ID)).willReturn(Optional.of(testUser));
            given(voteRepository.findByUserIdAndTargetTypeAndTargetId(USER_ID, "POST", "post-id-123"))
                    .willReturn(Optional.of(existing));
            given(voteRepository.countByTargetTypeAndTargetIdAndValue("POST", "post-id-123", 1)).willReturn(0L);
            given(voteRepository.countByTargetTypeAndTargetIdAndValue("POST", "post-id-123", -1)).willReturn(1L);

            VoteResponse result = voteService.castVote(request, USER_ID);

            assertThat(existing.getValue()).isEqualTo(-1);
            assertThat(result.userVote()).isEqualTo(-1);
            then(voteRepository).should().save(existing);
        }
    }

    @Nested
    @DisplayName("castVote - remove vote")
    class RemoveVote {

        @Test
        @DisplayName("Should remove existing vote when value is 0")
        void shouldRemoveVoteWithZero() {
            var existing = Vote.builder()
                    .id(1L)
                    .user(testUser)
                    .targetType("POST")
                    .targetId("post-id-123")
                    .value(1)
                    .build();
            var request = new VoteRequest("POST", "post-id-123", 0);

            given(userRepository.findById(USER_ID)).willReturn(Optional.of(testUser));
            given(voteRepository.findByUserIdAndTargetTypeAndTargetId(USER_ID, "POST", "post-id-123"))
                    .willReturn(Optional.of(existing));
            given(voteRepository.countByTargetTypeAndTargetIdAndValue("POST", "post-id-123", 1)).willReturn(0L);
            given(voteRepository.countByTargetTypeAndTargetIdAndValue("POST", "post-id-123", -1)).willReturn(0L);

            VoteResponse result = voteService.castVote(request, USER_ID);

            assertThat(result.userVote()).isNull();
            assertThat(result.upvotes()).isEqualTo(0);
            then(voteRepository).should().delete(existing);
        }

        @Test
        @DisplayName("Should no-op when removing non-existent vote")
        void shouldNoOpWhenRemovingNonExistentVote() {
            var request = new VoteRequest("POST", "post-id-123", 0);

            given(userRepository.findById(USER_ID)).willReturn(Optional.of(testUser));
            given(voteRepository.findByUserIdAndTargetTypeAndTargetId(USER_ID, "POST", "post-id-123"))
                    .willReturn(Optional.empty());
            given(voteRepository.countByTargetTypeAndTargetIdAndValue("POST", "post-id-123", 1)).willReturn(0L);
            given(voteRepository.countByTargetTypeAndTargetIdAndValue("POST", "post-id-123", -1)).willReturn(0L);

            VoteResponse result = voteService.castVote(request, USER_ID);

            assertThat(result.userVote()).isNull();
            then(voteRepository).should(never()).delete(any(Vote.class));
            then(voteRepository).should(never()).save(any(Vote.class));
        }
    }

    @Nested
    @DisplayName("castVote - validation")
    class Validation {

        @Test
        @DisplayName("Should reject invalid target type")
        void shouldRejectInvalidTargetType() {
            var request = new VoteRequest("INVALID", "some-id", 1);

            assertThatThrownBy(() -> voteService.castVote(request, USER_ID))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("Invalid target type");
        }

        @Test
        @DisplayName("Should reject invalid vote value")
        void shouldRejectInvalidVoteValue() {
            var request = new VoteRequest("POST", "some-id", 5);

            assertThatThrownBy(() -> voteService.castVote(request, USER_ID))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("Invalid vote value");
        }

        @Test
        @DisplayName("Should handle case-insensitive target type")
        void shouldHandleCaseInsensitiveTargetType() {
            var request = new VoteRequest("post", "post-id-123", 1);

            given(userRepository.findById(USER_ID)).willReturn(Optional.of(testUser));
            given(voteRepository.findByUserIdAndTargetTypeAndTargetId(USER_ID, "POST", "post-id-123"))
                    .willReturn(Optional.empty());
            given(voteRepository.countByTargetTypeAndTargetIdAndValue("POST", "post-id-123", 1)).willReturn(1L);
            given(voteRepository.countByTargetTypeAndTargetIdAndValue("POST", "post-id-123", -1)).willReturn(0L);

            VoteResponse result = voteService.castVote(request, USER_ID);

            assertThat(result.upvotes()).isEqualTo(1);
        }

        @Test
        @DisplayName("Should throw 404 when user not found")
        void shouldThrowWhenUserNotFound() {
            var request = new VoteRequest("POST", "some-id", 1);

            given(userRepository.findById(USER_ID)).willReturn(Optional.empty());

            assertThatThrownBy(() -> voteService.castVote(request, USER_ID))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("User not found");
        }
    }
}
