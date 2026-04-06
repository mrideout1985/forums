package com.rideout.forums.service.forum;

import com.rideout.forums.common.SlugValidator;
import com.rideout.forums.forum.Forum;
import com.rideout.forums.forum.ForumCreateRequest;
import com.rideout.forums.forum.ForumResponse;
import com.rideout.forums.forum.ForumUpdateRequest;
import com.rideout.forums.repository.forum.ForumMemberRepository;
import com.rideout.forums.repository.forum.ForumRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collections;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ForumService {
    private final ForumRepository forumRepository;
    private final ForumMemberRepository forumMemberRepository;

    public ForumResponse createForum(ForumCreateRequest request) {
        SlugValidator.validateSlug(request.slug());

        // Check if slug already exists
        if (forumRepository.findBySlug(request.slug()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Forum slug already exists: " + request.slug());
        }

        Forum forum = Forum.builder()
                .slug(request.slug())
                .name(request.name())
                .description(request.description())
                .build();

        Forum savedForum = forumRepository.save(forum);
        return ForumResponse.from(savedForum);
    }

    @Transactional(readOnly = true)
    public ForumResponse getForum(String slug, UUID userId) {
        Forum forum = forumRepository.findBySlug(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Forum not found: " + slug));
        boolean joined = userId != null && forumMemberRepository.existsByUserIdAndForumId(userId, forum.getId());
        long memberCount = forumMemberRepository.countByForumId(forum.getId());
        return ForumResponse.from(forum, joined, memberCount);
    }

    @Transactional(readOnly = true)
    public Page<ForumResponse> listForums(Pageable pageable, UUID userId, String query) {
        Set<UUID> joinedIds = userId != null
                ? forumMemberRepository.findForumIdsByUserId(userId)
                : Collections.emptySet();
        Page<Forum> forums = (query != null && !query.isBlank())
                ? forumRepository.findByNameContainingIgnoreCase(query.strip(), pageable)
                : forumRepository.findAll(pageable);
        return forums.map(forum -> ForumResponse.from(
                        forum,
                        joinedIds.contains(forum.getId()),
                        forumMemberRepository.countByForumId(forum.getId())
                ));
    }

    public ForumResponse updateForum(String slug, ForumUpdateRequest request) {
        Forum forum = forumRepository.findBySlug(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Forum not found: " + slug));

        if (request.name() != null && !request.name().isBlank()) {
            forum.setName(request.name());
        }

        if (request.description() != null) {
            forum.setDescription(request.description());
        }

        Forum updatedForum = forumRepository.save(forum);
        return ForumResponse.from(updatedForum);
    }

    public void deleteForum(String slug) {
        Forum forum = forumRepository.findBySlug(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Forum not found: " + slug));
        forumRepository.delete(forum);
    }
}
