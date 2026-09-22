package com.fittrack.controller;

import com.fittrack.dto.request.LoginRequest;
import com.fittrack.dto.request.RegisterRequest;
import com.fittrack.dto.response.ApiResponse;
import com.fittrack.dto.response.AuthResponse;
import com.fittrack.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * POST /api/auth/register
     * Registers a new user and returns JWT access + refresh tokens.
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request) {

        AuthResponse data = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Registration successful", data));
    }

    /**
     * POST /api/auth/login
     * Authenticates a user and returns JWT access + refresh tokens.
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {

        AuthResponse data = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Login successful", data));
    }

    /**
     * POST /api/auth/refresh
     * Rotates refresh token and returns a new access token.
     */
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<com.fittrack.dto.response.TokenRefreshResponse>> refresh(
            @Valid @RequestBody com.fittrack.dto.request.RefreshTokenRequest request) {
        com.fittrack.dto.response.TokenRefreshResponse response = authService.refresh(request.getRefreshToken());
        return ResponseEntity.ok(ApiResponse.ok("Token refreshed", response));
    }

    /**
     * POST /api/auth/logout
     * Revokes the refresh token.
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @RequestBody(required = false) com.fittrack.dto.request.RefreshTokenRequest request) {
        if (request != null) {
            authService.logout(request.getRefreshToken());
        }
        return ResponseEntity.ok(ApiResponse.ok("Logged out successfully", null));
    }

    /**
     * GET /api/auth/health
     * Health check for auth service. Returns 200 if the server is up.
     */
    @GetMapping("/health")
    public ResponseEntity<ApiResponse<String>> health() {
        return ResponseEntity.ok(ApiResponse.ok("FitTrack API is running", "OK"));
    }
}
