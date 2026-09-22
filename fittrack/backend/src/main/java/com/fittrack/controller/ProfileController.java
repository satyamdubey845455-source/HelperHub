package com.fittrack.controller;

import com.fittrack.dto.request.ProfileRequest;
import com.fittrack.dto.request.TargetOverrideRequest;
import com.fittrack.dto.response.ApiResponse;
import com.fittrack.dto.response.ProfileResponse;
import com.fittrack.entity.User;
import com.fittrack.service.ProfileService;
import com.fittrack.utils.SecurityContextUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;
    private final SecurityContextUtil securityContextUtil;

    /**
     * GET /api/profile
     * Returns the current user's fitness profile.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<ProfileResponse>> getProfile() {
        User user = securityContextUtil.getCurrentUser();
        ProfileResponse data = profileService.getProfile(user);
        return ResponseEntity.ok(ApiResponse.ok("Profile retrieved", data));
    }

    /**
     * POST /api/profile
     * Creates the profile for the first time (post-registration wizard).
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ProfileResponse>> createProfile(
            @Valid @RequestBody ProfileRequest request) {

        User user = securityContextUtil.getCurrentUser();
        ProfileResponse data = profileService.createOrUpdateProfile(user, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Profile created successfully", data));
    }

    /**
     * PUT /api/profile
     * Updates the existing fitness profile (recalculates targets).
     */
    @PutMapping
    public ResponseEntity<ApiResponse<ProfileResponse>> updateProfile(
            @Valid @RequestBody ProfileRequest request) {

        User user = securityContextUtil.getCurrentUser();
        ProfileResponse data = profileService.createOrUpdateProfile(user, request);
        return ResponseEntity.ok(ApiResponse.ok("Profile updated successfully", data));
    }

    /**
     * PUT /api/profile/targets
     * Manually overrides the daily nutrition and lifestyle targets.
     */
    @PutMapping("/targets")
    public ResponseEntity<ApiResponse<ProfileResponse>> overrideTargets(
            @Valid @RequestBody TargetOverrideRequest request) {

        User user = securityContextUtil.getCurrentUser();
        ProfileResponse data = profileService.overrideTargets(user, request);
        return ResponseEntity.ok(ApiResponse.ok("Targets updated. Note: these are custom values.", data));
    }

    /**
     * POST /api/profile/targets/recalculate
     * Resets manually overridden targets and recalculates from profile data.
     */
    @PostMapping("/targets/recalculate")
    public ResponseEntity<ApiResponse<ProfileResponse>> recalculateTargets() {
        User user = securityContextUtil.getCurrentUser();
        ProfileResponse data = profileService.recalculateTargets(user);
        return ResponseEntity.ok(ApiResponse.ok("Targets recalculated from your profile data (estimates)", data));
    }
}
