package com.rideout.forums.forum;

import com.rideout.forums.repository.forum.ForumMemberRepository;
import com.rideout.forums.repository.forum.ForumRepository;
import com.rideout.forums.service.forum.ForumMembershipService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;

@ExtendWith(MockitoExtension.class)
class ForumMembershipServiceTests {

    @Mock
    private ForumRepository forumRepository;

    @Mock
    private ForumMemberRepository forumMemberRepository;

    @InjectMocks
    private ForumMembershipService forumMembershipService;

    private static final UUID USER_ID = UUID.randomUUID();
    private static final UUID FORUM_ID = UUID.randomUUID();

    private Forum buildForum() {
        return Forum.builder()
                .id(FORUM_ID)
                .slug("test-forum")
                .name("Test Forum")
                .description("A test forum")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    @Nested
    @DisplayName("joinForum")
    class JoinForum {

        @Test
        @DisplayName("Should join forum successfully")
        void shouldJoinForum() {
            Forum forum = buildForum();
            given(forumRepository.findBySlug("test-forum")).willReturn(Optional.of(forum));
            given(forumMemberRepository.existsByUserIdAndForumId(USER_ID, FORUM_ID)).willReturn(false);
            given(forumMemberRepository.countByForumId(FORUM_ID)).willReturn(1L);

            ForumResponse result = forumMembershipService.joinForum("test-forum", USER_ID);

            assertThat(result.joined()).isTrue();
            assertThat(result.memberCount()).isEqualTo(1L);
            assertThat(result.slug()).isEqualTo("test-forum");
            then(forumMemberRepository).should().save(any(ForumMember.class));
        }

        @Test
        @DisplayName("Should return 409 when already a member")
        void shouldRejectWhenAlreadyMember() {
            Forum forum = buildForum();
            given(forumRepository.findBySlug("test-forum")).willReturn(Optional.of(forum));
            given(forumMemberRepository.existsByUserIdAndForumId(USER_ID, FORUM_ID)).willReturn(true);

            assertThatThrownBy(() -> forumMembershipService.joinForum("test-forum", USER_ID))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("Already a member");
        }

        @Test
        @DisplayName("Should return 404 when forum not found")
        void shouldRejectWhenForumNotFound() {
            given(forumRepository.findBySlug("nonexistent")).willReturn(Optional.empty());

            assertThatThrownBy(() -> forumMembershipService.joinForum("nonexistent", USER_ID))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("Forum not found");
        }
    }

    @Nested
    @DisplayName("leaveForum")
    class LeaveForum {

        @Test
        @DisplayName("Should leave forum successfully")
        void shouldLeaveForum() {
            Forum forum = buildForum();
            given(forumRepository.findBySlug("test-forum")).willReturn(Optional.of(forum));
            given(forumMemberRepository.existsByUserIdAndForumId(USER_ID, FORUM_ID)).willReturn(true);
            given(forumMemberRepository.countByForumId(FORUM_ID)).willReturn(0L);

            ForumResponse result = forumMembershipService.leaveForum("test-forum", USER_ID);

            assertThat(result.joined()).isFalse();
            assertThat(result.memberCount()).isEqualTo(0L);
            then(forumMemberRepository).should().deleteByUserIdAndForumId(USER_ID, FORUM_ID);
        }

        @Test
        @DisplayName("Should return 404 when not a member")
        void shouldRejectWhenNotMember() {
            Forum forum = buildForum();
            given(forumRepository.findBySlug("test-forum")).willReturn(Optional.of(forum));
            given(forumMemberRepository.existsByUserIdAndForumId(USER_ID, FORUM_ID)).willReturn(false);

            assertThatThrownBy(() -> forumMembershipService.leaveForum("test-forum", USER_ID))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("Not a member");
        }

        @Test
        @DisplayName("Should return 404 when forum not found")
        void shouldRejectWhenForumNotFound() {
            given(forumRepository.findBySlug("nonexistent")).willReturn(Optional.empty());

            assertThatThrownBy(() -> forumMembershipService.leaveForum("nonexistent", USER_ID))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("Forum not found");
        }
    }

    @Nested
    @DisplayName("listJoinedForums")
    class ListJoinedForums {

        @Test
        @DisplayName("Should return joined forums")
        void shouldReturnJoinedForums() {
            Forum forum = buildForum();
            var pageable = PageRequest.of(0, 50);
            given(forumMemberRepository.findForumsByUserId(USER_ID, pageable))
                    .willReturn(new PageImpl<>(List.of(forum)));
            given(forumMemberRepository.countByForumId(FORUM_ID)).willReturn(3L);

            var result = forumMembershipService.listJoinedForums(USER_ID, pageable);

            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getContent().getFirst().joined()).isTrue();
            assertThat(result.getContent().getFirst().memberCount()).isEqualTo(3L);
        }

        @Test
        @DisplayName("Should return empty page when no forums joined")
        void shouldReturnEmptyPage() {
            var pageable = PageRequest.of(0, 50);
            given(forumMemberRepository.findForumsByUserId(USER_ID, pageable))
                    .willReturn(new PageImpl<>(List.of()));

            var result = forumMembershipService.listJoinedForums(USER_ID, pageable);

            assertThat(result.getContent()).isEmpty();
        }
    }
}
