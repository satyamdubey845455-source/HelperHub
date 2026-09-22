package com.fittrack.utils;

import com.fittrack.entity.User;
import com.fittrack.exception.FitTrackException;
import com.fittrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/**
 * Helper to resolve the authenticated user from the Spring SecurityContext.
 * Controllers and services MUST use this to get the current user — NEVER trust
 * a userId from the request body or path variable for authorization.
 */
@Component
@RequiredArgsConstructor
public class SecurityContextUtil {

    private final UserRepository userRepository;

    /**
     * Returns the currently authenticated User entity.
     * Throws 401 if unauthenticated or user not found.
     */
    public User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated()) {
            throw FitTrackException.unauthorized("Not authenticated");
        }

        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> FitTrackException.unauthorized("User session invalid"));
    }

    /**
     * Returns the current user's ID.
     */
    public Long getCurrentUserId() {
        return getCurrentUser().getId();
    }
}
