package com.fittrack.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponse {

    private Long userId;
    private String fullName;
    private String email;
    private String role;
    private String accessToken;
    private String refreshToken;
    private boolean profileComplete;

    /** Token type is always "Bearer" */
    @Builder.Default
    private String tokenType = "Bearer";
}
