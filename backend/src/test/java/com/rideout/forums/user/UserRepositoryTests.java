package com.rideout.forums.user;

import com.rideout.forums.role.Role;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;

import java.util.HashSet;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DataJpaTest
class UserRepositoryTests {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TestEntityManager entityManager;

    private Role createRole(String name) {
        var role = Role.builder()
                .name(name)
                .description(name + " description")
                .build();
        return entityManager.persist(role);
    }

    private User createUser(String username, String email) {
        var user = User.builder()
                .username(username)
                .email(email)
                .passwordHash("$2a$10$encoded")
                .isActive(true)
                .build();
        return entityManager.persist(user);
    }

    @Test
    @DisplayName("Should find user by username")
    void shouldFindByUsername() {
        createUser("alice", "alice@example.com");
        entityManager.flush();

        var found = userRepository.findByUsername("alice");

        assertThat(found).isPresent();
        assertThat(found.get().getUsername()).isEqualTo("alice");
        assertThat(found.get().getEmail()).isEqualTo("alice@example.com");
    }

    @Test
    @DisplayName("Should return empty when username not found")
    void shouldReturnEmptyWhenUsernameNotFound() {
        var found = userRepository.findByUsername("nonexistent");

        assertThat(found).isEmpty();
    }

    @Test
    @DisplayName("Should find user by email")
    void shouldFindByEmail() {
        createUser("bob", "bob@example.com");
        entityManager.flush();

        var found = userRepository.findByEmail("bob@example.com");

        assertThat(found).isPresent();
        assertThat(found.get().getUsername()).isEqualTo("bob");
    }

    @Test
    @DisplayName("Should return empty when email not found")
    void shouldReturnEmptyWhenEmailNotFound() {
        var found = userRepository.findByEmail("notfound@example.com");

        assertThat(found).isEmpty();
    }

    @Test
    @DisplayName("Should return true when username exists")
    void shouldReturnTrueWhenUsernameExists() {
        createUser("charlie", "charlie@example.com");
        entityManager.flush();

        assertThat(userRepository.existsByUsername("charlie")).isTrue();
    }

    @Test
    @DisplayName("Should return false when username does not exist")
    void shouldReturnFalseWhenUsernameNotExists() {
        assertThat(userRepository.existsByUsername("nonexistent")).isFalse();
    }

    @Test
    @DisplayName("Should return true when email exists")
    void shouldReturnTrueWhenEmailExists() {
        createUser("diana", "diana@example.com");
        entityManager.flush();

        assertThat(userRepository.existsByEmail("diana@example.com")).isTrue();
    }

    @Test
    @DisplayName("Should return false when email does not exist")
    void shouldReturnFalseWhenEmailNotExists() {
        assertThat(userRepository.existsByEmail("nonexistent@example.com")).isFalse();
    }

    @Test
    @DisplayName("Should save user with roles")
    void shouldSaveUserWithRoles() {
        var role = createRole("ROLE_USER");
        var user = User.builder()
                .username("roleuser")
                .email("roleuser@example.com")
                .passwordHash("$2a$10$encoded")
                .isActive(true)
                .roles(new HashSet<>(Set.of(role)))
                .build();
        entityManager.persistAndFlush(user);
        entityManager.clear();

        var found = userRepository.findByUsername("roleuser");

        assertThat(found).isPresent();
        assertThat(found.get().getRoles()).hasSize(1);
        assertThat(found.get().getRoles().iterator().next().getName()).isEqualTo("ROLE_USER");
    }

    @Test
    @DisplayName("Should set isActive to true by default via @PrePersist")
    void shouldDefaultIsActiveToTrue() {
        var user = User.builder()
                .username("defaultactive")
                .email("defaultactive@example.com")
                .passwordHash("$2a$10$encoded")
                .build();
        entityManager.persistAndFlush(user);
        entityManager.clear();

        var found = userRepository.findByUsername("defaultactive");

        assertThat(found).isPresent();
        assertThat(found.get().getIsActive()).isTrue();
    }

    @Test
    @DisplayName("Should auto-generate UUID and createdAt via @PrePersist")
    void shouldAutoGenerateIdAndTimestamp() {
        var user = User.builder()
                .username("autogen")
                .email("autogen@example.com")
                .passwordHash("$2a$10$encoded")
                .isActive(true)
                .build();
        entityManager.persistAndFlush(user);

        assertThat(user.getId()).isNotNull();
        assertThat(user.getCreatedAt()).isNotNull();
    }

    @Test
    @DisplayName("User should implement UserDetails correctly")
    void shouldImplementUserDetails() {
        var role = createRole("ROLE_ADMIN");
        var user = User.builder()
                .username("details")
                .email("details@example.com")
                .passwordHash("hashed_pw")
                .isActive(true)
                .roles(new HashSet<>(Set.of(role)))
                .build();
        entityManager.persistAndFlush(user);
        entityManager.clear();

        var found = userRepository.findByUsername("details").orElseThrow();

        assertThat(found.getPassword()).isEqualTo("hashed_pw");
        assertThat(found.isEnabled()).isTrue();
        assertThat(found.isAccountNonExpired()).isTrue();
        assertThat(found.isAccountNonLocked()).isTrue();
        assertThat(found.isCredentialsNonExpired()).isTrue();
        assertThat(found.getAuthorities()).hasSize(1);
        assertThat(found.getAuthorities().iterator().next().getAuthority()).isEqualTo("ROLE_ADMIN");
    }

    @Test
    @DisplayName("Should report isEnabled false when isActive is false")
    void shouldReportDisabledWhenInactive() {
        var user = User.builder()
                .username("inactive")
                .email("inactive@example.com")
                .passwordHash("$2a$10$encoded")
                .isActive(false)
                .build();
        entityManager.persistAndFlush(user);

        assertThat(user.isEnabled()).isFalse();
    }
}
