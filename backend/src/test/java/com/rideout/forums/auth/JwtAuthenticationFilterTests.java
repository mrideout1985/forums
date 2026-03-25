package com.rideout.forums.auth;

import com.rideout.forums.config.JwtProperties;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JwtAuthenticationFilterTests {

    @Mock
    private JwtProvider jwtProvider;

    @Mock
    private UserDetailsService userDetailsService;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private FilterChain filterChain;

    private JwtAuthenticationFilter filter;

    private static final JwtProperties JWT_PROPERTIES =
            new JwtProperties("test-secret-key-that-is-long-enough", 3600000L, "jwt");

    private final UserDetails testUserDetails = User.withUsername("testuser")
            .password("password")
            .authorities("ROLE_USER")
            .build();

    @BeforeEach
    void setUp() {
        filter = new JwtAuthenticationFilter(jwtProvider, userDetailsService, JWT_PROPERTIES);
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("Should authenticate user when valid JWT found in cookie")
    void shouldAuthenticateFromCookie() throws Exception {
        when(request.getHeader("Authorization")).thenReturn(null);
        when(request.getCookies()).thenReturn(new Cookie[]{new Cookie("jwt", "valid.token.here")});
        when(jwtProvider.validateToken("valid.token.here")).thenReturn(true);
        when(jwtProvider.getUsernameFromToken("valid.token.here")).thenReturn("testuser");
        when(userDetailsService.loadUserByUsername("testuser")).thenReturn(testUserDetails);

        filter.doFilterInternal(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNotNull();
        assertThat(SecurityContextHolder.getContext().getAuthentication().getName()).isEqualTo("testuser");
        verify(filterChain).doFilter(request, response);
    }

    @Test
    @DisplayName("Should authenticate user when valid JWT found in Authorization header")
    void shouldAuthenticateFromBearerHeader() throws Exception {
        when(request.getHeader("Authorization")).thenReturn("Bearer valid.token.here");
        when(jwtProvider.validateToken("valid.token.here")).thenReturn(true);
        when(jwtProvider.getUsernameFromToken("valid.token.here")).thenReturn("testuser");
        when(userDetailsService.loadUserByUsername("testuser")).thenReturn(testUserDetails);

        filter.doFilterInternal(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNotNull();
        assertThat(SecurityContextHolder.getContext().getAuthentication().getName()).isEqualTo("testuser");
        verify(filterChain).doFilter(request, response);
    }

    @Test
    @DisplayName("Should pass through without authentication when no JWT present")
    void shouldPassThroughWhenNoJwt() throws Exception {
        when(request.getHeader("Authorization")).thenReturn(null);
        when(request.getCookies()).thenReturn(null);

        filter.doFilterInternal(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(filterChain).doFilter(request, response);
    }

    @Test
    @DisplayName("Should pass through without authentication when JWT is invalid")
    void shouldPassThroughWhenInvalidJwt() throws Exception {
        when(request.getHeader("Authorization")).thenReturn("Bearer invalid.token");
        when(jwtProvider.validateToken("invalid.token")).thenReturn(false);

        filter.doFilterInternal(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(filterChain).doFilter(request, response);
    }

    @Test
    @DisplayName("Should pass through when Authorization header is not Bearer type")
    void shouldPassThroughWhenNotBearerToken() throws Exception {
        when(request.getHeader("Authorization")).thenReturn("Basic dXNlcjpwYXNz");
        when(request.getCookies()).thenReturn(null);

        filter.doFilterInternal(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(filterChain).doFilter(request, response);
    }

    @Test
    @DisplayName("Should pass through when cookie exists but has wrong name")
    void shouldPassThroughWhenWrongCookieName() throws Exception {
        when(request.getHeader("Authorization")).thenReturn(null);
        when(request.getCookies()).thenReturn(new Cookie[]{new Cookie("other", "some.token")});

        filter.doFilterInternal(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(filterChain).doFilter(request, response);
    }

    @Test
    @DisplayName("Should still call filterChain even when exception occurs during authentication")
    void shouldCallFilterChainOnException() throws Exception {
        when(request.getHeader("Authorization")).thenReturn("Bearer valid.token.here");
        when(jwtProvider.validateToken("valid.token.here")).thenReturn(true);
        when(jwtProvider.getUsernameFromToken("valid.token.here")).thenThrow(new RuntimeException("DB error"));

        filter.doFilterInternal(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(filterChain).doFilter(request, response);
    }

    @Test
    @DisplayName("Should prefer Authorization header over cookie")
    void shouldPreferHeaderOverCookie() throws Exception {
        when(request.getHeader("Authorization")).thenReturn("Bearer header.token");
        when(jwtProvider.validateToken("header.token")).thenReturn(true);
        when(jwtProvider.getUsernameFromToken("header.token")).thenReturn("headeruser");
        when(userDetailsService.loadUserByUsername("headeruser")).thenReturn(
                User.withUsername("headeruser").password("p").authorities("ROLE_USER").build()
        );

        filter.doFilterInternal(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication().getName()).isEqualTo("headeruser");
        verify(request, never()).getCookies();
    }
}
