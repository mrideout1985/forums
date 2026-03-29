package com.rideout.forums.auth;

import com.rideout.forums.model.AuthRequest;
import com.rideout.forums.model.AuthResponse;
import com.rideout.forums.model.LoginRequest;
import com.rideout.forums.role.Role;
import com.rideout.forums.repository.role.RoleRepository;
import com.rideout.forums.repository.user.UserRepository;
import com.rideout.forums.service.auth.AuthService;
import com.rideout.forums.user.User;
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
        authRequest.setPassword("Password123!");
        authRequest.setConfirmPassword("Password123!");

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
        when(passwordEncoder.encode("Password123!")).thenReturn("encoded_password");
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
        "Password123!",
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

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            authService.register(authRequest);
        });

        assertEquals("Username already exists", exception.getMessage());
    }

    @Test
    void testRegisterWithExistingEmail() {
        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("newuser@example.com")).thenReturn(true);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            authService.register(authRequest);
        });

        assertEquals("Email already exists", exception.getMessage());
    }

    @Test
    void testRegisterWithInvalidEmailFormat() {
        authRequest.setEmail("invalid-email");
        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("invalid-email")).thenReturn(false);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            authService.register(authRequest);
        });

        assertEquals("Invalid email format", exception.getMessage());
    }

    @Test
    void testRegisterWithUsernameTooShort() {
        authRequest.setUsername("ab");
        when(userRepository.existsByUsername("ab")).thenReturn(false);
        when(userRepository.existsByEmail("newuser@example.com")).thenReturn(false);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            authService.register(authRequest);
        });

        assertEquals("Username must be between 3 and 20 characters", exception.getMessage());
    }

    @Test
    void testRegisterWithUsernameTooLong() {
        authRequest.setUsername("thisusernameiswaytoolong");
        when(userRepository.existsByUsername("thisusernameiswaytoolong")).thenReturn(false);
        when(userRepository.existsByEmail("newuser@example.com")).thenReturn(false);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            authService.register(authRequest);
        });

        assertEquals("Username must be between 3 and 20 characters", exception.getMessage());
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

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            authService.login(invalidRequest);
        });

        assertEquals("Username is required", exception.getMessage());
    }

    @Test
    void testLoginWithBlankPassword() {
        LoginRequest invalidRequest = new LoginRequest();
        invalidRequest.setUsername("testuser");
        invalidRequest.setPassword("   ");

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            authService.login(invalidRequest);
        });

        assertEquals("Password is required", exception.getMessage());
    }

    @Test
    void testRegisterWithNullUsername() {
        AuthRequest invalidRequest = new AuthRequest();
        invalidRequest.setUsername(null);
        invalidRequest.setEmail("newuser@example.com");
        invalidRequest.setPassword("Password123!");
        invalidRequest.setConfirmPassword("Password123!");

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            authService.register(invalidRequest);
        });

        assertEquals("Username is required", exception.getMessage());
    }

    @Test
    void testRegisterWithBlankUsername() {
        AuthRequest invalidRequest = new AuthRequest();
        invalidRequest.setUsername("   ");
        invalidRequest.setEmail("newuser@example.com");
        invalidRequest.setPassword("Password123!");
        invalidRequest.setConfirmPassword("Password123!");

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            authService.register(invalidRequest);
        });

        assertEquals("Username is required", exception.getMessage());
    }

    @Test
    void testRegisterWithNullEmail() {
        AuthRequest invalidRequest = new AuthRequest();
        invalidRequest.setUsername("newuser");
        invalidRequest.setEmail(null);
        invalidRequest.setPassword("Password123!");
        invalidRequest.setConfirmPassword("Password123!");

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            authService.register(invalidRequest);
        });

        assertEquals("Email is required", exception.getMessage());
    }

    @Test
    void testRegisterWithBlankEmail() {
        AuthRequest invalidRequest = new AuthRequest();
        invalidRequest.setUsername("newuser");
        invalidRequest.setEmail("   ");
        invalidRequest.setPassword("Password123!");
        invalidRequest.setConfirmPassword("Password123!");

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            authService.register(invalidRequest);
        });

        assertEquals("Email is required", exception.getMessage());
    }

    @Test
    void testRegisterWithNullPassword() {
        AuthRequest invalidRequest = new AuthRequest();
        invalidRequest.setUsername("newuser");
        invalidRequest.setEmail("newuser@example.com");
        invalidRequest.setPassword(null);
        invalidRequest.setConfirmPassword("Password123!");

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            authService.register(invalidRequest);
        });

        assertEquals("Password is required", exception.getMessage());
    }

    @Test
    void testRegisterWithBlankPassword() {
        AuthRequest invalidRequest = new AuthRequest();
        invalidRequest.setUsername("newuser");
        invalidRequest.setEmail("newuser@example.com");
        invalidRequest.setPassword("   ");
        invalidRequest.setConfirmPassword("Password123!");

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            authService.register(invalidRequest);
        });

        assertEquals("Password is required", exception.getMessage());
    }

    @Test
    void testRegisterWithNullConfirmPassword() {
        AuthRequest invalidRequest = new AuthRequest();
        invalidRequest.setUsername("newuser");
        invalidRequest.setEmail("newuser@example.com");
        invalidRequest.setPassword("Password123!");
        invalidRequest.setConfirmPassword(null);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            authService.register(invalidRequest);
        });

        assertEquals("Confirm password is required", exception.getMessage());
    }

    @Test
    void testRegisterWithBlankConfirmPassword() {
        AuthRequest invalidRequest = new AuthRequest();
        invalidRequest.setUsername("newuser");
        invalidRequest.setEmail("newuser@example.com");
        invalidRequest.setPassword("Password123!");
        invalidRequest.setConfirmPassword("   ");

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            authService.register(invalidRequest);
        });

        assertEquals("Confirm password is required", exception.getMessage());
    }

    @Test
    void testRegisterWithShortPassword() {
        AuthRequest invalidRequest = new AuthRequest();
        invalidRequest.setUsername("newuser");
        invalidRequest.setEmail("newuser@example.com");
        invalidRequest.setPassword("123");
        invalidRequest.setConfirmPassword("123");

        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("newuser@example.com")).thenReturn(false);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            authService.register(invalidRequest);
        });

        assertEquals("Password must be at least 6 characters", exception.getMessage());
    }

    @Test
    void testRegisterWithPasswordMismatch() {
        AuthRequest invalidRequest = new AuthRequest();
        invalidRequest.setUsername("newuser");
        invalidRequest.setEmail("newuser@example.com");
        invalidRequest.setPassword("Password123!");
        invalidRequest.setConfirmPassword("differentPassword");

        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("newuser@example.com")).thenReturn(false);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            authService.register(invalidRequest);
        });

        assertEquals("Passwords do not match", exception.getMessage());
    }

    @Test
    void testRegisterWithPasswordMissingUppercase() {
        authRequest.setPassword("password123!");
        authRequest.setConfirmPassword("password123!");
        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("newuser@example.com")).thenReturn(false);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            authService.register(authRequest);
        });

        assertEquals("Password must contain at least one uppercase letter", exception.getMessage());
    }

    @Test
    void testRegisterWithPasswordMissingLowercase() {
        authRequest.setPassword("PASSWORD123!");
        authRequest.setConfirmPassword("PASSWORD123!");
        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("newuser@example.com")).thenReturn(false);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            authService.register(authRequest);
        });

        assertEquals("Password must contain at least one lowercase letter", exception.getMessage());
    }

    @Test
    void testRegisterWithPasswordMissingDigit() {
        authRequest.setPassword("Password!!");
        authRequest.setConfirmPassword("Password!!");
        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("newuser@example.com")).thenReturn(false);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            authService.register(authRequest);
        });

        assertEquals("Password must contain at least one digit", exception.getMessage());
    }

    @Test
    void testRegisterWithPasswordMissingSpecialCharacter() {
        authRequest.setPassword("Password123");
        authRequest.setConfirmPassword("Password123");
        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("newuser@example.com")).thenReturn(false);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            authService.register(authRequest);
        });

        assertEquals("Password must contain at least one special character", exception.getMessage());
    }
}
