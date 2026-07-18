package com.elevateresume.backend.auth;

import com.elevateresume.backend.shared.ApiResponses;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private final AuthService auth;
    private final ProfileService profiles;

    public AuthController(AuthService auth, ProfileService profiles) {
        this.auth = auth;
        this.profiles = profiles;
    }

    @PostMapping("/signup")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthDtos.AuthResponse signUp(@RequestBody AuthDtos.AuthRequest request, HttpServletRequest servletRequest) {
        return auth.signUp(request, frontendOrigin(servletRequest));
    }

    @PostMapping("/login")
    public AuthDtos.AuthResponse login(@RequestBody AuthDtos.AuthRequest request) {
        return auth.login(request);
    }

    @GetMapping("/me")
    public ApiResponses.Data<AuthDtos.ProfileResponse> me(HttpServletRequest request) {
        CurrentUser user = auth.requireUser(request);
        return new ApiResponses.Data<>(profiles.getOrCreate(user));
    }

    @PutMapping("/profile")
    public ApiResponses.Data<AuthDtos.ProfileResponse> updateProfile(
            @RequestBody AuthDtos.ProfileUpdateRequest request,
            HttpServletRequest servletRequest) {
        CurrentUser user = auth.requireUser(servletRequest);
        return new ApiResponses.Data<>(profiles.update(user, request));
    }

    private String frontendOrigin(HttpServletRequest request) {
        String origin = request.getHeader("Origin");
        if (origin != null && !origin.isBlank()) {
            return origin;
        }
        String referer = request.getHeader("Referer");
        if (referer == null || referer.isBlank()) {
            return null;
        }
        int slash = referer.indexOf('/', "https://".length());
        return slash > 0 ? referer.substring(0, slash) : referer;
    }
}
