package com.elevateresume.backend.auth;

import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProfileService {
    private final ProfileRepository profiles;

    public ProfileService(ProfileRepository profiles) {
        this.profiles = profiles;
    }

    @Transactional
    public AuthDtos.ProfileResponse getOrCreate(CurrentUser user) {
        ProfileEntity profile = profiles.findById(user.id())
                .orElseGet(() -> createProfile(user.id(), user.email(), splitEmailName(user.email())));
        return toResponse(profile);
    }

    @Transactional
    public AuthDtos.ProfileResponse update(CurrentUser user, AuthDtos.ProfileUpdateRequest request) {
        ProfileEntity profile = profiles.findById(user.id())
                .orElseGet(() -> createProfile(user.id(), user.email(), splitEmailName(user.email())));
        profile.setEmail(user.email());
        profile.setFullName(request.fullName());
        profile.setOnboardedTargetTitle(request.targetTitle());
        profile.setExperienceLevel(request.experienceLevel());
        return toResponse(profiles.save(profile));
    }

    @Transactional
    public void ensureProfile(UUID id, String email, String fullName) {
        if (id == null || email == null || email.isBlank()) {
            return;
        }
        profiles.findById(id).orElseGet(() -> createProfile(id, email, fullName));
    }

    private ProfileEntity createProfile(UUID id, String email, String fullName) {
        ProfileEntity profile = new ProfileEntity();
        profile.setId(id);
        profile.setEmail(email);
        profile.setFullName(fullName == null || fullName.isBlank() ? splitEmailName(email) : fullName);
        return profiles.save(profile);
    }

    private AuthDtos.ProfileResponse toResponse(ProfileEntity profile) {
        return new AuthDtos.ProfileResponse(
                profile.getId(),
                profile.getEmail(),
                profile.getFullName(),
                profile.getOnboardedTargetTitle(),
                profile.getExperienceLevel(),
                profile.getCreatedAt(),
                profile.getUpdatedAt());
    }

    private String splitEmailName(String email) {
        if (email == null || !email.contains("@")) {
            return "User";
        }
        return email.substring(0, email.indexOf('@'));
    }
}
