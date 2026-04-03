package com.rideout.forums.vote;

import com.rideout.forums.auth.JwtProvider;
import com.rideout.forums.config.JwtProperties;
import com.rideout.forums.controller.vote.VoteController;
import com.rideout.forums.repository.user.UserRepository;
import com.rideout.forums.role.Role;
import com.rideout.forums.service.auth.CustomUserDetailsService;
import com.rideout.forums.service.vote.VoteService;
import com.rideout.forums.user.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.assertj.MockMvcTester;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;

@WebMvcTest(VoteController.class)
class VoteControllerTests {

    @Autowired
    private MockMvcTester mvc;

    @MockitoBean
    private VoteService voteService;

    @MockitoBean
    private JwtProvider jwtProvider;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private JwtProperties jwtProperties;

    private static final UUID USER_ID = UUID.fromString("00000000-0000-0000-0000-000000000001");
    private static final String FAKE_JWT = "test-jwt";

    @BeforeEach
    void setUp() {
        given(jwtProperties.cookieName()).willReturn("jwt");
        var mockUser = User.builder()
                .id(USER_ID)
                .username(USER_ID.toString())
                .email("test@test.com")
                .passwordHash("hash")
                .isActive(true)
                .roles(new HashSet<>(Set.of(Role.builder().id(UUID.randomUUID()).name("ROLE_USER").build())))
                .build();
        given(jwtProvider.validateToken(FAKE_JWT)).willReturn(true);
        given(jwtProvider.getUsernameFromToken(FAKE_JWT)).willReturn(USER_ID.toString());
        given(customUserDetailsService.loadUserByUsername(USER_ID.toString())).willReturn(mockUser);
    }

    @Test
    @DisplayName("Should cast upvote successfully")
    void shouldCastUpvote() {
        var response = new VoteResponse(1, 0, 1);
        given(voteService.castVote(any(VoteRequest.class), eq(USER_ID)))
                .willReturn(response);

        assertThat(mvc.post().uri("/api/votes")
                .header("Authorization", "Bearer " + FAKE_JWT)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"targetType": "POST", "targetId": "some-post-id", "value": 1}
                    """))
                .hasStatusOk()
                .bodyJson()
                .convertTo(VoteResponse.class)
                .satisfies(r -> {
                    assertThat(r.upvotes()).isEqualTo(1);
                    assertThat(r.downvotes()).isEqualTo(0);
                    assertThat(r.userVote()).isEqualTo(1);
                });
    }

    @Test
    @DisplayName("Should cast downvote successfully")
    void shouldCastDownvote() {
        var response = new VoteResponse(0, 1, -1);
        given(voteService.castVote(any(VoteRequest.class), eq(USER_ID)))
                .willReturn(response);

        assertThat(mvc.post().uri("/api/votes")
                .header("Authorization", "Bearer " + FAKE_JWT)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"targetType": "COMMENT", "targetId": "42", "value": -1}
                    """))
                .hasStatusOk()
                .bodyJson()
                .convertTo(VoteResponse.class)
                .satisfies(r -> {
                    assertThat(r.downvotes()).isEqualTo(1);
                    assertThat(r.userVote()).isEqualTo(-1);
                });
    }

    @Test
    @DisplayName("Should remove vote with value 0")
    void shouldRemoveVote() {
        var response = new VoteResponse(0, 0, null);
        given(voteService.castVote(any(VoteRequest.class), eq(USER_ID)))
                .willReturn(response);

        assertThat(mvc.post().uri("/api/votes")
                .header("Authorization", "Bearer " + FAKE_JWT)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"targetType": "POST", "targetId": "some-post-id", "value": 0}
                    """))
                .hasStatusOk()
                .bodyJson()
                .convertTo(VoteResponse.class)
                .satisfies(r -> {
                    assertThat(r.userVote()).isNull();
                });
    }

    @Test
    @DisplayName("Should reject vote without authentication")
    void shouldRejectUnauthenticatedVote() {
        assertThat(mvc.post().uri("/api/votes")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"targetType": "POST", "targetId": "some-post-id", "value": 1}
                    """))
                .hasStatus(HttpStatus.UNAUTHORIZED);
    }

    @Test
    @DisplayName("Should return 400 for missing target type")
    void shouldRejectMissingTargetType() {
        assertThat(mvc.post().uri("/api/votes")
                .header("Authorization", "Bearer " + FAKE_JWT)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"targetId": "some-post-id", "value": 1}
                    """))
                .hasStatus(HttpStatus.BAD_REQUEST);
    }

    @Test
    @DisplayName("Should return 400 for missing value")
    void shouldRejectMissingValue() {
        assertThat(mvc.post().uri("/api/votes")
                .header("Authorization", "Bearer " + FAKE_JWT)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"targetType": "POST", "targetId": "some-post-id"}
                    """))
                .hasStatus(HttpStatus.BAD_REQUEST);
    }

    @Test
    @DisplayName("Should propagate 400 for invalid target type from service")
    void shouldPropagate400ForInvalidTargetType() {
        given(voteService.castVote(any(VoteRequest.class), eq(USER_ID)))
                .willThrow(new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid target type"));

        assertThat(mvc.post().uri("/api/votes")
                .header("Authorization", "Bearer " + FAKE_JWT)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"targetType": "INVALID", "targetId": "some-id", "value": 1}
                    """))
                .hasStatus(HttpStatus.BAD_REQUEST);
    }
}
