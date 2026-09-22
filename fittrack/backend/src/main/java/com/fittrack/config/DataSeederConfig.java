package com.fittrack.config;

import com.fittrack.repository.ExerciseRepository;
import com.fittrack.repository.FoodRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;

import javax.sql.DataSource;

/**
 * Runs seed_data.sql at application startup if the foods/exercises tables are empty.
 * Uses INSERT IGNORE so re-runs are safe.
 */
@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataSeederConfig {

    private final DataSource dataSource;
    private final FoodRepository foodRepository;
    private final ExerciseRepository exerciseRepository;

    @PostConstruct
    public void seedData() {
        boolean foodsEmpty    = foodRepository.count() == 0;
        boolean exercisesEmpty = exerciseRepository.count() == 0;

        if (foodsEmpty || exercisesEmpty) {
            log.info("Seeding initial food and exercise data...");
            try {
                ResourceDatabasePopulator populator = new ResourceDatabasePopulator();
                populator.addScript(new ClassPathResource("db/seed_data.sql"));
                populator.setSqlScriptEncoding("UTF-8");
                populator.setContinueOnError(true);
                populator.populate(dataSource.getConnection());
                log.info("Seed data loaded successfully.");
            } catch (Exception e) {
                log.warn("Seed data loading failed (may already be seeded): {}", e.getMessage());
            }
        } else {
            log.info("Database already seeded — skipping.");
        }
    }
}
