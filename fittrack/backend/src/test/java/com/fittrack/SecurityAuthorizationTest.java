package com.fittrack;

import com.fittrack.entity.*;
import com.fittrack.exception.FitTrackException;
import com.fittrack.repository.ExerciseRepository;
import com.fittrack.repository.WorkoutExerciseSetRepository;
import com.fittrack.repository.WorkoutSessionRepository;
import com.fittrack.service.WorkoutService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class SecurityAuthorizationTest {

    @Mock
    private WorkoutSessionRepository sessionRepository;

    @Mock
    private WorkoutExerciseSetRepository setRepository;

    @Mock
    private ExerciseRepository exerciseRepository;

    @InjectMocks
    private WorkoutService workoutService;

    private User userA;
    private User userB;
    private WorkoutSession sessionA;
    private WorkoutSession sessionB;
    private WorkoutExerciseSet setB;

    @BeforeEach
    void setUp() {
        userA = User.builder().id(1L).email("userA@fittrack.com").build();
        userB = User.builder().id(2L).email("userB@fittrack.com").build();

        sessionA = WorkoutSession.builder().id(10L).user(userA).build();
        sessionB = WorkoutSession.builder().id(20L).user(userB).build();

        setB = WorkoutExerciseSet.builder().id(100L).session(sessionB).build();
    }

    @Test
    void testUserCannotDeleteAnotherUsersWorkoutSession() {
        when(sessionRepository.findById(20L)).thenReturn(Optional.of(sessionB));

        // User A tries to delete User B's session
        assertThrows(FitTrackException.class, () -> workoutService.deleteSession(userA, 20L));
        verify(sessionRepository, never()).delete(any());
    }

    @Test
    void testUserCannotDeleteSetBelongingToAnotherSession() {
        // User A owns sessionA (id 10), but supplies setId 100 which belongs to sessionB (id 20)
        when(sessionRepository.findById(10L)).thenReturn(Optional.of(sessionA));
        when(setRepository.findById(100L)).thenReturn(Optional.of(setB));

        assertThrows(FitTrackException.class, () -> workoutService.deleteSet(userA, 10L, 100L));
        verify(setRepository, never()).delete(any());
    }
}
