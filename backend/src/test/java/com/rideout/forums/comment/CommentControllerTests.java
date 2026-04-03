package com.rideout.forums.comment;

import com.rideout.forums.config.JwtProperties;
import com.rideout.forums.controller.comment.CommentController;
import com.rideout.forums.repository.user.UserRepository;
import com.rideout.forums.role.Role;
import com.rideout.forums.service.auth.CustomUserDetailsService;
import com.rideout.forums.service.comment.CommentService;
import com.rideout.forums.auth.JwtProvider;
import com.rideout.forums.post.AuthorInfo;
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

import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.willDoNothing;

@WebMvcTest(CommentController.class)
class CommentControllerTests {

    @Autowired
    private MockMvcTester mvc;

    @MockitoBean
    private CommentService commentService;

    @MockitoBean
    private JwtProvider jwtProvider;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private JwtProperties jwtProperties;

    private static final UUID USER_ID = UUID.fromString("00000000-0000-0000-0000-000000000001");
    private static final String POST_SLUG = "test-post";
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
    @DisplayName("Should create comment successfully")
    void shouldCreateComment() {
        var response = new CommentResponse(
                1L, POST_SLUG,
                new AuthorInfo(USER_ID, "testuser"),
                "Test comment", null, 0, 0, null,
                OffsetDateTime.now(), OffsetDateTime.now(), List.of()
        );
        given(commentService.createComment(any(CommentCreateRequest.class), eq(USER_ID)))
                .willReturn(response);

        assertThat(mvc.post().uri("/api/comments")
                .header("Authorization", "Bearer " + FAKE_JWT)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"postSlug": "test-post", "body": "Test comment"}
                    """))
                .hasStatus(HttpStatus.CREATED)
                .bodyJson()
                .convertTo(CommentResponse.class)
                .satisfies(r -> {
                    assertThat(r.id()).isEqualTo(1L);
                    assertThat(r.body()).isEqualTo("Test comment");
                });
    }

    @Test
    @DisplayName("Should reject comment creation without authentication")
    void shouldRejectUnauthenticatedCreate() {
        assertThat(mvc.post().uri("/api/comments")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"postSlug": "test-post", "body": "Test comment"}
                    """))
                .hasStatus(HttpStatus.UNAUTHORIZED);
    }

    @Test
    @DisplayName("Should get comments for a post")
    void shouldGetCommentsForPost() {
        var comment = new CommentResponse(
                1L, POST_SLUG,
                new AuthorInfo(USER_ID, "testuser"),
                "Test comment", null, 2, 1, null,
                OffsetDateTime.now(), OffsetDateTime.now(), List.of()
        );
        given(commentService.getCommentsForPost(eq(POST_SLUG), any()))
                .willReturn(List.of(comment));

        assertThat(mvc.get().uri("/api/comments/post/{postSlug}", POST_SLUG))
                .hasStatusOk();
    }

    @Test
    @DisplayName("Should delete comment when authorized")
    void shouldDeleteComment() {
        willDoNothing().given(commentService).deleteComment(eq(1L), eq(USER_ID));

        assertThat(mvc.delete().uri("/api/comments/{commentId}", 1L)
                .header("Authorization", "Bearer " + FAKE_JWT))
                .hasStatus(HttpStatus.NO_CONTENT);
    }

    @Test
    @DisplayName("Should reject delete without authentication")
    void shouldRejectUnauthenticatedDelete() {
        assertThat(mvc.delete().uri("/api/comments/{commentId}", 1L))
                .hasStatus(HttpStatus.UNAUTHORIZED);
    }

    @Test
    @DisplayName("Should reject comment with blank body")
    void shouldRejectBlankBody() {
        assertThat(mvc.post().uri("/api/comments")
                .header("Authorization", "Bearer " + FAKE_JWT)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"postSlug": "test-post", "body": ""}
                    """))
                .hasStatus(HttpStatus.BAD_REQUEST);
    }
}
