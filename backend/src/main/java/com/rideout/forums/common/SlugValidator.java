package com.rideout.forums.common;

import java.util.Set;
import java.util.regex.Pattern;

public class SlugValidator {
    private static final Pattern SLUG_PATTERN = Pattern.compile("^[a-z0-9]+(?:-[a-z0-9]+)*$");
    private static final int MIN_LENGTH = 3;
    private static final int MAX_LENGTH = 64;

    private static final Set<String> RESERVED_SLUGS = Set.of(
            "admin", "api", "auth", "users", "posts", "forum", "forums", "settings", "about", "help"
    );

    public static void validateSlug(String slug) {
        if (slug == null || slug.isBlank()) {
            throw new IllegalArgumentException("Slug cannot be empty");
        }

        if (slug.length() < MIN_LENGTH || slug.length() > MAX_LENGTH) {
            throw new IllegalArgumentException(
                    "Slug must be between " + MIN_LENGTH + " and " + MAX_LENGTH + " characters"
            );
        }

        if (!SLUG_PATTERN.matcher(slug).matches()) {
            throw new IllegalArgumentException(
                    "Slug must contain only lowercase letters, numbers, and hyphens"
            );
        }

        if (RESERVED_SLUGS.contains(slug)) {
            throw new IllegalArgumentException("Slug '" + slug + "' is reserved");
        }
    }
}
