package com.rideout.forums.service.post;

import com.rideout.forums.common.SlugValidator;
import com.rideout.forums.forum.Forum;
import com.rideout.forums.post.Post;
import com.rideout.forums.post.PostCreateRequest;
import com.rideout.forums.post.PostResponse;
import com.rideout.forums.post.PostStatus;
import com.rideout.forums.post.PostUpdateRequest;
import com.rideout.forums.repository.forum.ForumRepository;
import com.rideout.forums.repository.post.PostRepository;
import com.rideout.forums.repository.user.UserRepository;
import com.rideout.forums.user.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PostService {
    private final PostRepository postRepository;
    private final ForumRepository forumRepository;
    private final UserRepository userRepository;

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
    public PostResponse getPost(String slug) {
        Post post = postRepository.findBySlug(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found: " + slug));
        return PostResponse.from(post);
    }

    @Transactional(readOnly = true)
    public Page<PostResponse> listPostsByForum(String forumSlug, Pageable pageable) {
        Forum forum = forumRepository.findBySlug(forumSlug)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Forum not found: " + forumSlug));
        return postRepository.findByForumIdOrderByCreatedAtDesc(forum.getId(), pageable)
                .map(PostResponse::from);
    }

    @Transactional(readOnly = true)
    public Page<PostResponse> listPostsByForumAndStatus(String forumSlug, PostStatus status, Pageable pageable) {
        Forum forum = forumRepository.findBySlug(forumSlug)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Forum not found: " + forumSlug));
        return postRepository.findByForumIdAndStatusOrderByCreatedAtDesc(forum.getId(), status, pageable)
                .map(PostResponse::from);
    }

    @Transactional(readOnly = true)
    public Page<PostResponse> listPostsByAuthor(UUID authorId, Pageable pageable) {
        // Verify user exists
        userRepository.findById(authorId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + authorId));

        return postRepository.findByAuthorIdOrderByCreatedAtDesc(authorId, pageable)
                .map(PostResponse::from);
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
        return PostResponse.from(updatedPost);
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
}
