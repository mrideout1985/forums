package com.rideout.forums.service.forum;

import com.rideout.forums.common.SlugValidator;
import com.rideout.forums.forum.Forum;
import com.rideout.forums.forum.ForumCreateRequest;
import com.rideout.forums.forum.ForumResponse;
import com.rideout.forums.forum.ForumUpdateRequest;
import com.rideout.forums.repository.forum.ForumRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ForumService {
    private final ForumRepository forumRepository;

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
    public ForumResponse getForum(String slug) {
        Forum forum = forumRepository.findBySlug(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Forum not found: " + slug));
        return ForumResponse.from(forum);
    }

    @Transactional(readOnly = true)
    public Page<ForumResponse> listForums(Pageable pageable) {
        return forumRepository.findAll(pageable)
                .map(ForumResponse::from);
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
