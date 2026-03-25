package com.rideout.forums.auth;

import com.rideout.forums.config.JwtProperties;
import com.rideout.forums.model.AuthRequest;
import com.rideout.forums.model.AuthResponse;
import com.rideout.forums.model.LoginRequest;
import com.rideout.forums.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.assertj.MockMvcTester;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;

@WebMvcTest(AuthController.class)
class AuthControllerTests {

    @Autowired
    private MockMvcTester mvc;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private JwtProvider jwtProvider;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private JwtProperties jwtProperties;

    @BeforeEach
    void setUp() {
        given(jwtProperties.cookieName()).willReturn("jwt");
        given(jwtProperties.expiration()).willReturn(3600000L);

        var registerResponse = new AuthResponse();
        registerResponse.setToken("token123");
        registerResponse.setUsername("testuser");
        registerResponse.setEmail("test@example.com");
        registerResponse.setRoles(Set.of("ROLE_USER"));
        given(authService.register(any(AuthRequest.class))).willReturn(registerResponse);

        var loginResponse = new AuthResponse();
        loginResponse.setToken("eyJhbGciOiJIUzI1NiJ9.test.token");
        loginResponse.setUsername("testuser");
        loginResponse.setEmail("test@example.com");
        loginResponse.setRoles(Set.of("ROLE_USER"));
        given(authService.login(any(LoginRequest.class))).willReturn(loginResponse);
    }

    @Test
    @DisplayName("Should register successfully and set JWT cookie")
    void shouldRegisterSuccessfully() {
        var json = """
            {"username": "testuser", "email": "test@example.com", "password": "password123"}
            """;

        assertThat(mvc.post().uri("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .hasStatus(HttpStatus.CREATED)
                .bodyJson()
                .convertTo(AuthResponse.class)
                .satisfies(response -> {
                    assertThat(response.getToken()).isEqualTo("token123");
                    assertThat(response.getUsername()).isEqualTo("testuser");
                });
    }

    @Test
    @DisplayName("Should set HttpOnly secure cookie on register")
    void shouldSetCookieOnRegister() {
        var json = """
            {"username": "testuser", "email": "test@example.com", "password": "password123"}
            """;

        var result = mvc.post().uri("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json)
                .exchange();

        assertThat(result).hasStatus(HttpStatus.CREATED);
        var cookie = result.getResponse().getHeader("Set-Cookie");
        assertThat(cookie)
                .contains("jwt=token123")
                .containsIgnoringCase("HttpOnly")
                .containsIgnoringCase("Secure")
                .containsIgnoringCase("SameSite=Strict");
    }

    @Test
    @DisplayName("Should reject register with missing username")
    void shouldRejectRegisterWithMissingUsername() {
        var json = """
            {"email": "test@example.com", "password": "password123"}
            """;

        assertThat(mvc.post().uri("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .hasStatus(HttpStatus.BAD_REQUEST);
    }

    @Test
    @DisplayName("Should reject register with missing password")
    void shouldRejectRegisterWithMissingPassword() {
        var json = """
            {"username": "testuser", "email": "test@example.com"}
            """;

        assertThat(mvc.post().uri("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .hasStatus(HttpStatus.BAD_REQUEST);
    }

    @Test
    @DisplayName("Should login successfully and return JWT")
    void shouldLoginSuccessfully() {
        var json = """
            {"username": "testuser", "password": "password123"}
            """;

        assertThat(mvc.post().uri("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .hasStatusOk()
                .bodyJson()
                .convertTo(AuthResponse.class)
                .satisfies(response -> {
                    assertThat(response.getToken()).isEqualTo("eyJhbGciOiJIUzI1NiJ9.test.token");
                    assertThat(response.getUsername()).isEqualTo("testuser");
                });
    }

    @Test
    @DisplayName("Should set HttpOnly secure cookie on login")
    void shouldSetCookieOnLogin() {
        var json = """
            {"username": "testuser", "password": "password123"}
            """;

        var result = mvc.post().uri("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json)
                .exchange();

        assertThat(result).hasStatusOk();
        var cookie = result.getResponse().getHeader("Set-Cookie");
        assertThat(cookie)
                .contains("jwt=")
                .containsIgnoringCase("HttpOnly")
                .containsIgnoringCase("Secure")
                .containsIgnoringCase("SameSite=Strict");
    }

    @Test
    @DisplayName("Should reject login with missing username")
    void shouldRejectLoginWithMissingUsername() {
        var json = """
            {"password": "password123"}
            """;

        assertThat(mvc.post().uri("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .hasStatus(HttpStatus.BAD_REQUEST);
    }

    @Test
    @DisplayName("Should reject login with missing password")
    void shouldRejectLoginWithMissingPassword() {
        var json = """
            {"username": "testuser"}
            """;

        assertThat(mvc.post().uri("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .hasStatus(HttpStatus.BAD_REQUEST);
    }

    @Test
    @DisplayName("Should return 401 for invalid credentials")
    void shouldReturn401ForInvalidCredentials() {
        given(authService.login(any(LoginRequest.class)))
                .willThrow(new BadCredentialsException("Invalid username or password"));

        var json = """
            {"username": "testuser", "password": "wrongpassword"}
            """;

        assertThat(mvc.post().uri("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .hasStatus(HttpStatus.UNAUTHORIZED);
    }

    @Test
    @DisplayName("Should clear cookie on logout")
    void shouldClearCookieOnLogout() {
        var result = mvc.post().uri("/api/auth/logout").exchange();

        assertThat(result).hasStatus(HttpStatus.NO_CONTENT);
        var cookie = result.getResponse().getHeader("Set-Cookie");
        assertThat(cookie).contains("Max-Age=0");
    }

    @Test
    @DisplayName("Should return 401/403 for unauthenticated /me request")
    void shouldRejectUnauthenticatedMeRequest() {
        var result = mvc.get().uri("/api/auth/me").exchange();

        assertThat(result.getResponse().getStatus()).isGreaterThanOrEqualTo(400);
    }
}
