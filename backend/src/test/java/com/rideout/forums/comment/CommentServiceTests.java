package com.rideout.forums.comment;

import com.rideout.forums.forum.Forum;
import com.rideout.forums.post.Post;
import com.rideout.forums.post.PostStatus;
import com.rideout.forums.repository.comment.CommentRepository;
import com.rideout.forums.repository.post.PostRepository;
import com.rideout.forums.repository.user.UserRepository;
import com.rideout.forums.repository.vote.VoteRepository;
import com.rideout.forums.role.Role;
import com.rideout.forums.service.comment.CommentService;
import com.rideout.forums.user.User;
import com.rideout.forums.vote.Vote;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;

@ExtendWith(MockitoExtension.class)
class CommentServiceTests {

    @Mock
    private CommentRepository commentRepository;

    @Mock
    private PostRepository postRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private VoteRepository voteRepository;

    @InjectMocks
    private CommentService commentService;

    private static final UUID USER_ID = UUID.randomUUID();
    private static final UUID OTHER_USER_ID = UUID.randomUUID();
    private static final UUID ADMIN_USER_ID = UUID.randomUUID();
    private static final UUID POST_ID = UUID.randomUUID();
    private static final UUID FORUM_ID = UUID.randomUUID();

    private User testUser;
    private User adminUser;
    private Post testPost;
    private Forum testForum;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(USER_ID)
                .username("testuser")
                .email("test@example.com")
                .passwordHash("hash")
                .isActive(true)
                .roles(new HashSet<>(Set.of(Role.builder().id(UUID.randomUUID()).name("ROLE_USER").build())))
                .build();

        adminUser = User.builder()
                .id(ADMIN_USER_ID)
                .username("admin")
                .email("admin@example.com")
                .passwordHash("hash")
                .isActive(true)
                .roles(new HashSet<>(Set.of(Role.builder().id(UUID.randomUUID()).name("ROLE_ADMIN").build())))
                .build();

        testForum = Forum.builder()
                .id(FORUM_ID)
                .name("Test Forum")
                .slug("test-forum")
                .build();

        testPost = Post.builder()
                .id(POST_ID)
                .forum(testForum)
                .author(testUser)
                .slug("test-post")
                .title("Test Post")
                .body("Test body")
                .status(PostStatus.PUBLISHED)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    @Nested
    @DisplayName("createComment")
    class CreateComment {

        @Test
        @DisplayName("Should create a top-level comment")
        void shouldCreateTopLevelComment() {
            var request = new CommentCreateRequest("test-post", "Great post!", null);

            given(postRepository.findBySlug("test-post")).willReturn(Optional.of(testPost));
            given(userRepository.findById(USER_ID)).willReturn(Optional.of(testUser));
            given(commentRepository.save(any(Comment.class))).willAnswer(invocation -> {
                Comment c = invocation.getArgument(0);
                c.setId(1L);
                c.setCreatedAt(OffsetDateTime.now());
                c.setUpdatedAt(OffsetDateTime.now());
                return c;
            });

            CommentResponse result = commentService.createComment(request, USER_ID);

            assertThat(result.id()).isEqualTo(1L);
            assertThat(result.body()).isEqualTo("Great post!");
            assertThat(result.parentCommentId()).isNull();
            assertThat(result.author().username()).isEqualTo("testuser");
            then(commentRepository).should().save(any(Comment.class));
        }

        @Test
        @DisplayName("Should create a reply to an existing comment")
        void shouldCreateReply() {
            Comment parentComment = Comment.builder()
                    .id(10L)
                    .post(testPost)
                    .author(testUser)
                    .body("Parent comment")
                    .createdAt(OffsetDateTime.now())
                    .updatedAt(OffsetDateTime.now())
                    .replies(new ArrayList<>())
                    .build();

            var request = new CommentCreateRequest("test-post", "Reply!", 10L);

            given(postRepository.findBySlug("test-post")).willReturn(Optional.of(testPost));
            given(userRepository.findById(USER_ID)).willReturn(Optional.of(testUser));
            given(commentRepository.findById(10L)).willReturn(Optional.of(parentComment));
            given(commentRepository.save(any(Comment.class))).willAnswer(invocation -> {
                Comment c = invocation.getArgument(0);
                c.setId(2L);
                c.setCreatedAt(OffsetDateTime.now());
                c.setUpdatedAt(OffsetDateTime.now());
                return c;
            });

            CommentResponse result = commentService.createComment(request, USER_ID);

            assertThat(result.id()).isEqualTo(2L);
            assertThat(result.body()).isEqualTo("Reply!");
            assertThat(result.parentCommentId()).isEqualTo(10L);
        }

        @Test
        @DisplayName("Should throw 404 when post not found")
        void shouldThrowWhenPostNotFound() {
            var request = new CommentCreateRequest("nonexistent", "Body", null);
            given(postRepository.findBySlug("nonexistent")).willReturn(Optional.empty());

            assertThatThrownBy(() -> commentService.createComment(request, USER_ID))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("Post not found");
        }

        @Test
        @DisplayName("Should throw 404 when parent comment not found")
        void shouldThrowWhenParentNotFound() {
            var request = new CommentCreateRequest("test-post", "Body", 999L);
            given(postRepository.findBySlug("test-post")).willReturn(Optional.of(testPost));
            given(userRepository.findById(USER_ID)).willReturn(Optional.of(testUser));
            given(commentRepository.findById(999L)).willReturn(Optional.empty());

            assertThatThrownBy(() -> commentService.createComment(request, USER_ID))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("Parent comment not found");
        }
    }

    @Nested
    @DisplayName("getCommentsForPost")
    class GetCommentsForPost {

        @Test
        @DisplayName("Should return threaded comment tree")
        void shouldReturnCommentTree() {
            Comment topLevel = Comment.builder()
                    .id(1L)
                    .post(testPost)
                    .author(testUser)
                    .body("Top level")
                    .createdAt(OffsetDateTime.now())
                    .updatedAt(OffsetDateTime.now())
                    .replies(new ArrayList<>())
                    .build();

            Comment reply = Comment.builder()
                    .id(2L)
                    .post(testPost)
                    .author(testUser)
                    .parentComment(topLevel)
                    .body("Reply")
                    .createdAt(OffsetDateTime.now())
                    .updatedAt(OffsetDateTime.now())
                    .replies(new ArrayList<>())
                    .build();

            topLevel.getReplies().add(reply);

            given(postRepository.findBySlug("test-post")).willReturn(Optional.of(testPost));
            given(commentRepository.findByPostIdAndParentCommentIsNullOrderByCreatedAtDesc(POST_ID))
                    .willReturn(List.of(topLevel));
            given(voteRepository.countByTargetTypeAndTargetIdAndValue(anyString(), anyString(), anyInt()))
                    .willReturn(0L);

            List<CommentResponse> results = commentService.getCommentsForPost("test-post", USER_ID);

            assertThat(results).hasSize(1);
            assertThat(results.getFirst().body()).isEqualTo("Top level");
            assertThat(results.getFirst().replies()).hasSize(1);
            assertThat(results.getFirst().replies().getFirst().body()).isEqualTo("Reply");
        }

        @Test
        @DisplayName("Should include user vote when authenticated")
        void shouldIncludeUserVote() {
            Comment comment = Comment.builder()
                    .id(1L)
                    .post(testPost)
                    .author(testUser)
                    .body("Comment")
                    .createdAt(OffsetDateTime.now())
                    .updatedAt(OffsetDateTime.now())
                    .replies(new ArrayList<>())
                    .build();

            given(postRepository.findBySlug("test-post")).willReturn(Optional.of(testPost));
            given(commentRepository.findByPostIdAndParentCommentIsNullOrderByCreatedAtDesc(POST_ID))
                    .willReturn(List.of(comment));
            given(voteRepository.countByTargetTypeAndTargetIdAndValue("COMMENT", "1", 1)).willReturn(3L);
            given(voteRepository.countByTargetTypeAndTargetIdAndValue("COMMENT", "1", -1)).willReturn(1L);
            given(voteRepository.findByUserIdAndTargetTypeAndTargetId(USER_ID, "COMMENT", "1"))
                    .willReturn(Optional.of(Vote.builder().value(1).build()));

            List<CommentResponse> results = commentService.getCommentsForPost("test-post", USER_ID);

            assertThat(results).hasSize(1);
            assertThat(results.getFirst().upvotes()).isEqualTo(3);
            assertThat(results.getFirst().downvotes()).isEqualTo(1);
            assertThat(results.getFirst().userVote()).isEqualTo(1);
        }

        @Test
        @DisplayName("Should throw 404 when post not found")
        void shouldThrowWhenPostNotFound() {
            given(postRepository.findBySlug("nonexistent")).willReturn(Optional.empty());

            assertThatThrownBy(() -> commentService.getCommentsForPost("nonexistent", null))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("Post not found");
        }
    }

    @Nested
    @DisplayName("deleteComment")
    class DeleteComment {

        @Test
        @DisplayName("Should delete comment when user is the author")
        void shouldDeleteWhenAuthor() {
            Comment comment = Comment.builder()
                    .id(1L)
                    .post(testPost)
                    .author(testUser)
                    .body("My comment")
                    .build();

            given(commentRepository.findById(1L)).willReturn(Optional.of(comment));

            commentService.deleteComment(1L, USER_ID);

            then(commentRepository).should().delete(comment);
        }

        @Test
        @DisplayName("Should delete comment when user is an admin")
        void shouldDeleteWhenAdmin() {
            Comment comment = Comment.builder()
                    .id(1L)
                    .post(testPost)
                    .author(testUser)
                    .body("Someone's comment")
                    .build();

            given(commentRepository.findById(1L)).willReturn(Optional.of(comment));
            given(userRepository.findById(ADMIN_USER_ID)).willReturn(Optional.of(adminUser));

            commentService.deleteComment(1L, ADMIN_USER_ID);

            then(commentRepository).should().delete(comment);
        }

        @Test
        @DisplayName("Should throw 403 when user is not the author or admin")
        void shouldThrowWhenNotAuthorOrAdmin() {
            User otherUser = User.builder()
                    .id(OTHER_USER_ID)
                    .username("otheruser")
                    .roles(new HashSet<>(Set.of(Role.builder().id(UUID.randomUUID()).name("ROLE_USER").build())))
                    .build();

            Comment comment = Comment.builder()
                    .id(1L)
                    .post(testPost)
                    .author(testUser)
                    .body("Someone's comment")
                    .build();

            given(commentRepository.findById(1L)).willReturn(Optional.of(comment));
            given(userRepository.findById(OTHER_USER_ID)).willReturn(Optional.of(otherUser));

            assertThatThrownBy(() -> commentService.deleteComment(1L, OTHER_USER_ID))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("FORBIDDEN");
        }

        @Test
        @DisplayName("Should throw 404 when comment not found")
        void shouldThrowWhenCommentNotFound() {
            given(commentRepository.findById(999L)).willReturn(Optional.empty());

            assertThatThrownBy(() -> commentService.deleteComment(999L, USER_ID))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("Comment not found");
        }
    }
}
