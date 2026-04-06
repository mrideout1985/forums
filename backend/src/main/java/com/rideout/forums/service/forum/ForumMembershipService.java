package com.rideout.forums.service.forum;

import com.rideout.forums.forum.Forum;
import com.rideout.forums.forum.ForumMember;
import com.rideout.forums.forum.ForumResponse;
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

import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ForumMembershipService {

    private final ForumRepository forumRepository;
    private final ForumMemberRepository forumMemberRepository;

    public ForumResponse joinForum(String slug, UUID userId) {
        Forum forum = findForumBySlug(slug);

        if (forumMemberRepository.existsByUserIdAndForumId(userId, forum.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Already a member of forum: " + slug);
        }

        ForumMember member = ForumMember.builder()
                .userId(userId)
                .forumId(forum.getId())
                .build();
        forumMemberRepository.save(member);

        long memberCount = forumMemberRepository.countByForumId(forum.getId());
        return ForumResponse.from(forum, true, memberCount);
    }

    public ForumResponse leaveForum(String slug, UUID userId) {
        Forum forum = findForumBySlug(slug);

        if (!forumMemberRepository.existsByUserIdAndForumId(userId, forum.getId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Not a member of forum: " + slug);
        }

        forumMemberRepository.deleteByUserIdAndForumId(userId, forum.getId());

        long memberCount = forumMemberRepository.countByForumId(forum.getId());
        return ForumResponse.from(forum, false, memberCount);
    }

    @Transactional(readOnly = true)
    public Page<ForumResponse> listJoinedForums(UUID userId, Pageable pageable) {
        return forumMemberRepository.findForumsByUserId(userId, pageable)
                .map(forum -> ForumResponse.from(
                        forum,
                        true,
                        forumMemberRepository.countByForumId(forum.getId())
                ));
    }

    @Transactional(readOnly = true)
    public Set<UUID> getJoinedForumIds(UUID userId) {
        return forumMemberRepository.findForumIdsByUserId(userId);
    }

    private Forum findForumBySlug(String slug) {
        return forumRepository.findBySlug(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Forum not found: " + slug));
    }
}
