package com.rideout.forums.forum;

import com.rideout.forums.auth.JwtProvider;
import com.rideout.forums.config.JwtProperties;
import com.rideout.forums.controller.forum.ForumMembershipController;
import com.rideout.forums.repository.user.UserRepository;
import com.rideout.forums.role.Role;
import com.rideout.forums.service.auth.CustomUserDetailsService;
import com.rideout.forums.service.forum.ForumMembershipService;
import com.rideout.forums.user.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.assertj.MockMvcTester;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;

@WebMvcTest(ForumMembershipController.class)
class ForumMembershipControllerTests {

    @Autowired
    private MockMvcTester mvc;

    @MockitoBean
    private ForumMembershipService forumMembershipService;

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
    @DisplayName("Should join forum successfully")
    void shouldJoinForum() {
        var response = new ForumResponse(
                UUID.randomUUID(), "test-forum", "Test Forum", "desc",
                true, 1L, LocalDateTime.now(), LocalDateTime.now()
        );
        given(forumMembershipService.joinForum(eq("test-forum"), eq(USER_ID)))
                .willReturn(response);

        assertThat(mvc.post().uri("/api/forums/test-forum/membership")
                .header("Authorization", "Bearer " + FAKE_JWT))
                .hasStatusOk()
                .bodyJson()
                .convertTo(ForumResponse.class)
                .satisfies(r -> {
                    assertThat(r.joined()).isTrue();
                    assertThat(r.memberCount()).isEqualTo(1L);
                });
    }

    @Test
    @DisplayName("Should leave forum successfully")
    void shouldLeaveForum() {
        var response = new ForumResponse(
                UUID.randomUUID(), "test-forum", "Test Forum", "desc",
                false, 0L, LocalDateTime.now(), LocalDateTime.now()
        );
        given(forumMembershipService.leaveForum(eq("test-forum"), eq(USER_ID)))
                .willReturn(response);

        assertThat(mvc.delete().uri("/api/forums/test-forum/membership")
                .header("Authorization", "Bearer " + FAKE_JWT))
                .hasStatusOk()
                .bodyJson()
                .convertTo(ForumResponse.class)
                .satisfies(r -> {
                    assertThat(r.joined()).isFalse();
                    assertThat(r.memberCount()).isEqualTo(0L);
                });
    }

    @Test
    @DisplayName("Should list joined forums")
    void shouldListJoinedForums() {
        var forum = new ForumResponse(
                UUID.randomUUID(), "test-forum", "Test Forum", "desc",
                true, 5L, LocalDateTime.now(), LocalDateTime.now()
        );
        given(forumMembershipService.listJoinedForums(eq(USER_ID), any()))
                .willReturn(new PageImpl<>(List.of(forum), PageRequest.of(0, 50), 1));

        assertThat(mvc.get().uri("/api/forums/joined")
                .header("Authorization", "Bearer " + FAKE_JWT))
                .hasStatusOk();
    }

    @Test
    @DisplayName("Should reject join without authentication")
    void shouldRejectJoinWithoutAuth() {
        assertThat(mvc.post().uri("/api/forums/test-forum/membership"))
                .hasStatus(HttpStatus.UNAUTHORIZED);
    }

    @Test
    @DisplayName("Should reject leave without authentication")
    void shouldRejectLeaveWithoutAuth() {
        assertThat(mvc.delete().uri("/api/forums/test-forum/membership"))
                .hasStatus(HttpStatus.UNAUTHORIZED);
    }

    @Test
    @DisplayName("Should propagate 409 when already a member")
    void shouldPropagate409WhenAlreadyMember() {
        given(forumMembershipService.joinForum(eq("test-forum"), eq(USER_ID)))
                .willThrow(new ResponseStatusException(HttpStatus.CONFLICT, "Already a member"));

        assertThat(mvc.post().uri("/api/forums/test-forum/membership")
                .header("Authorization", "Bearer " + FAKE_JWT))
                .hasStatus(HttpStatus.CONFLICT);
    }

    @Test
    @DisplayName("Should propagate 404 when forum not found")
    void shouldPropagate404WhenForumNotFound() {
        given(forumMembershipService.joinForum(eq("nonexistent"), eq(USER_ID)))
                .willThrow(new ResponseStatusException(HttpStatus.NOT_FOUND, "Forum not found"));

        assertThat(mvc.post().uri("/api/forums/nonexistent/membership")
                .header("Authorization", "Bearer " + FAKE_JWT))
                .hasStatus(HttpStatus.NOT_FOUND);
    }
}
