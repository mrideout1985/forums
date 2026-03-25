package com.rideout.forums.auth;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.ArrayList;
import java.util.Collection;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class JwtProviderTests {

    @Autowired
    private JwtProvider jwtProvider;

    private Authentication authentication;

    @BeforeEach
    void setUp() {
        Collection<GrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
        authentication = new UsernamePasswordAuthenticationToken("testuser", "password", authorities);
    }

    @Test
    void testGenerateToken() {
        String token = jwtProvider.generateToken(authentication);

        assertNotNull(token);
        assertFalse(token.isEmpty());
        assertTrue(token.contains("."));
    }

    @Test
    void testGetUsernameFromToken() {
        String token = jwtProvider.generateToken(authentication);
        String username = jwtProvider.getUsernameFromToken(token);

        assertEquals("testuser", username);
    }

    @Test
    void testValidateValidToken() {
        String token = jwtProvider.generateToken(authentication);
        boolean isValid = jwtProvider.validateToken(token);

        assertTrue(isValid);
    }

    @Test
    void testValidateInvalidToken() {
        String invalidToken = "invalid.token.here";
        boolean isValid = jwtProvider.validateToken(invalidToken);

        assertFalse(isValid);
    }

    @Test
    void testValidateEmptyToken() {
        String emptyToken = "";
        boolean isValid = jwtProvider.validateToken(emptyToken);

        assertFalse(isValid);
    }

    @Test
    void testValidateMalformedToken() {
        String malformedToken = "eyJhbGciOiJIUzI1NiJ9.invalid.signature";
        boolean isValid = jwtProvider.validateToken(malformedToken);

        assertFalse(isValid);
    }

    @Test
    void testGenerateTokenContainsUsername() {
        String token = jwtProvider.generateToken(authentication);
        String username = jwtProvider.getUsernameFromToken(token);

        assertEquals("testuser", username);
    }

    @Test
    void testMultipleTokensAreDifferent() throws InterruptedException {
        String token1 = jwtProvider.generateToken(authentication);
        Thread.sleep(1000);
        String token2 = jwtProvider.generateToken(authentication);

        assertNotEquals(token1, token2);
    }
}
