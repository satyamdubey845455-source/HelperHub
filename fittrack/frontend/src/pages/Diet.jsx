import React, { useState, useEffect } from 'react';
import { dietApi, foodApi, mealTemplateApi } from '../services/api';
import toast from 'react-hot-toast';
import {
  FiPieChart,
  FiPlus,
  FiTrash2,
  FiSearch,
  FiCalendar,
  FiCheck,
  FiX,
  FiStar,
  FiBookmark,
  FiFilter,
  FiInfo,
  FiAlertCircle,
} from 'react-icons/fi';

const MEAL_TYPES = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'];

const CATEGORIES = [
  'All',
  'Indian Food',
  'Breakfast',
  'Rice',
  'Roti / Bread',
  'Dal / Pulses',
  'Vegetables',
  'Fruits',
  'Dairy',
  'Paneer',
  'Eggs',
  'Chicken',
  'Fish',
  'Snacks',
  'Beverages',
  'Desserts',
  'Supplements',
];

export default function Diet() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [meals, setMeals] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Add food modal state
  const [activeMealId, setActiveMealId] = useState(null);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeFoodTab, setActiveFoodTab] = useState('all'); // 'all', 'indian', 'favorites', 'custom'
  const [searchResults, setSearchResults] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Custom Food Modal
  const [showCustomFoodModal, setShowCustomFoodModal] = useState(false);
  const [customFoodForm, setCustomFoodForm] = useState({
    name: '',
    category: 'Homemade Food',
    servingSize: 100,
    servingUnit: 'g',
    calories: 150,
    protein: 10,
    carbs: 15,
    fat: 5,
    fiber: 2,
    totalSugar: 1,
    addedSugar: 0,
    sodium: 120,
  });

  // Templates
  const [templates, setTemplates] = useState([]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateMealToSave, setTemplateMealToSave] = useState(null);

  const fetchDietData = async (date) => {
    setLoading(true);
    try {
      const [mealsRes, sumRes] = await Promise.all([
        dietApi.getMeals(date),
        dietApi.getDailySummary(date),
      ]);
      setMeals(mealsRes.data.data || []);
      setSummary(sumRes.data.data || null);
    } catch (err) {
      toast.error('Failed to load meal data');
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await mealTemplateApi.getAll();
      setTemplates(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDietData(selectedDate);
    fetchTemplates();
  }, [selectedDate]);

  // Search foods with category and tab filters
  useEffect(() => {
    if (!showSearchModal) return;
    const timer = setTimeout(async () => {
      try {
        let res;
        if (activeFoodTab === 'favorites') {
          res = await foodApi.getFavorites();
        } else if (activeFoodTab === 'custom') {
          res = await foodApi.getCustom();
        } else {
          const categoryFilter = activeFoodTab === 'indian' ? 'Indian Food' : (selectedCategory === 'All' ? null : selectedCategory);
          res = await foodApi.search(searchQuery, categoryFilter);
        }
        setSearchResults(res.data.data || []);
      } catch (err) {
        console.error(err);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, activeFoodTab, showSearchModal]);

  const handleCreateMeal = async (type) => {
    try {
      await dietApi.createMeal({
        mealType: type,
        logDate: selectedDate,
        notes: '',
      });
      toast.success(`${type} started!`);
      fetchDietData(selectedDate);
    } catch (err) {
      toast.error('Could not create meal');
    }
  };

  const handleOpenAddFood = (mealId) => {
    setActiveMealId(mealId);
    setSelectedFood(null);
    setQuantity(1);
    setSearchQuery('');
    setActiveFoodTab('all');
    setSelectedCategory('All');
    setShowSearchModal(true);
  };

  const handleAddItemToMeal = async () => {
    if (!selectedFood || !activeMealId) return;
    try {
      await dietApi.addItem(activeMealId, {
        foodId: selectedFood.id,
        quantity: Number(quantity),
        unit: selectedFood.servingUnit || 'serving',
      });
      toast.success(`Added ${selectedFood.name}`);
      setShowSearchModal(false);
      fetchDietData(selectedDate);
    } catch (err) {
      toast.error('Could not add food to meal');
    }
  };

  const handleDeleteItem = async (mealId, itemId) => {
    try {
      await dietApi.deleteItem(mealId, itemId);
      toast.success('Food removed');
      fetchDietData(selectedDate);
    } catch (err) {
      toast.error('Could not delete item');
    }
  };

  const handleDeleteMeal = async (mealId) => {
    if (!window.confirm('Delete this meal and all its foods?')) return;
    try {
      await dietApi.deleteMeal(mealId);
      toast.success('Meal deleted');
      fetchDietData(selectedDate);
    } catch (err) {
      toast.error('Could not delete meal');
    }
  };

  const handleToggleFavorite = async (e, foodId) => {
    e.stopPropagation();
    try {
      const res = await foodApi.toggleFavorite(foodId);
      toast.success(res.data.data?.isFavorite ? 'Added to favorites ⭐' : 'Removed from favorites');
      // Update local item
      setSearchResults((prev) =>
        prev.map((f) => (f.id === foodId ? { ...f, isFavorite: res.data.data?.isFavorite } : f))
      );
    } catch (err) {
      toast.error('Could not toggle favorite');
    }
  };

  const handleCreateCustomFood = async (e) => {
    e.preventDefault();
    try {
      await foodApi.createCustom(customFoodForm);
      toast.success('Custom food created successfully! 🥗');
      setShowCustomFoodModal(false);
      setActiveFoodTab('custom');
      const res = await foodApi.getCustom();
      setSearchResults(res.data.data || []);
    } catch (err) {
      toast.error('Failed to create custom food');
    }
  };

  const handleOpenSaveTemplate = (meal) => {
    setTemplateMealToSave(meal);
    setTemplateName(`${meal.mealType.charAt(0) + meal.mealType.slice(1).toLowerCase()} Preset`);
    setShowTemplateModal(true);
  };

  const handleSaveMealTemplate = async (e) => {
    e.preventDefault();
    if (!templateMealToSave || !templateMealToSave.items?.length) {
      toast.error('Add foods to this meal first before saving as template');
      return;
    }
    try {
      const items = templateMealToSave.items.map((it) => ({
        foodId: it.foodId,
        quantity: it.quantity,
        unit: it.unit,
      }));
      await mealTemplateApi.create({
        name: templateName,
        mealType: templateMealToSave.mealType,
        items,
      });
      toast.success(`Template "${templateName}" saved! 📋`);
      setShowTemplateModal(false);
      fetchTemplates();
    } catch (err) {
      toast.error('Could not save template');
    }
  };

  const handleApplyTemplate = async (templateId) => {
    try {
      await mealTemplateApi.apply(templateId, selectedDate);
      toast.success('Template applied to today! ⚡');
      fetchDietData(selectedDate);
    } catch (err) {
      toast.error('Could not apply meal template');
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    try {
      await mealTemplateApi.delete(templateId);
      toast.success('Template removed');
      fetchTemplates();
    } catch (err) {
      toast.error('Could not delete template');
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div style={dietStyles.headerRow}>
        <div>
          <div style={dietStyles.subTitle}>NUTRITION & MACROS</div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Diet & Food Diary</h1>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {templates.length > 0 && (
            <div style={{ position: 'relative' }}>
              <select
                onChange={(e) => {
                  if (e.target.value) handleApplyTemplate(e.target.value);
                  e.target.value = '';
                }}
                className="form-select"
                style={{ background: 'rgba(99, 102, 241, 0.15)', borderColor: '#6366f1', color: '#fff', fontSize: '0.85rem' }}
                defaultValue=""
              >
                <option value="" disabled>📋 Apply Template...</option>
                {templates.map((tpl) => (
                  <option key={tpl.id} value={tpl.id} style={{ background: '#0f172a' }}>
                    {tpl.name} ({tpl.items?.length || 0} foods)
                  </option>
                ))}
              </select>
            </div>
          )}

          <div style={dietStyles.datePickerContainer}>
            <FiCalendar style={{ color: '#818cf8', fontSize: '18px' }} />
            <input
              type="date"
              className="form-input"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ width: 'auto', padding: '8px 12px', cursor: 'pointer' }}
            />
          </div>
        </div>
      </div>

      {/* Daily Nutrition Macro Summary Bar with Added Sugar */}
      <div className="glass-panel" style={dietStyles.summaryBar}>
        <div style={dietStyles.macroBlock}>
          <span style={dietStyles.macroNum}>{summary?.totalCalories || 0}</span>
          <span style={dietStyles.macroUnit}>kcal</span>
          <span style={dietStyles.macroName}>Calories</span>
        </div>
        <div style={dietStyles.divider} />
        <div style={dietStyles.macroBlock}>
          <span style={{ ...dietStyles.macroNum, color: '#818cf8' }}>
            {summary?.totalProtein ? Number(summary.totalProtein).toFixed(1) : 0}g
          </span>
          <span style={dietStyles.macroName}>Protein</span>
        </div>
        <div style={dietStyles.divider} />
        <div style={dietStyles.macroBlock}>
          <span style={{ ...dietStyles.macroNum, color: '#38bdf8' }}>
            {summary?.totalCarbs ? Number(summary.totalCarbs).toFixed(1) : 0}g
          </span>
          <span style={dietStyles.macroName}>Carbs</span>
        </div>
        <div style={dietStyles.divider} />
        <div style={dietStyles.macroBlock}>
          <span style={{ ...dietStyles.macroNum, color: '#fb923c' }}>
            {summary?.totalFat ? Number(summary.totalFat).toFixed(1) : 0}g
          </span>
          <span style={dietStyles.macroName}>Fat</span>
        </div>
        <div style={dietStyles.divider} />
        <div style={dietStyles.macroBlock}>
          <span style={{ ...dietStyles.macroNum, color: '#34d399' }}>
            {summary?.totalFiber ? Number(summary.totalFiber).toFixed(1) : 0}g
          </span>
          <span style={dietStyles.macroName}>Fiber</span>
        </div>
        <div style={dietStyles.divider} />
        <div style={dietStyles.macroBlock}>
          <span style={{ ...dietStyles.macroNum, color: summary?.totalAddedSugar > 25 ? '#ef4444' : '#f59e0b' }}>
            {summary?.totalAddedSugar ? Number(summary.totalAddedSugar).toFixed(1) : 0}g
          </span>
          <span style={dietStyles.macroName}>
            Added Sugar {summary?.totalAddedSugar > 25 && '⚠️'}
          </span>
        </div>
      </div>

      {/* Meals Grid */}
      <div style={dietStyles.mealsGrid}>
        {MEAL_TYPES.map((type) => {
          const typeMeal = meals.find((m) => m.mealType === type);

          return (
            <div key={type} className="glass-panel" style={dietStyles.mealCard}>
              <div style={dietStyles.mealCardHeader}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', color: '#fff' }}>
                    {type.charAt(0) + type.slice(1).toLowerCase()}
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    {typeMeal ? `${typeMeal.totalCalories || 0} kcal` : 'Not logged'}
                  </span>
                </div>

                {typeMeal ? (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleOpenAddFood(typeMeal.id)}
                      className="btn btn-primary btn-sm"
                    >
                      <FiPlus /> Add Food
                    </button>
                    {typeMeal.items?.length > 0 && (
                      <button
                        onClick={() => handleOpenSaveTemplate(typeMeal)}
                        className="btn btn-secondary btn-sm"
                        title="Save as Meal Template"
                      >
                        <FiBookmark size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteMeal(typeMeal.id)}
                      className="btn btn-danger btn-sm"
                      title="Delete Meal"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleCreateMeal(type)}
                    className="btn btn-secondary btn-sm"
                  >
                    <FiPlus /> Start Meal
                  </button>
                )}
              </div>

              {/* Items in this meal */}
              <div style={dietStyles.itemsList}>
                {typeMeal?.items && typeMeal.items.length > 0 ? (
                  typeMeal.items.map((item) => (
                    <div key={item.id} style={dietStyles.itemRow}>
                      <div>
                        <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.92rem' }}>
                          {item.foodName}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                          {item.quantity} {item.unit || 'serving'} • {item.calories} kcal • P: {item.protein}g | C: {item.carbs}g | F: {item.fat}g
                          {item.addedSugarConsumed > 0 && (
                            <span style={{ color: '#f59e0b', marginLeft: '6px' }}>
                              (Added Sugar: {item.addedSugarConsumed.toFixed(1)}g)
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteItem(typeMeal.id, item.id)}
                        style={dietStyles.removeFoodBtn}
                        title="Remove food"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div style={dietStyles.emptyMealNote}>
                    {typeMeal ? 'No foods added yet. Click "+ Add Food".' : 'No items.'}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Food Modal with Categories & Favorites */}
      {showSearchModal && (
        <div style={dietStyles.modalOverlay}>
          <div className="glass-panel" style={dietStyles.modalContent}>
            <div style={dietStyles.modalHeader}>
              <div>
                <h2 style={{ fontSize: '1.3rem', color: '#fff' }}>Add Food to Meal</h2>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  Choose from built-in Indian database, favorites, or create your own
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  onClick={() => setShowCustomFoodModal(true)}
                  className="btn btn-secondary btn-sm"
                >
                  <FiPlus /> New Custom Food
                </button>
                <button
                  onClick={() => setShowSearchModal(false)}
                  style={dietStyles.closeBtn}
                >
                  <FiX size={20} />
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div style={dietStyles.modalTabs}>
              <button
                onClick={() => { setActiveFoodTab('all'); setSelectedCategory('All'); }}
                style={{ ...dietStyles.tabBtn, ...(activeFoodTab === 'all' && selectedCategory === 'All' ? dietStyles.tabBtnActive : {}) }}
              >
                All Foods
              </button>
              <button
                onClick={() => { setActiveFoodTab('indian'); }}
                style={{ ...dietStyles.tabBtn, ...(activeFoodTab === 'indian' ? dietStyles.tabBtnActive : {}) }}
              >
                🇮🇳 Indian Foods
              </button>
              <button
                onClick={() => { setActiveFoodTab('favorites'); }}
                style={{ ...dietStyles.tabBtn, ...(activeFoodTab === 'favorites' ? dietStyles.tabBtnActive : {}) }}
              >
                ⭐ Favorites
              </button>
              <button
                onClick={() => { setActiveFoodTab('custom'); }}
                style={{ ...dietStyles.tabBtn, ...(activeFoodTab === 'custom' ? dietStyles.tabBtnActive : {}) }}
              >
                🥗 My Custom Foods
              </button>
            </div>

            {/* Search Input & Category Bar */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ ...dietStyles.searchBox, flex: 1 }}>
                <FiSearch style={{ color: '#64748b', fontSize: '18px' }} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search by food name (e.g. Paneer, Dal Makhni, Oats)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>
              {activeFoodTab === 'all' && (
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="form-select"
                  style={{ width: '160px' }}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Food Results List */}
            <div style={dietStyles.resultsContainer}>
              {searchResults.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                  No foods match your search. You can click "+ New Custom Food" to add your own recipe!
                </div>
              ) : (
                searchResults.map((food) => (
                  <div
                    key={food.id}
                    onClick={() => setSelectedFood(food)}
                    style={{
                      ...dietStyles.foodResultItem,
                      ...(selectedFood?.id === food.id ? dietStyles.selectedFoodItem : {}),
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.98rem' }}>{food.name}</span>
                        {food.category && (
                          <span style={dietStyles.categoryBadge}>{food.category}</span>
                        )}
                        {food.isCustom && (
                          <span style={{ ...dietStyles.categoryBadge, background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8' }}>Custom</span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px' }}>
                        Per {food.servingSize} {food.servingUnit} • <span style={{ color: '#fff', fontWeight: 600 }}>{food.calories} kcal</span> • P: {food.protein}g | C: {food.carbs}g | F: {food.fat}g | Fiber: {food.fiber}g
                        {food.addedSugar > 0 && (
                          <span style={{ color: '#f59e0b', marginLeft: '6px' }}>
                            • Added Sugar: {food.addedSugar}g
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleToggleFavorite(e, food.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '6px',
                        color: food.isFavorite ? '#fbbf24' : '#64748b',
                      }}
                      title="Favorite Food"
                    >
                      <FiStar size={18} fill={food.isFavorite ? '#fbbf24' : 'none'} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Selected Food & Quantity Controls */}
            {selectedFood && (
              <div style={dietStyles.quantityBar}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Selected: </span>
                  <strong style={{ color: '#818cf8' }}>{selectedFood.name}</strong>
                  <span style={{ fontSize: '0.8rem', color: '#cbd5e1', marginLeft: '6px' }}>
                    ({selectedFood.servingSize} {selectedFood.servingUnit} base)
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <label style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Portion Multiplier:</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    className="form-input"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    style={{ width: '80px', textAlign: 'center' }}
                  />
                  <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                    {selectedFood.servingUnit || 'serving'}
                  </span>

                  <button
                    onClick={handleAddItemToMeal}
                    className="btn btn-primary"
                    style={{ padding: '8px 20px' }}
                  >
                    <FiCheck /> Add to Meal
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Custom Food Modal */}
      {showCustomFoodModal && (
        <div style={dietStyles.modalOverlay}>
          <div className="glass-panel" style={{ ...dietStyles.modalContent, maxWidth: '640px' }}>
            <div style={dietStyles.modalHeader}>
              <div>
                <h2 style={{ fontSize: '1.3rem', color: '#fff' }}>Create Custom Food</h2>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  Private to your account. Stored with full nutritional metrics.
                </p>
              </div>
              <button
                onClick={() => setShowCustomFoodModal(false)}
                style={dietStyles.closeBtn}
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateCustomFood} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Food Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Homemade Paneer Bhurji"
                    value={customFoodForm.name}
                    onChange={(e) => setCustomFoodForm({ ...customFoodForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={customFoodForm.category}
                    onChange={(e) => setCustomFoodForm({ ...customFoodForm, category: e.target.value })}
                  >
                    {CATEGORIES.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Serving Size</label>
                  <input
                    type="number"
                    step="1"
                    className="form-input"
                    value={customFoodForm.servingSize}
                    onChange={(e) => setCustomFoodForm({ ...customFoodForm, servingSize: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Serving Unit</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="g, ml, piece, serving"
                    value={customFoodForm.servingUnit}
                    onChange={(e) => setCustomFoodForm({ ...customFoodForm, servingUnit: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Calories (kcal)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    value={customFoodForm.calories}
                    onChange={(e) => setCustomFoodForm({ ...customFoodForm, calories: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Protein (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    value={customFoodForm.protein}
                    onChange={(e) => setCustomFoodForm({ ...customFoodForm, protein: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Carbs (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    value={customFoodForm.carbs}
                    onChange={(e) => setCustomFoodForm({ ...customFoodForm, carbs: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Fat (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    value={customFoodForm.fat}
                    onChange={(e) => setCustomFoodForm({ ...customFoodForm, fat: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Fiber (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    value={customFoodForm.fiber}
                    onChange={(e) => setCustomFoodForm({ ...customFoodForm, fiber: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Total Sugar (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    value={customFoodForm.totalSugar}
                    onChange={(e) => setCustomFoodForm({ ...customFoodForm, totalSugar: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Added Sugar (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    value={customFoodForm.addedSugar}
                    onChange={(e) => setCustomFoodForm({ ...customFoodForm, addedSugar: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Sodium (mg)</label>
                  <input
                    type="number"
                    step="1"
                    className="form-input"
                    value={customFoodForm.sodium}
                    onChange={(e) => setCustomFoodForm({ ...customFoodForm, sodium: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowCustomFoodModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  <FiCheck /> Save Custom Food
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Save Template Modal */}
      {showTemplateModal && (
        <div style={dietStyles.modalOverlay}>
          <div className="glass-panel" style={{ ...dietStyles.modalContent, maxWidth: '480px' }}>
            <div style={dietStyles.modalHeader}>
              <h2 style={{ fontSize: '1.2rem', color: '#fff' }}>Save Meal Template</h2>
              <button
                onClick={() => setShowTemplateModal(false)}
                style={dietStyles.closeBtn}
              >
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveMealTemplate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Template Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. My High Protein Breakfast"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  required
                />
              </div>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                Saves all {templateMealToSave?.items?.length || 0} items from this meal. You can re-log this entire meal anytime with 1 click!
              </p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowTemplateModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  <FiBookmark /> Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const dietStyles = {
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
  },
  subTitle: {
    fontSize: '0.78rem',
    fontWeight: '700',
    letterSpacing: '0.12em',
    color: '#818cf8',
    marginBottom: '4px',
  },
  datePickerContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'rgba(255, 255, 255, 0.04)',
    padding: '4px 12px',
    borderRadius: '10px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  },
  summaryBar: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: '20px 24px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  macroBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  macroNum: {
    fontSize: '1.6rem',
    fontWeight: '800',
    color: '#ffffff',
  },
  macroUnit: {
    fontSize: '0.72rem',
    color: '#64748b',
    fontWeight: '600',
  },
  macroName: {
    fontSize: '0.8rem',
    color: '#94a3b8',
    marginTop: '2px',
    fontWeight: '500',
  },
  divider: {
    width: '1px',
    height: '40px',
    background: 'rgba(255, 255, 255, 0.08)',
  },
  mealsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
    gap: '20px',
  },
  mealCard: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  mealCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    paddingBottom: '14px',
  },
  itemsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  itemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(255, 255, 255, 0.02)',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.04)',
  },
  removeFoodBtn: {
    background: 'transparent',
    border: 'none',
    color: '#ef4444',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyMealNote: {
    fontSize: '0.85rem',
    color: '#64748b',
    textAlign: 'center',
    padding: '16px 0',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.75)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modalContent: {
    width: '100%',
    maxWidth: '720px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '28px',
    overflowY: 'auto',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTabs: {
    display: 'flex',
    gap: '8px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    paddingBottom: '10px',
    overflowX: 'auto',
  },
  tabBtn: {
    background: 'transparent',
    border: 'none',
    color: '#94a3b8',
    padding: '6px 14px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.84rem',
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  tabBtnActive: {
    background: 'rgba(99, 102, 241, 0.2)',
    color: '#fff',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    padding: '0 12px',
  },
  resultsContainer: {
    maxHeight: '320px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  foodResultItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderRadius: '8px',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  selectedFoodItem: {
    background: 'rgba(99, 102, 241, 0.15)',
    borderColor: '#6366f1',
  },
  categoryBadge: {
    fontSize: '0.68rem',
    fontWeight: 600,
    padding: '2px 8px',
    borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.08)',
    color: '#94a3b8',
  },
  quantityBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 18px',
    background: 'rgba(99, 102, 241, 0.08)',
    border: '1px solid rgba(99, 102, 241, 0.2)',
    borderRadius: '10px',
    marginTop: '6px',
    flexWrap: 'wrap',
    gap: '12px',
  },
};
