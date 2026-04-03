package com.rideout.forums.config;

import com.rideout.forums.auth.JwtProvider;
import com.rideout.forums.controller.comment.CommentController;
import com.rideout.forums.controller.forum.ForumController;
import com.rideout.forums.controller.post.PostController;
import com.rideout.forums.controller.vote.VoteController;
import com.rideout.forums.repository.role.RoleRepository;
import com.rideout.forums.repository.user.UserRepository;
import com.rideout.forums.role.Role;
import com.rideout.forums.service.auth.AuthService;
import com.rideout.forums.service.auth.CustomUserDetailsService;
import com.rideout.forums.service.comment.CommentService;
import com.rideout.forums.service.vote.VoteService;
import com.rideout.forums.user.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.assertj.MockMvcTester;

import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;

@WebMvcTest
@Import(AuthService.class)
class SecurityConfigTests {

    @Autowired
    private MockMvcTester mvc;
    private static final String TEST_USERNAME = "testuser";

    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private RoleRepository roleRepository;

    @MockitoBean
    private PasswordEncoder passwordEncoder;

    @MockitoBean
    private AuthenticationManager authenticationManager;

    @MockitoBean
    private ForumController forumController;

    @MockitoBean
    private PostController postController;

    @MockitoBean
    private CommentController commentController;

    @MockitoBean
    private VoteController voteController;

    @MockitoBean
    private CommentService commentService;

    @MockitoBean
    private VoteService voteService;

    @MockitoBean
    private JwtProvider jwtProvider;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @MockitoBean
    private JwtProperties jwtProperties;

    @BeforeEach
    void setUp() {
        given(jwtProperties.cookieName()).willReturn("jwt");

        Authentication authentication = new UsernamePasswordAuthenticationToken(TEST_USERNAME, "password123");
        given(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .willReturn(authentication);
        given(jwtProvider.generateToken(any(Authentication.class))).willReturn("stub-token");

        Role role = new Role();
        role.setName("ROLE_USER");

        User user = new User();
        user.setUsername(TEST_USERNAME);
        user.setEmail("testuser@example.com");
        user.setRoles(Set.of(role));

        given(userRepository.findByUsername(TEST_USERNAME)).willReturn(Optional.of(user));
    }

    @Test
    @DisplayName("Public endpoints should be accessible without authentication")
    void publicEndpointsShouldBeAccessible() {
        assertThat(mvc.post().uri("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"a\",\"password\":\"b\"}"))
                .satisfies(this::assertNotUnauthorized);
    }

    @Test
    @DisplayName("Register endpoint should be accessible without authentication")
    void registerEndpointShouldBePublic() {
        assertThat(mvc.post().uri("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"a\",\"email\":\"a@b.c\",\"password\":\"12345678\"}"))
                .satisfies(this::assertNotUnauthorized);
    }

    @Test
    @DisplayName("Logout endpoint should be accessible without authentication")
    void logoutEndpointShouldBePublic() {
        assertThat(mvc.post().uri("/api/auth/logout"))
                .satisfies(this::assertNotUnauthorized);
    }

    @Test
    @DisplayName("Protected endpoints should not succeed without authentication")
    void protectedEndpointsShouldRequireAuth() {
        assertThat(mvc.get().uri("/api/auth/me"))
                .satisfies(this::assertIsErrorStatus);
    }

    @Test
    @DisplayName("Swagger UI should be publicly accessible")
    void swaggerUiShouldBePublic() {
        assertThat(mvc.get().uri("/swagger-ui/index.html"))
                .satisfies(this::assertNotUnauthorized);
    }

    @Test
    @DisplayName("CORS should not reject requests from localhost:5173")
    void corsShouldAllowFrontendOrigin() {
        assertThat(mvc.post().uri("/api/auth/login")
                .header(HttpHeaders.ORIGIN, "http://localhost:5173")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"a\",\"password\":\"b\"}"))
                .satisfies(result -> {
                    int status = result.getResponse().getStatus();
                    assertThat(status).isNotEqualTo(403);
                });
    }

    @Test
    @DisplayName("Session management should be stateless (no JSESSIONID cookie)")
    void sessionShouldBeStateless() {
        assertThat(mvc.get().uri("/api/auth/me"))
                .satisfies(result -> {
                    String setCookie = result.getResponse().getHeader(HttpHeaders.SET_COOKIE);
                    if (setCookie != null) {
                        assertThat(setCookie).doesNotContain("JSESSIONID");
                    }
                });
    }

    private void assertNotUnauthorized(org.springframework.test.web.servlet.assertj.MvcTestResult result) {
        int status = result.getResponse().getStatus();
        assertThat(status).isNotEqualTo(401);
        assertThat(status).isNotEqualTo(403);
    }

    private void assertIsErrorStatus(org.springframework.test.web.servlet.assertj.MvcTestResult result) {
        int status = result.getResponse().getStatus();
        assertThat(status).isGreaterThanOrEqualTo(400);
    }
}
