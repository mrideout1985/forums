package com.rideout.forums.service.post;

import com.rideout.forums.common.SlugValidator;
import com.rideout.forums.forum.Forum;
import com.rideout.forums.post.Post;
import com.rideout.forums.post.PostCreateRequest;
import com.rideout.forums.post.PostResponse;
import com.rideout.forums.post.PostStatus;
import com.rideout.forums.post.PostUpdateRequest;
import com.rideout.forums.repository.comment.CommentRepository;
import com.rideout.forums.repository.forum.ForumRepository;
import com.rideout.forums.repository.post.PostRepository;
import com.rideout.forums.repository.user.UserRepository;
import com.rideout.forums.repository.vote.VoteRepository;
import com.rideout.forums.user.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import org.springframework.data.domain.PageImpl;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PostService {
    private final PostRepository postRepository;
    private final ForumRepository forumRepository;
    private final UserRepository userRepository;
    private final VoteRepository voteRepository;
    private final CommentRepository commentRepository;

    public PostResponse createPost(PostCreateRequest request, UUID authorId) {
        // Validate slug
        SlugValidator.validateSlug(request.slug());

        // Check if slug already exists
        if (postRepository.findBySlug(request.slug()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Post slug already exists: " + request.slug());
        }

        // Resolve forum
        Forum forum = forumRepository.findBySlug(request.forumSlug())
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Forum not found: " + request.forumSlug()
            ));

        // Resolve author
        User author = userRepository.findById(authorId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + authorId));

        // Parse and validate status
        PostStatus status = parseStatus(request.status());

        Post post = Post.builder()
                .forum(forum)
                .author(author)
                .slug(request.slug())
                .title(request.title())
                .body(request.body())
                .status(status)
                .build();

        Post savedPost = postRepository.save(post);
        return PostResponse.from(savedPost);
    }

    @Transactional(readOnly = true)
    public PostResponse getPost(String slug, UUID currentUserId) {
        Post post = postRepository.findBySlug(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found: " + slug));
        return enrichPost(post, currentUserId);
    }

    @Transactional(readOnly = true)
    public Page<PostResponse> listPostsByForum(String forumSlug, UUID currentUserId, Pageable pageable) {
        Forum forum = forumRepository.findBySlug(forumSlug)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Forum not found: " + forumSlug));
        Page<Post> page = postRepository.findByForumIdOrderByCreatedAtDesc(forum.getId(), pageable);
        return new PageImpl<>(enrichPosts(page.getContent(), currentUserId), pageable, page.getTotalElements());
    }

    @Transactional(readOnly = true)
    public Page<PostResponse> listPostsByForumAndStatus(String forumSlug, PostStatus status, UUID currentUserId, Pageable pageable) {
        Forum forum = forumRepository.findBySlug(forumSlug)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Forum not found: " + forumSlug));
        Page<Post> page = postRepository.findByForumIdAndStatusOrderByCreatedAtDesc(forum.getId(), status, pageable);
        return new PageImpl<>(enrichPosts(page.getContent(), currentUserId), pageable, page.getTotalElements());
    }

    @Transactional(readOnly = true)
    public Page<PostResponse> listPostsByAuthor(UUID authorId, UUID currentUserId, Pageable pageable) {
        userRepository.findById(authorId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + authorId));
        Page<Post> page = postRepository.findByAuthorIdOrderByCreatedAtDesc(authorId, pageable);
        return new PageImpl<>(enrichPosts(page.getContent(), currentUserId), pageable, page.getTotalElements());
    }

    public PostResponse updatePost(String slug, PostUpdateRequest request, UUID requestingUserId) {
        Post post = postRepository.findBySlug(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found: " + slug));

        // Authorization: only author or admin can update
        if (!isOwnerOrAdmin(post.getAuthor().getId(), requestingUserId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only the post author or an admin can update this post"
            );
        }

        if (request.title() != null && !request.title().isBlank()) {
            post.setTitle(request.title());
        }

        if (request.body() != null && !request.body().isBlank()) {
            post.setBody(request.body());
        }

        if (request.status() != null && !request.status().isBlank()) {
            PostStatus status = parseStatus(request.status());
            post.setStatus(status);
        }

        Post updatedPost = postRepository.save(post);
        return enrichPost(updatedPost, requestingUserId);
    }

    public void deletePost(String slug, UUID requestingUserId) {
        Post post = postRepository.findBySlug(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found: " + slug));

        // Authorization: only author or admin can delete
        if (!isOwnerOrAdmin(post.getAuthor().getId(), requestingUserId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only the post author or an admin can delete this post"
            );
        }

        postRepository.delete(post);
    }

    private PostStatus parseStatus(String statusStr) {
        if (statusStr == null || statusStr.isBlank()) {
            return PostStatus.PUBLISHED;
        }

        try {
            return PostStatus.valueOf(statusStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status: " + statusStr);
        }
    }

    private boolean isOwnerOrAdmin(UUID authorId, UUID requestingUserId) {
        if (authorId.equals(requestingUserId)) {
            return true;
        }

        // Check if requesting user has ADMIN role
        User user = userRepository.findById(requestingUserId)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "User not found: " + requestingUserId
            ));

        return user.getRoles().stream()
                .anyMatch(role -> role.getName().equals("ROLE_ADMIN"));
    }

    @Transactional(readOnly = true)
    public Page<PostResponse> getHotPosts(UUID currentUserId, Pageable pageable) {
        int fetchSize = Math.max((pageable.getPageNumber() + 1) * pageable.getPageSize() * 3, 100);
        Page<Post> recentPosts = postRepository.findAll(PageRequest.of(0, fetchSize));

        List<PostResponse> scored = enrichPosts(recentPosts.getContent(), currentUserId).stream()
                .sorted(Comparator.comparingLong(
                        (PostResponse p) -> p.upvotes() - p.downvotes() + p.commentCount()
                ).reversed())
                .toList();

        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), scored.size());
        List<PostResponse> pageContent = start >= scored.size() ? List.of() : scored.subList(start, end);
        return new PageImpl<>(pageContent, pageable, scored.size());
    }

    private PostResponse enrichPost(Post post, UUID currentUserId) {
        return enrichPosts(List.of(post), currentUserId).getFirst();
    }

    private List<PostResponse> enrichPosts(List<Post> posts, UUID currentUserId) {
        if (posts.isEmpty()) return List.of();

        List<String> postIds = posts.stream().map(p -> p.getId().toString()).toList();
        List<UUID> postUuids = posts.stream().map(Post::getId).toList();

        Map<String, long[]> voteCounts = voteRepository.findVoteStatsByPostIds(postIds).stream()
                .collect(Collectors.toMap(
                        s -> s.postId(),
                        s -> new long[]{s.upvotes(), s.downvotes()}
                ));

        Map<UUID, Long> commentCounts = commentRepository.countByPostIds(postUuids).stream()
                .collect(Collectors.toMap(c -> c.postId(), c -> c.commentCount()));

        Map<String, Integer> userVotes = currentUserId == null ? Map.of() :
                voteRepository.findUserVotesByPostIds(currentUserId, postIds).stream()
                        .collect(Collectors.toMap(v -> v.postId(), v -> v.voteValue()));

        return posts.stream()
                .map(post -> {
                    String postId = post.getId().toString();
                    long[] votes = voteCounts.getOrDefault(postId, new long[]{0, 0});
                    long commentCount = commentCounts.getOrDefault(post.getId(), 0L);
                    Integer userVote = userVotes.get(postId);
                    return PostResponse.from(post, votes[0], votes[1], userVote, commentCount);
                })
                .toList();
    }
}
