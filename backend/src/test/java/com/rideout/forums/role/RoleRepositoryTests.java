package com.rideout.forums.role;

import com.rideout.forums.repository.role.RoleRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class RoleRepositoryTests {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private TestEntityManager entityManager;

    @Test
    @DisplayName("Should find role by name")
    void shouldFindByName() {
        var role = Role.builder()
                .name("ROLE_USER")
                .description("Standard user role")
                .build();
        entityManager.persistAndFlush(role);

        var found = roleRepository.findByName("ROLE_USER");

        assertThat(found).isPresent();
        assertThat(found.get().getName()).isEqualTo("ROLE_USER");
        assertThat(found.get().getDescription()).isEqualTo("Standard user role");
    }

    @Test
    @DisplayName("Should return empty when role name not found")
    void shouldReturnEmptyWhenNameNotFound() {
        var found = roleRepository.findByName("ROLE_NONEXISTENT");

        assertThat(found).isEmpty();
    }

    @Test
    @DisplayName("Should auto-generate UUID and createdAt via @PrePersist")
    void shouldAutoGenerateIdAndTimestamp() {
        var role = Role.builder()
                .name("ROLE_ADMIN")
                .description("Admin role")
                .build();
        entityManager.persistAndFlush(role);

        assertThat(role.getId()).isNotNull();
        assertThat(role.getCreatedAt()).isNotNull();
    }

    @Test
    @DisplayName("Should persist multiple roles and find each by name")
    void shouldFindMultipleRoles() {
        entityManager.persist(Role.builder().name("ROLE_USER").description("User").build());
        entityManager.persist(Role.builder().name("ROLE_ADMIN").description("Admin").build());
        entityManager.persist(Role.builder().name("ROLE_MODERATOR").description("Mod").build());
        entityManager.flush();

        assertThat(roleRepository.findByName("ROLE_USER")).isPresent();
        assertThat(roleRepository.findByName("ROLE_ADMIN")).isPresent();
        assertThat(roleRepository.findByName("ROLE_MODERATOR")).isPresent();
    }

    @Test
    @DisplayName("Should allow role without description")
    void shouldAllowNullDescription() {
        var role = Role.builder()
                .name("ROLE_BASIC")
                .build();
        entityManager.persistAndFlush(role);

        var found = roleRepository.findByName("ROLE_BASIC");

        assertThat(found).isPresent();
        assertThat(found.get().getDescription()).isNull();
    }
}
