package com.rideout.forums.auth;

import com.rideout.forums.model.AuthRequest;
import com.rideout.forums.model.AuthResponse;
import com.rideout.forums.model.LoginRequest;
import com.rideout.forums.role.Role;
import com.rideout.forums.role.RoleRepository;
import com.rideout.forums.user.User;
import com.rideout.forums.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;

    @Transactional
    public AuthResponse register(AuthRequest request) {
        validateRegisterRequest(request);

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        if (!request.getEmail().matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            throw new IllegalArgumentException("Invalid email format");
        }

        if (request.getUsername().length() < 3 || request.getUsername().length() > 20) {
            throw new IllegalArgumentException("Username must be between 3 and 20 characters");
        }

        if (request.getPassword().length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters");
        }

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        if (!request.getPassword().matches(".*[A-Z].*")) {
            throw new IllegalArgumentException("Password must contain at least one uppercase letter");
        }

        if (!request.getPassword().matches(".*[a-z].*")) {
            throw new IllegalArgumentException("Password must contain at least one lowercase letter");
        }

        if (!request.getPassword().matches(".*\\d.*")) {
            throw new IllegalArgumentException("Password must contain at least one digit");
        }

        if (!request.getPassword().matches(".*[!@#$%^&*()].*")) {
            throw new IllegalArgumentException("Password must contain at least one special character");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .isActive(true)
                .build();

        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseThrow(() -> new IllegalArgumentException("Default role not found"));
        user.setRoles(new HashSet<>(Set.of(userRole)));

        user = userRepository.save(user);

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        return buildAuthResponse(authentication);
    }

    public AuthResponse login(LoginRequest request) {
        validateLoginRequest(request);

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        return buildAuthResponse(authentication);
    }

    private AuthResponse buildAuthResponse(Authentication authentication) {
        String token = jwtProvider.generateToken(authentication);
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Set<String> roles = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toSet());

        AuthResponse response = new AuthResponse();
        response.setToken(token);
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setRoles(roles);
        return response;
    }

    private void validateRegisterRequest(AuthRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Request is required");
        }
        if (!StringUtils.hasText(request.getUsername())) {
            throw new IllegalArgumentException("Username is required");
        }
        if (!StringUtils.hasText(request.getEmail())) {
            throw new IllegalArgumentException("Email is required");
        }
        if (!StringUtils.hasText(request.getPassword())) {
            throw new IllegalArgumentException("Password is required");
        }
        if (!StringUtils.hasText(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Confirm password is required");
        }
    }

    private void validateLoginRequest(LoginRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Request is required");
        }
        if (!StringUtils.hasText(request.getUsername())) {
            throw new IllegalArgumentException("Username is required");
        }
        if (!StringUtils.hasText(request.getPassword())) {
            throw new IllegalArgumentException("Password is required");
        }
    }
}
