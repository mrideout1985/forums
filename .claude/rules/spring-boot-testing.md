---
paths:
  - "backend/src/test/**/*.java"
---

# Spring Boot Testing

## Test Pyramid
Unit (fast) → Slice (focused) → Integration (complete). Use the narrowest slice that gives confidence.

## Which Slice to Use

| Scenario | Use |
|----------|-----|
| Controller + HTTP semantics | `@WebMvcTest` |
| Repository + JPA queries | `@DataJpaTest` + Testcontainers |
| Business logic in service | Plain JUnit + Mockito (no Spring context) |
| External API client | `@RestClientTest` |
| JSON mapping | `@JsonTest` |
| Full integration | `@SpringBootTest` |

Never use `@SpringBootTest` for everything — it slows down the suite unnecessarily.

## @WebMvcTest
- Mock all service dependencies with `@MockitoBean` (not `@MockBean` — that's deprecated in Spring Boot 4)
- Use `MockMvcTester` (AssertJ-style, Spring Boot 3.2+) over classic `MockMvc`
- **Prefer `convertTo()` over `extractingPath()`** — type-safe, IDE-refactorable
- Test HTTP semantics (status, headers, content-type), not business logic

```java
assertThat(mvc.get().uri("/forums/1"))
  .hasStatus(HttpStatus.OK)
  .bodyJson()
  .convertTo(ForumResponse.class)
  .satisfies(response -> {
    assertThat(response.getId()).isEqualTo(1L);
  });
```

## @DataJpaTest
- Always use Testcontainers with real PostgreSQL — never H2
- `@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)`
- Use `TestEntityManager` for setup data; always `flush()` after `persist()`
- `clear()` the entity manager before testing lazy loading

```java
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers
class ForumRepositoryTest {
  @Container
  @ServiceConnection
  static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:17");
}
```

## Mocking
- `@MockitoBean` replaces `@MockBean` in Spring Boot 4+
- `@MockitoSpyBean` replaces `@SpyBean`
- For pure unit tests (no Spring context), use `@Mock` or `Mockito.mock()`
- Always verify interactions that have side effects; don't verify simple queries

## Test Data Generation (Instancio)
Use Instancio for objects with 3+ properties — avoid verbose builders/setters:

```java
// Simple
final var forum = Instancio.create(Forum.class);

// Targeted
final var forum = Instancio.of(Forum.class)
  .set(field(Forum::getTitle), "My Forum")
  .ignore(field(Forum::getId)) // let DB generate
  .create();
```

## AssertJ Style
- Use fluent AssertJ assertions — no JUnit 4 matchers
- `assertThat(list).extracting(Item::getName).containsExactly("a", "b")`
- `assertThat(list).filteredOn(...).hasSize(N)`
- `SoftAssertions.assertSoftly(softly -> { ... })` to collect multiple failures
- Static imports: `import static org.assertj.core.api.Assertions.*`

## Test Organization
Always structure in this order: main scenario → other paths → errors/exceptions.
Use `@DisplayName` for clarity: `"Should reject order when stock is insufficient"`.
Aim for 80% coverage; focus on business-critical paths, not just line coverage.

## Context Caching
- Group tests by configuration to maximize context reuse
- Use `@ActiveProfiles` over `@TestPropertySource` property variations
- Avoid `@DirtiesContext` unless absolutely necessary
