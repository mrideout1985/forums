package com.rideout.forums.controller.auth;

import com.rideout.forums.config.JwtProperties;
import com.rideout.forums.model.AuthRequest;
import com.rideout.forums.model.AuthResponse;
import com.rideout.forums.model.LoginRequest;
import com.rideout.forums.repository.user.UserRepository;
import com.rideout.forums.service.auth.AuthService;
import com.rideout.forums.user.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "User authentication endpoints")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;
    private final JwtProperties jwtProperties;
    private final UserRepository userRepository;

    @PostMapping("/register")
    @Operation(
        summary = "Register a new user",
        description = "Create a new user account. JWT is set as an httpOnly cookie."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "201",
            description = "User registered successfully",
            content = @Content(schema = @Schema(implementation = AuthResponse.class))
        ),
        @ApiResponse(responseCode = "400", description = "Invalid input or user already exists")
    })
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody AuthRequest request) {
        log.info("Registering new user: {}", request.getUsername());
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .header(HttpHeaders.SET_COOKIE, buildJwtCookie(response.getToken()).toString())
                .body(response);
    }

    @PostMapping("/login")
    @Operation(
        summary = "Login user",
        description = "Authenticate user. JWT is set as an httpOnly cookie."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Login successful",
            content = @Content(schema = @Schema(implementation = AuthResponse.class))
        ),
        @ApiResponse(responseCode = "401", description = "Invalid credentials")
    })
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        log.info("User login attempt: {}", request.getUsername());
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, buildJwtCookie(response.getToken()).toString())
                .body(response);
    }

    @PostMapping("/logout")
    @Operation(
        summary = "Logout user",
        description = "Clear the JWT cookie to end the session"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Logged out successfully")
    })
    public ResponseEntity<Void> logout() {
        ResponseCookie clearCookie = ResponseCookie.from(jwtProperties.cookieName(), "")
                .httpOnly(true)
                .secure(true)
                .path("/api")
                .maxAge(0)
                .sameSite("Strict")
                .build();
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, clearCookie.toString())
                .build();
    }

    @GetMapping("/me")
    @Operation(
        summary = "Get current user",
        description = "Returns the currently authenticated user's information"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Current user info",
            content = @Content(schema = @Schema(implementation = AuthResponse.class))
        ),
        @ApiResponse(responseCode = "401", description = "Not authenticated")
    })
    public ResponseEntity<AuthResponse> me(@AuthenticationPrincipal User principal) {
        User user = userRepository.findByUsername(principal.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Set<String> roles = user.getRoles().stream()
                .map(role -> role.getName())
                .collect(Collectors.toSet());

        AuthResponse response = new AuthResponse();
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setRoles(roles);
        return ResponseEntity.ok(response);
    }

    private ResponseCookie buildJwtCookie(String token) {
        return ResponseCookie.from(jwtProperties.cookieName(), token)
                .httpOnly(true)
                .secure(true)
                .path("/api")
                .maxAge(Duration.ofMillis(jwtProperties.expiration()))
                .sameSite("Strict")
                .build();
    }
}
