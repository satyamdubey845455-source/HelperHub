package com.fittrack.repository;

import com.fittrack.entity.BodyMeasurement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BodyMeasurementRepository extends JpaRepository<BodyMeasurement, Long> {

    List<BodyMeasurement> findByUserIdOrderByLogDateDesc(Long userId);

    List<BodyMeasurement> findByUserIdAndLogDateBetweenOrderByLogDateAsc(Long userId, LocalDate from, LocalDate to);

    Optional<BodyMeasurement> findTopByUserIdOrderByLogDateDesc(Long userId);

    @Query("SELECT b FROM BodyMeasurement b WHERE b.user.id = :userId AND b.logDate = :date")
    Optional<BodyMeasurement> findByUserIdAndDate(@Param("userId") Long userId, @Param("date") LocalDate date);
}
