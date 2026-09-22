package com.fittrack.service;

import com.fittrack.dto.request.MealTemplateRequest;
import com.fittrack.dto.response.MealResponse;
import com.fittrack.dto.response.MealTemplateResponse;
import com.fittrack.dto.response.MealTemplateResponse.TemplateItemResponse;
import com.fittrack.entity.*;
import com.fittrack.exception.FitTrackException;
import com.fittrack.repository.FoodRepository;
import com.fittrack.repository.MealRepository;
import com.fittrack.repository.MealTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MealTemplateService {

    private final MealTemplateRepository templateRepository;
    private final FoodRepository foodRepository;
    private final MealRepository mealRepository;

    @Transactional(readOnly = true)
    public List<MealTemplateResponse> getTemplates(User user) {
        return templateRepository.findByUserIdWithItems(user.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public MealTemplateResponse createTemplate(User user, MealTemplateRequest req) {
        MealTemplate template = MealTemplate.builder()
                .user(user)
                .templateName(req.getTemplateName())
                .mealType(req.getMealType())
                .items(new ArrayList<>())
                .build();

        for (MealTemplateRequest.TemplateItemRequest itemReq : req.getItems()) {
            Food food = foodRepository.findById(itemReq.getFoodId())
                    .orElseThrow(() -> FitTrackException.notFound("Food with id " + itemReq.getFoodId()));

            MealTemplateItem item = MealTemplateItem.builder()
                    .template(template)
                    .food(food)
                    .quantity(itemReq.getQuantity())
                    .unit(itemReq.getUnit() != null ? itemReq.getUnit() : food.getServingSizeUnit())
                    .build();

            template.getItems().add(item);
        }

        return toResponse(templateRepository.save(template));
    }

    @Transactional
    public void deleteTemplate(User user, Long templateId) {
        MealTemplate template = templateRepository.findByIdAndUserIdWithItems(templateId, user.getId())
                .orElseThrow(() -> FitTrackException.notFound("Meal Template"));
        templateRepository.delete(template);
    }

    /** Applies a saved template to today's (or given date) actual meals */
    @Transactional
    public Meal applyTemplate(User user, Long templateId, LocalDate date) {
        MealTemplate template = templateRepository.findByIdAndUserIdWithItems(templateId, user.getId())
                .orElseThrow(() -> FitTrackException.notFound("Meal Template"));

        // Find or create meal for date & type
        Meal meal = mealRepository.findByUserIdAndLogDateAndMealType(user.getId(), date, template.getMealType())
                .orElseGet(() -> mealRepository.save(Meal.builder()
                        .user(user)
                        .logDate(date)
                        .mealType(template.getMealType())
                        .notes("From template: " + template.getTemplateName())
                        .items(new ArrayList<>())
                        .build()));

        for (MealTemplateItem templateItem : template.getItems()) {
            MealItem item = MealItem.builder()
                    .meal(meal)
                    .food(templateItem.getFood())
                    .quantity(templateItem.getQuantity())
                    .unit(templateItem.getUnit())
                    .build();
            item.computeNutrition();
            meal.getItems().add(item);
        }

        return mealRepository.save(meal);
    }

    private MealTemplateResponse toResponse(MealTemplate t) {
        BigDecimal cal = BigDecimal.ZERO, prot = BigDecimal.ZERO, carbs = BigDecimal.ZERO, fat = BigDecimal.ZERO;
        List<TemplateItemResponse> itemResponses = new ArrayList<>();

        for (MealTemplateItem item : t.getItems()) {
            Food f = item.getFood();
            BigDecimal q = item.getQuantity() != null ? item.getQuantity() : BigDecimal.ONE;

            // Compute approximate per item
            BigDecimal c = f.getCaloriesPerServing() != null ? f.getCaloriesPerServing().multiply(q) : BigDecimal.ZERO;
            BigDecimal p = f.getProteinG() != null ? f.getProteinG().multiply(q) : BigDecimal.ZERO;
            BigDecimal cb = f.getCarbsG() != null ? f.getCarbsG().multiply(q) : BigDecimal.ZERO;
            BigDecimal ft = f.getFatG() != null ? f.getFatG().multiply(q) : BigDecimal.ZERO;

            cal = cal.add(c);
            prot = prot.add(p);
            carbs = carbs.add(cb);
            fat = fat.add(ft);

            itemResponses.add(TemplateItemResponse.builder()
                    .id(item.getId())
                    .foodId(f.getId())
                    .foodName(f.getName())
                    .quantity(item.getQuantity())
                    .unit(item.getUnit())
                    .calories(c)
                    .protein(p)
                    .carbs(cb)
                    .fat(ft)
                    .build());
        }

        return MealTemplateResponse.builder()
                .id(t.getId())
                .templateName(t.getTemplateName())
                .mealType(t.getMealType())
                .items(itemResponses)
                .totalCalories(cal)
                .totalProtein(prot)
                .totalCarbs(carbs)
                .totalFat(fat)
                .build();
    }
}
