package com.fittrack.repository;

import com.fittrack.entity.UserFavoriteFood;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserFavoriteFoodRepository extends JpaRepository<UserFavoriteFood, Long> {
    List<UserFavoriteFood> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<UserFavoriteFood> findByUserIdAndFoodId(Long userId, Long foodId);
    boolean existsByUserIdAndFoodId(Long userId, Long foodId);
    void deleteByUserIdAndFoodId(Long userId, Long foodId);
}
