package com.rideout.forums.auth;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.assertj.MockMvcTester;
import org.springframework.core.MethodParameter;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@WebMvcTest(AuthExceptionHandler.class)
class AuthExceptionHandlerTests {

    @Autowired
    private MockMvcTester mvc;

    // Required beans for security context to load
    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private JwtProvider jwtProvider;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @MockitoBean
    private com.rideout.forums.user.UserRepository userRepository;

    @MockitoBean
    private com.rideout.forums.config.JwtProperties jwtProperties;

    private final AuthExceptionHandler handler = new AuthExceptionHandler();

    @Test
    @DisplayName("Should return 401 for BadCredentialsException")
    void shouldReturn401ForBadCredentials() {
        var ex = new BadCredentialsException("Invalid username or password");
        var result = handler.handleBadCredentials(ex);

        assertThat(result.getStatusCode().value()).isEqualTo(401);
        assertThat(result.getBody()).containsEntry("error", "Invalid username or password");
    }

    @Test
    @DisplayName("Should return 400 for IllegalArgumentException")
    void shouldReturn400ForIllegalArgument() {
        var ex = new IllegalArgumentException("Username already exists");
        var result = handler.handleIllegalArgument(ex);

        assertThat(result.getStatusCode().value()).isEqualTo(400);
        assertThat(result.getBody()).containsEntry("error", "Username already exists");
    }

    @Test
    @DisplayName("Should return 400 with field errors for validation exception")
    void shouldReturn400WithFieldErrors() {
        var bindingResult = new BeanPropertyBindingResult(new Object(), "request");
        bindingResult.addError(new FieldError("request", "username", "must not be null"));
        bindingResult.addError(new FieldError("request", "password", "size must be at least 8"));
        var methodParam = new MethodParameter(this.getClass().getDeclaredMethods()[0], -1);
        var ex = new MethodArgumentNotValidException(methodParam, bindingResult);

        var result = handler.handleValidation(ex);

        assertThat(result.getStatusCode().value()).isEqualTo(400);
        assertThat(result.getBody())
                .containsEntry("username", "must not be null")
                .containsEntry("password", "size must be at least 8");
    }
}
