package com.rideout.forums.service;

import com.rideout.forums.domain.Role;
import com.rideout.forums.domain.User;
import com.rideout.forums.dto.AuthRequest;
import com.rideout.forums.dto.AuthResponse;
import com.rideout.forums.dto.LoginRequest;
import com.rideout.forums.repository.RoleRepository;
import com.rideout.forums.repository.UserRepository;
import com.rideout.forums.security.JwtProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.authentication.BadCredentialsException;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@SpringBootTest
class AuthServiceTests {

    @Autowired
    private AuthService authService;

    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private RoleRepository roleRepository;

    @MockitoBean
    private PasswordEncoder passwordEncoder;

    @MockitoBean
    private AuthenticationManager authenticationManager;

    @MockitoBean
    private JwtProvider jwtProvider;

    private AuthRequest authRequest;
    private LoginRequest loginRequest;
    private User testUser;
    private Role userRole;

    @BeforeEach
    void setUp() {
        authRequest = new AuthRequest();
        authRequest.setUsername("newuser");
        authRequest.setEmail("newuser@example.com");
        authRequest.setPassword("password123");

        loginRequest = new LoginRequest();
        loginRequest.setUsername("testuser");
        loginRequest.setPassword("password123");

        userRole = new Role();
        userRole.setId(UUID.randomUUID());
        userRole.setName("ROLE_USER");

        testUser = new User();
        testUser.setId(UUID.randomUUID());
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setPasswordHash("$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/TVG2");
        testUser.setIsActive(true);
        testUser.setRoles(new HashSet<>(Collections.singletonList(userRole)));
    }

    @Test
    void testRegisterNewUser() {
        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("newuser@example.com")).thenReturn(false);
        when(roleRepository.findByName("ROLE_USER")).thenReturn(Optional.of(userRole));
        when(passwordEncoder.encode("password123")).thenReturn("encoded_password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User newUser = new User();
        newUser.setId(UUID.randomUUID());
        newUser.setUsername("newuser");
        newUser.setEmail("newuser@example.com");
        newUser.setPasswordHash("encoded_password");
        newUser.setIsActive(true);
        newUser.setRoles(new HashSet<>(Collections.singletonList(userRole)));

        var authToken = new UsernamePasswordAuthenticationToken(
                "newuser",
                "password123",
                Collections.singleton(new SimpleGrantedAuthority("ROLE_USER"))
        );
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authToken);
        when(jwtProvider.generateToken(any(Authentication.class)))
                .thenReturn("test.jwt.token");
        when(userRepository.findByUsername("newuser")).thenReturn(Optional.of(newUser));

        AuthResponse result = authService.register(authRequest);

        assertNotNull(result);
        assertNotNull(result.getToken());
        assertEquals("newuser", result.getUsername());
    }

    @Test
    void testRegisterWithExistingUsername() {
        when(userRepository.existsByUsername("newuser")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> {
            authService.register(authRequest);
        });
    }

    @Test
    void testLoginSuccess() {
        var authToken = new UsernamePasswordAuthenticationToken(
                "testuser",
                "password123",
                Collections.singleton(new SimpleGrantedAuthority("ROLE_USER"))
        );

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authToken);
        when(jwtProvider.generateToken(any(Authentication.class)))
                .thenReturn("test.jwt.token");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));

        AuthResponse response = authService.login(loginRequest);

        assertNotNull(response);
        assertEquals("test.jwt.token", response.getToken());
        assertEquals("testuser", response.getUsername());
    }

    @Test
    void testLoginWithInvalidCredentials() {
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Invalid credentials"));

        assertThrows(BadCredentialsException.class, () -> {
            authService.login(loginRequest);
        });
    }

    @Test
    void testLoginWithNullUsername() {
        LoginRequest invalidRequest = new LoginRequest();
        invalidRequest.setUsername(null);
        invalidRequest.setPassword("password123");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Invalid credentials"));

        assertThrows(BadCredentialsException.class, () -> {
            authService.login(invalidRequest);
        });
    }

    @Test
    void testRegisterWithNullUsername() {
        AuthRequest invalidRequest = new AuthRequest();
        invalidRequest.setUsername(null);
        invalidRequest.setPassword("password123");

        assertThrows(Exception.class, () -> {
            authService.register(invalidRequest);
        });
    }

    @Test
    void testRegisterWithNullPassword() {
        AuthRequest invalidRequest = new AuthRequest();
        invalidRequest.setUsername("newuser");
        invalidRequest.setPassword(null);

        assertThrows(Exception.class, () -> {
            authService.register(invalidRequest);
        });
    }
}

