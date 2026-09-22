package com.fittrack.exception;

import lombok.Getter;

/**
 * Base domain exception for FitTrack business logic errors.
 * Carry an HTTP status code and message to be returned to the client.
 */
@Getter
public class FitTrackException extends RuntimeException {

    private final int status;

    public FitTrackException(String message, int status) {
        super(message);
        this.status = status;
    }

    // ── Convenience factories ──────────────────────────────────────────────

    public static FitTrackException notFound(String resource) {
        return new FitTrackException(resource + " not found", 404);
    }

    public static FitTrackException badRequest(String message) {
        return new FitTrackException(message, 400);
    }

    public static FitTrackException conflict(String message) {
        return new FitTrackException(message, 409);
    }

    public static FitTrackException unauthorized(String message) {
        return new FitTrackException(message, 401);
    }

    public static FitTrackException forbidden(String message) {
        return new FitTrackException(message, 403);
    }
}
