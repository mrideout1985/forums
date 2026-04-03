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
import com.rideout.forums.vote.Vote;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;

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
        return postRepository.findByForumIdOrderByCreatedAtDesc(forum.getId(), pageable)
                .map(post -> enrichPost(post, currentUserId));
    }

    @Transactional(readOnly = true)
    public Page<PostResponse> listPostsByForumAndStatus(String forumSlug, PostStatus status, UUID currentUserId, Pageable pageable) {
        Forum forum = forumRepository.findBySlug(forumSlug)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Forum not found: " + forumSlug));
        return postRepository.findByForumIdAndStatusOrderByCreatedAtDesc(forum.getId(), status, pageable)
                .map(post -> enrichPost(post, currentUserId));
    }

    @Transactional(readOnly = true)
    public Page<PostResponse> listPostsByAuthor(UUID authorId, UUID currentUserId, Pageable pageable) {
        // Verify user exists
        userRepository.findById(authorId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + authorId));

        return postRepository.findByAuthorIdOrderByCreatedAtDesc(authorId, pageable)
                .map(post -> enrichPost(post, currentUserId));
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
    public List<PostResponse> getHotPosts(UUID currentUserId, int limit) {
        // Fetch recent posts and sort by score (upvotes - downvotes + commentCount)
        Page<Post> recentPosts = postRepository.findAll(PageRequest.of(0, Math.max(limit * 3, 100)));

        return recentPosts.getContent().stream()
                .map(post -> enrichPost(post, currentUserId))
                .sorted(Comparator.comparingLong(
                        (PostResponse p) -> p.upvotes() - p.downvotes() + p.commentCount()
                ).reversed())
                .limit(limit)
                .toList();
    }

    private PostResponse enrichPost(Post post, UUID currentUserId) {
        String postId = post.getId().toString();
        long upvotes = voteRepository.countByTargetTypeAndTargetIdAndValue("POST", postId, 1);
        long downvotes = voteRepository.countByTargetTypeAndTargetIdAndValue("POST", postId, -1);
        long commentCount = commentRepository.countByPostId(post.getId());

        Integer userVote = null;
        if (currentUserId != null) {
            userVote = voteRepository
                    .findByUserIdAndTargetTypeAndTargetId(currentUserId, "POST", postId)
                    .map(Vote::getValue)
                    .orElse(null);
        }

        return PostResponse.from(post, upvotes, downvotes, userVote, commentCount);
    }
}
