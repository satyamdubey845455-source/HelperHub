package com.fittrack.service;

import com.fittrack.dto.request.ProfileRequest;
import com.fittrack.dto.request.TargetOverrideRequest;
import com.fittrack.dto.response.ProfileResponse;
import com.fittrack.entity.User;
import com.fittrack.entity.UserProfile;
import com.fittrack.exception.FitTrackException;
import com.fittrack.repository.UserProfileRepository;
import com.fittrack.utils.TargetCalculatorUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProfileService {

    private final UserProfileRepository profileRepository;
    private final com.fittrack.repository.UserRepository userRepository;

    /**
     * Creates or updates the profile for the given user.
     * Re-calculates targets unless manually overridden.
     */
    @Transactional
    public ProfileResponse createOrUpdateProfile(User user, ProfileRequest request) {
        if (request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
            user.setFullName(request.getFullName().trim());
            user = userRepository.save(user);
        }

        UserProfile profile = profileRepository.findByUserId(user.getId())
                .orElse(UserProfile.builder().user(user).build());

        mapRequestToProfile(request, profile);
        TargetCalculatorUtil.applyCalculatedTargets(profile);
        profile.setTargetsManuallyOverridden(false);

        profile = profileRepository.save(profile);
        log.info("Profile saved for user {}", user.getEmail());

        return toResponse(user, profile);
    }

    /**
     * Returns the profile for the given user.
     */
    @Transactional(readOnly = true)
    public ProfileResponse getProfile(User user) {
        UserProfile profile = profileRepository.findByUserId(user.getId())
                .orElseThrow(() -> FitTrackException.notFound("Profile"));
        return toResponse(user, profile);
    }

    /**
     * Allows the user to manually override their calculated daily targets.
     * Sets targetsManuallyOverridden = true so the UI can display a notice.
     */
    @Transactional
    public ProfileResponse overrideTargets(User user, TargetOverrideRequest request) {
        UserProfile profile = profileRepository.findByUserId(user.getId())
                .orElseThrow(() -> FitTrackException.notFound("Profile"));

        profile.setDailyCalorieTarget(request.getDailyCalorieTarget());
        profile.setDailyProteinTarget(request.getDailyProteinTarget());
        profile.setDailyCarbTarget(request.getDailyCarbTarget());
        profile.setDailyFatTarget(request.getDailyFatTarget());
        profile.setDailyFiberTarget(request.getDailyFiberTarget());
        profile.setDailyWaterTargetMl(request.getDailyWaterTargetMl());
        profile.setDailySleepTargetHours(request.getDailySleepTargetHours());
        profile.setTargetsManuallyOverridden(true);

        profile = profileRepository.save(profile);
        return toResponse(user, profile);
    }

    /**
     * Recalculates targets from the current profile data (resets any manual overrides).
     */
    @Transactional
    public ProfileResponse recalculateTargets(User user) {
        UserProfile profile = profileRepository.findByUserId(user.getId())
                .orElseThrow(() -> FitTrackException.notFound("Profile"));

        TargetCalculatorUtil.applyCalculatedTargets(profile);
        profile.setTargetsManuallyOverridden(false);

        profile = profileRepository.save(profile);
        return toResponse(user, profile);
    }

    // ── Mapper ─────────────────────────────────────────────────────────────

    private void mapRequestToProfile(ProfileRequest req, UserProfile profile) {
        profile.setAge(req.getAge());
        profile.setGender(req.getGender());
        profile.setHeightCm(req.getHeightCm());
        profile.setWeightKg(req.getWeightKg());
        profile.setActivityLevel(req.getActivityLevel());
        profile.setFitnessGoal(req.getFitnessGoal());
        profile.setWorkoutFrequency(req.getWorkoutFrequency());
        profile.setPreferredWorkoutTime(req.getPreferredWorkoutTime());
        profile.setDietaryPreference(req.getDietaryPreference());
        if (req.getTimezone() != null && !req.getTimezone().trim().isEmpty()) {
            profile.setTimezone(req.getTimezone().trim());
        }
    }

    private ProfileResponse toResponse(User user, UserProfile profile) {
        Integer bmr = null;
        Integer tdee = null;
        if (profile.getWeightKg() != null && profile.getHeightCm() != null && profile.getAge() != null && profile.getGender() != null) {
            double bmrVal = TargetCalculatorUtil.calculateBmr(
                    profile.getWeightKg().doubleValue(),
                    profile.getHeightCm().doubleValue(),
                    profile.getAge(),
                    profile.getGender());
            bmr = (int) Math.round(bmrVal);
            if (profile.getActivityLevel() != null) {
                tdee = (int) Math.round(TargetCalculatorUtil.calculateTdee(bmrVal, profile.getActivityLevel()));
            }
        }

        return ProfileResponse.builder()
                .id(profile.getId())
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .age(profile.getAge())
                .gender(profile.getGender())
                .heightCm(profile.getHeightCm())
                .weightKg(profile.getWeightKg())
                .activityLevel(profile.getActivityLevel())
                .fitnessGoal(profile.getFitnessGoal())
                .workoutFrequency(profile.getWorkoutFrequency())
                .preferredWorkoutTime(profile.getPreferredWorkoutTime())
                .dietaryPreference(profile.getDietaryPreference())
                .dailyCalorieTarget(profile.getDailyCalorieTarget())
                .dailyProteinTarget(profile.getDailyProteinTarget())
                .dailyCarbTarget(profile.getDailyCarbTarget())
                .dailyFatTarget(profile.getDailyFatTarget())
                .dailyFiberTarget(profile.getDailyFiberTarget())
                .dailyWaterTargetMl(profile.getDailyWaterTargetMl())
                .dailySleepTargetHours(profile.getDailySleepTargetHours())
                .dailyAddedSugarTarget(profile.getDailyAddedSugarTarget())
                .timezone(profile.getTimezone())
                .targetsManuallyOverridden(profile.getTargetsManuallyOverridden())
                .bmr(bmr)
                .tdee(tdee)
                .updatedAt(profile.getUpdatedAt())
                .build();
    }
}
