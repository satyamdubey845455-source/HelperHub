package com.fittrack.service;

import com.fittrack.dto.request.LoginRequest;
import com.fittrack.dto.request.RegisterRequest;
import com.fittrack.dto.response.AuthResponse;
import com.fittrack.entity.User;
import com.fittrack.exception.FitTrackException;
import com.fittrack.repository.RefreshTokenRepository;
import com.fittrack.repository.UserProfileRepository;
import com.fittrack.repository.UserRepository;
import com.fittrack.security.JwtUtil;
import com.fittrack.security.UserDetailsServiceImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final UserProfileRepository profileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsServiceImpl userDetailsService;
    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${fittrack.jwt.refresh-token-expiration-ms:604800000}")
    private long refreshTokenExpirationMs;

    public AuthService(UserRepository userRepository,
                       UserProfileRepository profileRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       AuthenticationManager authenticationManager,
                       UserDetailsServiceImpl userDetailsService,
                       RefreshTokenRepository refreshTokenRepository) {
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.refreshTokenRepository = refreshTokenRepository;
    }

    /**
     * Registers a new user.
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw FitTrackException.badRequest("Passwords do not match");
        }

        if (userRepository.existsByEmail(request.getEmail().toLowerCase().trim())) {
            throw FitTrackException.conflict("An account with this email already exists");
        }

        User user = User.builder()
                .fullName(request.getFullName().trim())
                .email(request.getEmail().toLowerCase().trim())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(User.Role.USER)
                .isActive(true)
                .build();

        user = userRepository.save(user);
        log.info("New user registered: {}", user.getEmail());

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String accessToken = jwtUtil.generateAccessToken(userDetails);
        String refreshToken = createAndSaveRefreshToken(user, userDetails);

        return buildAuthResponse(user, accessToken, refreshToken, false);
    }

    /**
     * Authenticates a user and returns JWT access + refresh tokens.
     */
    @Transactional
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail().toLowerCase().trim(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> FitTrackException.unauthorized("Invalid credentials"));

        boolean profileComplete = profileRepository.existsByUserId(user.getId());

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String accessToken = jwtUtil.generateAccessToken(userDetails);
        String refreshToken = createAndSaveRefreshToken(user, userDetails);

        return buildAuthResponse(user, accessToken, refreshToken, profileComplete);
    }

    /**
     * Validates and rotates refresh token, returning a new access token and rotated refresh token.
     */
    @Transactional
    public com.fittrack.dto.response.TokenRefreshResponse refresh(String token) {
        com.fittrack.entity.RefreshToken rt = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> FitTrackException.unauthorized("Invalid refresh token"));

        if (rt.isRevoked() || rt.isExpired()) {
            refreshTokenRepository.delete(rt);
            throw FitTrackException.unauthorized("Refresh token is expired or revoked. Please log in again.");
        }

        User user = rt.getUser();
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());

        // Revoke the old refresh token (token rotation)
        rt.setRevoked(true);
        refreshTokenRepository.save(rt);

        // Generate fresh pair
        String newAccessToken = jwtUtil.generateAccessToken(userDetails);
        String newRefreshToken = createAndSaveRefreshToken(user, userDetails);

        return com.fittrack.dto.response.TokenRefreshResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .tokenType("Bearer")
                .build();
    }

    /**
     * Revokes a refresh token on logout.
     */
    @Transactional
    public void logout(String token) {
        if (token != null && !token.trim().isEmpty()) {
            refreshTokenRepository.findByToken(token).ifPresent(rt -> {
                rt.setRevoked(true);
                refreshTokenRepository.save(rt);
            });
        }
    }

    private String createAndSaveRefreshToken(User user, UserDetails userDetails) {
        String tokenString = jwtUtil.generateRefreshToken(userDetails);
        com.fittrack.entity.RefreshToken rt = com.fittrack.entity.RefreshToken.builder()
                .user(user)
                .token(tokenString)
                .expiresAt(java.time.Instant.now().plusMillis(refreshTokenExpirationMs))
                .revoked(false)
                .build();
        refreshTokenRepository.save(rt);
        return tokenString;
    }

    private AuthResponse buildAuthResponse(User user, String accessToken, String refreshToken, boolean profileComplete) {
        return AuthResponse.builder()
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .profileComplete(profileComplete)
                .build();
    }
}
