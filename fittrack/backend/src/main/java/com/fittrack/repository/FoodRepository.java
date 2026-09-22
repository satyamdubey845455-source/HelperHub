package com.fittrack.repository;

import com.fittrack.entity.Food;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FoodRepository extends JpaRepository<Food, Long> {

    /**
     * Search global foods + user's custom foods by name and optional category (case-insensitive).
     */
    @Query("SELECT f FROM Food f WHERE " +
           "(:query IS NULL OR :query = '' OR LOWER(f.name) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "(:category IS NULL OR :category = '' OR LOWER(f.category) = LOWER(:category)) AND " +
           "(f.isCustom = false OR (f.createdBy IS NOT NULL AND f.createdBy.id = :userId)) " +
           "ORDER BY f.isCustom ASC, f.name ASC")
    List<Food> searchFoodsWithFilter(@Param("query") String query,
                                     @Param("category") String category,
                                     @Param("userId") Long userId);

    @Query("SELECT f FROM Food f WHERE f.isCustom = true AND f.createdBy.id = :userId ORDER BY f.createdAt DESC")
    List<Food> findCustomFoodsByUserId(@Param("userId") Long userId);

    @Query("SELECT DISTINCT f.category FROM Food f WHERE f.category IS NOT NULL ORDER BY f.category ASC")
    List<String> findDistinctCategories();

    @Query("SELECT DISTINCT mi.food FROM MealItem mi WHERE mi.meal.user.id = :userId ORDER BY mi.meal.logDate DESC")
    List<Food> findRecentlyLoggedFoods(@Param("userId") Long userId);
}
