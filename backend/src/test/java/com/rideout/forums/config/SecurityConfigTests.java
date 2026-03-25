package com.rideout.forums.config;

import com.rideout.forums.auth.AuthService;
import com.rideout.forums.auth.CustomUserDetailsService;
import com.rideout.forums.auth.JwtProvider;
import com.rideout.forums.model.AuthResponse;
import com.rideout.forums.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.assertj.MockMvcTester;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;

@WebMvcTest
class SecurityConfigTests {

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

        var stubResponse = new AuthResponse();
        stubResponse.setToken("stub-token");
        stubResponse.setUsername("testuser");
        given(authService.login(any())).willReturn(stubResponse);
        given(authService.register(any())).willReturn(stubResponse);
    }

    @Test
    @DisplayName("Public endpoints should be accessible without authentication")
    void publicEndpointsShouldBeAccessible() {
        assertThat(mvc.post().uri("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"a\",\"password\":\"b\"}"))
                .satisfies(result -> {
                    int status = result.getResponse().getStatus();
                    assertThat(status).isNotEqualTo(401);
                    assertThat(status).isNotEqualTo(403);
                });
    }

    @Test
    @DisplayName("Register endpoint should be accessible without authentication")
    void registerEndpointShouldBePublic() {
        assertThat(mvc.post().uri("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"a\",\"email\":\"a@b.c\",\"password\":\"12345678\"}"))
                .satisfies(result -> {
                    int status = result.getResponse().getStatus();
                    assertThat(status).isNotEqualTo(401);
                    assertThat(status).isNotEqualTo(403);
                });
    }

    @Test
    @DisplayName("Logout endpoint should be accessible without authentication")
    void logoutEndpointShouldBePublic() {
        assertThat(mvc.post().uri("/api/auth/logout"))
                .satisfies(result -> {
                    int status = result.getResponse().getStatus();
                    assertThat(status).isNotEqualTo(401);
                    assertThat(status).isNotEqualTo(403);
                });
    }

    @Test
    @DisplayName("Protected endpoints should not succeed without authentication")
    void protectedEndpointsShouldRequireAuth() {
        assertThat(mvc.get().uri("/api/auth/me"))
                .satisfies(result -> {
                    int status = result.getResponse().getStatus();
                    assertThat(status).isGreaterThanOrEqualTo(400);
                });
    }

    @Test
    @DisplayName("Swagger UI should be publicly accessible")
    void swaggerUiShouldBePublic() {
        assertThat(mvc.get().uri("/swagger-ui/index.html"))
                .satisfies(result -> {
                    int status = result.getResponse().getStatus();
                    assertThat(status).isNotEqualTo(401);
                    assertThat(status).isNotEqualTo(403);
                });
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
}
