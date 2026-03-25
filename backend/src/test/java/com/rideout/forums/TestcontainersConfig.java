package com.rideout.forums;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Bean;
import org.testcontainers.containers.PostgreSQLContainer;

/**
 * Shared Testcontainers configuration for integration tests that need a real PostgreSQL database.
 *
 * <p>Usage: annotate your test class with {@code @Import(TestcontainersConfig.class)}
 * and {@code @AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)}.
 *
 * <p>The container is created once per application context and reused across tests
 * that share the same context (Spring context caching).
 */
@TestConfiguration(proxyBeanMethods = false)
public class TestcontainersConfig {

    @Bean
    @ServiceConnection
    PostgreSQLContainer<?> postgresContainer() {
        return new PostgreSQLContainer<>("postgres:17");
    }
}
