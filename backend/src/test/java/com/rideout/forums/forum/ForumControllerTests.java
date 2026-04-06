package com.rideout.forums.forum;

import com.rideout.forums.auth.JwtProvider;
import com.rideout.forums.config.JwtProperties;
import com.rideout.forums.controller.forum.ForumController;
import com.rideout.forums.repository.user.UserRepository;
import com.rideout.forums.role.Role;
import com.rideout.forums.service.auth.CustomUserDetailsService;
import com.rideout.forums.service.forum.ForumService;
import com.rideout.forums.user.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.assertj.MockMvcTester;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.given;

@WebMvcTest(ForumController.class)
class ForumControllerTests {

    @Autowired
    private MockMvcTester mvc;

    @MockitoBean
    private ForumService forumService;

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
    @DisplayName("Should list all forums without query")
    void shouldListAllForums() {
        var forum = new ForumResponse(
                UUID.randomUUID(), "tech", "Tech", "Technology forum",
                false, 5L, LocalDateTime.now(), LocalDateTime.now()
        );
        given(forumService.listForums(any(), any(), isNull()))
                .willReturn(new PageImpl<>(List.of(forum), PageRequest.of(0, 20), 1));

        assertThat(mvc.get().uri("/api/forums"))
                .hasStatusOk();
    }

    @Test
    @DisplayName("Should filter forums when q parameter is provided")
    void shouldFilterForumsWithQuery() {
        var forum = new ForumResponse(
                UUID.randomUUID(), "tech", "Tech", "Technology forum",
                false, 5L, LocalDateTime.now(), LocalDateTime.now()
        );
        given(forumService.listForums(any(), any(), eq("tech")))
                .willReturn(new PageImpl<>(List.of(forum), PageRequest.of(0, 20), 1));

        assertThat(mvc.get().uri("/api/forums?q=tech"))
                .hasStatusOk();
    }

    @Test
    @DisplayName("Should return empty page when no forums match query")
    void shouldReturnEmptyPageWhenNoMatch() {
        given(forumService.listForums(any(), any(), eq("nonexistent")))
                .willReturn(new PageImpl<>(List.of(), PageRequest.of(0, 20), 0));

        assertThat(mvc.get().uri("/api/forums?q=nonexistent"))
                .hasStatusOk();
    }

    @Test
    @DisplayName("Should include membership data for authenticated user")
    void shouldIncludeMembershipForAuthenticatedUser() {
        var forum = new ForumResponse(
                UUID.randomUUID(), "tech", "Tech", "Technology forum",
                true, 10L, LocalDateTime.now(), LocalDateTime.now()
        );
        given(forumService.listForums(any(), eq(USER_ID), eq("tech")))
                .willReturn(new PageImpl<>(List.of(forum), PageRequest.of(0, 20), 1));

        assertThat(mvc.get().uri("/api/forums?q=tech")
                .header("Authorization", "Bearer " + FAKE_JWT))
                .hasStatusOk();
    }

    @Test
    @DisplayName("Should get forum by slug")
    void shouldGetForumBySlug() {
        var forum = new ForumResponse(
                UUID.randomUUID(), "tech", "Tech", "Technology forum",
                false, 5L, LocalDateTime.now(), LocalDateTime.now()
        );
        given(forumService.getForum(eq("tech"), any())).willReturn(forum);

        assertThat(mvc.get().uri("/api/forums/tech"))
                .hasStatusOk()
                .bodyJson()
                .convertTo(ForumResponse.class)
                .satisfies(r -> {
                    assertThat(r.slug()).isEqualTo("tech");
                    assertThat(r.name()).isEqualTo("Tech");
                });
    }
}
