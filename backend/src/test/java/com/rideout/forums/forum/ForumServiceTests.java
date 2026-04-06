package com.rideout.forums.forum;

import com.rideout.forums.repository.forum.ForumMemberRepository;
import com.rideout.forums.repository.forum.ForumRepository;
import com.rideout.forums.service.forum.ForumService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;

@ExtendWith(MockitoExtension.class)
class ForumServiceTests {

    @Mock
    private ForumRepository forumRepository;

    @Mock
    private ForumMemberRepository forumMemberRepository;

    @InjectMocks
    private ForumService forumService;

    private static final Pageable PAGE = PageRequest.of(0, 20);

    private Forum buildForum(String slug, String name) {
        return Forum.builder()
                .id(UUID.randomUUID())
                .slug(slug)
                .name(name)
                .description("Description for " + name)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("Should use findAll when query is null")
    void shouldUseFindAllWhenQueryIsNull() {
        var forum = buildForum("tech", "Tech");
        given(forumRepository.findAll(PAGE))
                .willReturn(new PageImpl<>(List.of(forum), PAGE, 1));
        given(forumMemberRepository.countByForumId(any())).willReturn(0L);

        var result = forumService.listForums(PAGE, null, null);

        assertThat(result.getContent()).hasSize(1);
        then(forumRepository).should().findAll(PAGE);
        then(forumRepository).shouldHaveNoMoreInteractions();
    }

    @Test
    @DisplayName("Should use findAll when query is blank")
    void shouldUseFindAllWhenQueryIsBlank() {
        given(forumRepository.findAll(PAGE))
                .willReturn(new PageImpl<>(Collections.emptyList(), PAGE, 0));

        forumService.listForums(PAGE, null, "   ");

        then(forumRepository).should().findAll(PAGE);
        then(forumRepository).shouldHaveNoMoreInteractions();
    }

    @Test
    @DisplayName("Should use search when query is provided")
    void shouldUseSearchWhenQueryIsProvided() {
        var forum = buildForum("tech", "Tech");
        given(forumRepository.findByNameContainingIgnoreCase(eq("tech"), eq(PAGE)))
                .willReturn(new PageImpl<>(List.of(forum), PAGE, 1));
        given(forumMemberRepository.countByForumId(any())).willReturn(5L);

        var result = forumService.listForums(PAGE, null, "tech");

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().getFirst().memberCount()).isEqualTo(5L);
        then(forumRepository).should().findByNameContainingIgnoreCase("tech", PAGE);
        then(forumRepository).shouldHaveNoMoreInteractions();
    }

    @Test
    @DisplayName("Should strip whitespace from query")
    void shouldStripWhitespaceFromQuery() {
        given(forumRepository.findByNameContainingIgnoreCase(eq("tech"), eq(PAGE)))
                .willReturn(new PageImpl<>(Collections.emptyList(), PAGE, 0));

        forumService.listForums(PAGE, null, "  tech  ");

        then(forumRepository).should().findByNameContainingIgnoreCase("tech", PAGE);
    }

    @Test
    @DisplayName("Should include joined status for authenticated user")
    void shouldIncludeJoinedStatusForAuthenticatedUser() {
        var userId = UUID.randomUUID();
        var forum = buildForum("tech", "Tech");
        var forumId = forum.getId();

        given(forumMemberRepository.findForumIdsByUserId(userId))
                .willReturn(java.util.Set.of(forumId));
        given(forumRepository.findByNameContainingIgnoreCase(eq("tech"), eq(PAGE)))
                .willReturn(new PageImpl<>(List.of(forum), PAGE, 1));
        given(forumMemberRepository.countByForumId(forumId)).willReturn(3L);

        var result = forumService.listForums(PAGE, userId, "tech");

        assertThat(result.getContent().getFirst().joined()).isTrue();
        assertThat(result.getContent().getFirst().memberCount()).isEqualTo(3L);
    }
}
