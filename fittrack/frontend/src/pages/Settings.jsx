import React, { useState, useEffect } from 'react';
import { profileApi, exportApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  FiUser,
  FiSliders,
  FiSave,
  FiRefreshCw,
  FiCheckCircle,
  FiDownload,
  FiShield,
  FiFileText,
  FiGlobe,
} from 'react-icons/fi';

const TIMEZONES = [
  'Asia/Kolkata',
  'UTC',
  'America/New_York',
  'America/Los_Angeles',
  'America/Chicago',
  'Europe/London',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Dubai',
  'Australia/Sydney',
];

export default function Settings() {
  const { user, profile, updateProfileState, fetchProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Profile Form
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    age: 25,
    gender: 'MALE',
    heightCm: 175,
    weightKg: 75,
    activityLevel: 'MODERATELY_ACTIVE',
    fitnessGoal: 'MUSCLE_GAIN',
    workoutFrequency: 4,
    preferredWorkoutTime: 'EVENING',
    dietaryPreference: 'NON_VEGETARIAN',
    timezone: 'Asia/Kolkata',
  });

  // Target Overrides Form
  const [targetForm, setTargetForm] = useState({
    dailyCalorieTarget: 2500,
    dailyProteinTarget: 160,
    dailyCarbTarget: 280,
    dailyFatTarget: 70,
    dailyFiberTarget: 35,
    dailyWaterTargetMl: 3000,
    dailySleepTargetHours: 8.0,
    dailyAddedSugarTarget: 25.0,
  });

  useEffect(() => {
    if (profile || user) {
      setProfileForm({
        fullName: profile?.fullName || user?.fullName || '',
        age: profile?.age || 25,
        gender: profile?.gender || 'MALE',
        heightCm: profile?.heightCm || 175,
        weightKg: profile?.weightKg || 75,
        activityLevel: profile?.activityLevel || 'MODERATELY_ACTIVE',
        fitnessGoal: profile?.fitnessGoal || 'MUSCLE_GAIN',
        workoutFrequency: profile?.workoutFrequency || 4,
        preferredWorkoutTime: profile?.preferredWorkoutTime || 'EVENING',
        dietaryPreference: profile?.dietaryPreference || 'NON_VEGETARIAN',
        timezone: profile?.timezone || 'Asia/Kolkata',
      });

      if (profile) {
        setTargetForm({
          dailyCalorieTarget: profile.dailyCalorieTarget || 2200,
          dailyProteinTarget: profile.dailyProteinTarget || 140,
          dailyCarbTarget: profile.dailyCarbTarget || 250,
          dailyFatTarget: profile.dailyFatTarget || 65,
          dailyFiberTarget: profile.dailyFiberTarget || 30,
          dailyWaterTargetMl: profile.waterTargetMl || 2500,
          dailySleepTargetHours: profile.sleepTargetHours || 8.0,
          dailyAddedSugarTarget: profile.dailyAddedSugarTarget || 25.0,
        });
      }
    }
  }, [profile, user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await profileApi.update({
        ...profileForm,
        age: Number(profileForm.age),
        heightCm: Number(profileForm.heightCm),
        weightKg: Number(profileForm.weightKg),
        workoutFrequency: Number(profileForm.workoutFrequency),
      });
      updateProfileState(res.data.data);
      toast.success('Physical profile & metrics updated! ✨');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save profile');
    } finally {
      setLoading(false);
    }
  };

  const handleTargetsSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await profileApi.overrideTargets({
        dailyCalorieTarget: Number(targetForm.dailyCalorieTarget),
        dailyProteinTarget: Number(targetForm.dailyProteinTarget),
        dailyCarbTarget: Number(targetForm.dailyCarbTarget),
        dailyFatTarget: Number(targetForm.dailyFatTarget),
        dailyFiberTarget: Number(targetForm.dailyFiberTarget),
        dailyWaterTargetMl: Number(targetForm.dailyWaterTargetMl),
        dailySleepTargetHours: Number(targetForm.dailySleepTargetHours),
        dailyAddedSugarTarget: Number(targetForm.dailyAddedSugarTarget),
      });
      updateProfileState(res.data.data);
      toast.success('Daily targets & added sugar limit saved! 🎯');
    } catch (err) {
      toast.error('Could not save target overrides');
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculate = async () => {
    setLoading(true);
    try {
      const res = await profileApi.recalculateTargets();
      updateProfileState(res.data.data);
      toast.success('Targets auto-recalculated based on your metrics and goal!');
    } catch (err) {
      toast.error('Could not recalculate targets');
    } finally {
      setLoading(false);
    }
  };

  const handleExportJson = async () => {
    setExporting(true);
    try {
      await exportApi.downloadJson();
      toast.success('JSON export downloaded! 📦');
    } catch (err) {
      toast.error('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      await exportApi.downloadCsv();
      toast.success('CSV records downloaded! 📊');
    } catch (err) {
      toast.error('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div>
        <div style={settStyles.subTitle}>CONFIGURATION & TARGETS</div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Profile & Settings</h1>
      </div>

      {/* Tabs */}
      <div style={settStyles.tabRow}>
        <button
          onClick={() => setActiveTab('profile')}
          style={{
            ...settStyles.tabBtn,
            ...(activeTab === 'profile' ? settStyles.tabBtnActive : {}),
          }}
        >
          <FiUser /> Physical Profile & Metabolic Rate
        </button>
        <button
          onClick={() => setActiveTab('targets')}
          style={{
            ...settStyles.tabBtn,
            ...(activeTab === 'targets' ? settStyles.tabBtnActive : {}),
          }}
        >
          <FiSliders /> Daily Macro & Sugar Targets
        </button>
        <button
          onClick={() => setActiveTab('privacy')}
          style={{
            ...settStyles.tabBtn,
            ...(activeTab === 'privacy' ? settStyles.tabBtnActive : {}),
          }}
        >
          <FiShield /> Privacy & Data Export
        </button>
      </div>

      {/* Tab 1: Profile */}
      {activeTab === 'profile' && (
        <div style={settStyles.grid}>
          <div className="glass-panel" style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '6px' }}>
              Body Metrics & Lifestyle
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '24px' }}>
              Used to calculate Basal Metabolic Rate (BMR) and Total Daily Energy Expenditure (TDEE).
            </p>

            <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Your full name"
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Age</label>
                  <input
                    type="number"
                    className="form-input"
                    value={profileForm.age}
                    onChange={(e) => setProfileForm({ ...profileForm, age: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select
                    className="form-select"
                    value={profileForm.gender}
                    onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Height (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    className="form-input"
                    value={profileForm.heightCm}
                    onChange={(e) => setProfileForm({ ...profileForm, heightCm: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    className="form-input"
                    value={profileForm.weightKg}
                    onChange={(e) => setProfileForm({ ...profileForm, weightKg: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Activity Level</label>
                  <select
                    className="form-select"
                    value={profileForm.activityLevel}
                    onChange={(e) => setProfileForm({ ...profileForm, activityLevel: e.target.value })}
                  >
                    <option value="SEDENTARY">Sedentary (desk job, little exercise)</option>
                    <option value="LIGHTLY_ACTIVE">Lightly Active (1-3 days/week)</option>
                    <option value="MODERATELY_ACTIVE">Moderately Active (3-5 days/week)</option>
                    <option value="VERY_ACTIVE">Very Active (6-7 days/week)</option>
                    <option value="EXTRA_ACTIVE">Extra Active (intense workouts/athlete)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Primary Fitness Goal</label>
                  <select
                    className="form-select"
                    value={profileForm.fitnessGoal}
                    onChange={(e) => setProfileForm({ ...profileForm, fitnessGoal: e.target.value })}
                  >
                    <option value="MUSCLE_GAIN">Build Muscle (Hypertrophy)</option>
                    <option value="FAT_LOSS">Lose Fat / Cut</option>
                    <option value="MAINTENANCE">Maintain Weight & Recomp</option>
                    <option value="STRENGTH">Strength & Power</option>
                    <option value="GENERAL_FITNESS">General Health & Fitness</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Workouts / Week</label>
                  <input
                    type="number"
                    min="0"
                    max="7"
                    className="form-input"
                    value={profileForm.workoutFrequency}
                    onChange={(e) => setProfileForm({ ...profileForm, workoutFrequency: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Preferred Time</label>
                  <select
                    className="form-select"
                    value={profileForm.preferredWorkoutTime}
                    onChange={(e) => setProfileForm({ ...profileForm, preferredWorkoutTime: e.target.value })}
                  >
                    <option value="MORNING">Morning</option>
                    <option value="AFTERNOON">Afternoon</option>
                    <option value="EVENING">Evening</option>
                    <option value="NIGHT">Night</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Dietary Type</label>
                  <select
                    className="form-select"
                    value={profileForm.dietaryPreference}
                    onChange={(e) => setProfileForm({ ...profileForm, dietaryPreference: e.target.value })}
                  >
                    <option value="NON_VEGETARIAN">Non-Vegetarian</option>
                    <option value="VEGETARIAN">Vegetarian</option>
                    <option value="EGGETARIAN">Eggetarian</option>
                    <option value="VEGAN">Vegan</option>
                    <option value="KETO">Keto</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <FiGlobe style={{ marginRight: '6px' }} /> User Timezone
                </label>
                <select
                  className="form-select"
                  value={profileForm.timezone}
                  onChange={(e) => setProfileForm({ ...profileForm, timezone: e.target.value })}
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ alignSelf: 'flex-start', marginTop: '12px' }}
                disabled={loading}
              >
                <FiSave /> Save Profile & Recalculate
              </button>
            </form>
          </div>

          {/* Metabolic Summary Side Card */}
          <div className="glass-panel" style={{ padding: '32px', height: 'fit-content' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '16px' }}>
              Metabolic Architecture
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={settStyles.metricRow}>
                <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Basal Metabolic Rate (BMR)</span>
                <span style={{ fontWeight: 700, color: '#fff', fontSize: '1.2rem' }}>
                  {profile?.bmr ? `${profile.bmr} kcal` : '--'}
                </span>
              </div>
              <div style={settStyles.metricRow}>
                <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>TDEE (Daily Burn)</span>
                <span style={{ fontWeight: 700, color: '#6366f1', fontSize: '1.2rem' }}>
                  {profile?.tdee ? `${profile.tdee} kcal` : '--'}
                </span>
              </div>
              <div style={settStyles.metricRow}>
                <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Calorie Target</span>
                <span style={{ fontWeight: 700, color: '#10b981', fontSize: '1.2rem' }}>
                  {profile?.dailyCalorieTarget ? `${profile.dailyCalorieTarget} kcal` : '--'}
                </span>
              </div>
              <div style={settStyles.metricRow}>
                <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Target Protein</span>
                <span style={{ fontWeight: 700, color: '#38bdf8', fontSize: '1.2rem' }}>
                  {profile?.dailyProteinTarget ? `${profile.dailyProteinTarget}g` : '--'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Target Overrides */}
      {activeTab === 'targets' && (
        <div className="glass-panel" style={{ padding: '32px', maxWidth: '800px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '1.3rem', color: '#fff' }}>Custom Target Overrides</h2>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>
                Set custom nutrition, hydration, added sugar, and sleep targets manually.
              </p>
            </div>
            <button
              type="button"
              onClick={handleRecalculate}
              className="btn btn-secondary btn-sm"
            >
              <FiRefreshCw /> Auto-Calculate
            </button>
          </div>

          <form onSubmit={handleTargetsSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Daily Calories (kcal)</label>
                <input
                  type="number"
                  className="form-input"
                  value={targetForm.dailyCalorieTarget}
                  onChange={(e) => setTargetForm({ ...targetForm, dailyCalorieTarget: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Daily Protein (g)</label>
                <input
                  type="number"
                  step="0.5"
                  className="form-input"
                  value={targetForm.dailyProteinTarget}
                  onChange={(e) => setTargetForm({ ...targetForm, dailyProteinTarget: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Daily Carbs (g)</label>
                <input
                  type="number"
                  step="0.5"
                  className="form-input"
                  value={targetForm.dailyCarbTarget}
                  onChange={(e) => setTargetForm({ ...targetForm, dailyCarbTarget: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Daily Fat (g)</label>
                <input
                  type="number"
                  step="0.5"
                  className="form-input"
                  value={targetForm.dailyFatTarget}
                  onChange={(e) => setTargetForm({ ...targetForm, dailyFatTarget: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Daily Fiber (g)</label>
                <input
                  type="number"
                  step="0.5"
                  className="form-input"
                  value={targetForm.dailyFiberTarget}
                  onChange={(e) => setTargetForm({ ...targetForm, dailyFiberTarget: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Daily Hydration Target (ml)</label>
                <input
                  type="number"
                  className="form-input"
                  value={targetForm.dailyWaterTargetMl}
                  onChange={(e) => setTargetForm({ ...targetForm, dailyWaterTargetMl: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Daily Sleep Target (Hours)</label>
                <input
                  type="number"
                  step="0.5"
                  className="form-input"
                  value={targetForm.dailySleepTargetHours}
                  onChange={(e) => setTargetForm({ ...targetForm, dailySleepTargetHours: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: '#f59e0b' }}>
                  Daily Added Sugar Limit (g)
                </label>
                <input
                  type="number"
                  step="0.5"
                  className="form-input"
                  value={targetForm.dailyAddedSugarTarget}
                  onChange={(e) => setTargetForm({ ...targetForm, dailyAddedSugarTarget: e.target.value })}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ alignSelf: 'flex-start', marginTop: '16px' }}
              disabled={loading}
            >
              <FiCheckCircle /> Save Custom Targets
            </button>
          </form>
        </div>
      )}

      {/* Tab 3: Privacy & Data Export */}
      {activeTab === 'privacy' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px' }}>
          <div className="glass-panel" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
              <FiShield size={24} style={{ color: '#10b981' }} />
              <h2 style={{ fontSize: '1.3rem', color: '#fff' }}>User Data Isolation & Ownership</h2>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: '1.6' }}>
              FitTrack guarantees strict, authenticated isolation for every user. Your nutrition logs,
              workout sessions, personal records, body measurements, sleep data, and custom foods are
              completely private and inaccessible to any other user.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '32px' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '8px' }}>
              Export Your Personal Data
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '24px' }}>
              Download a complete archive of your health and fitness history.
            </p>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <button
                onClick={handleExportJson}
                disabled={exporting}
                className="btn btn-primary btn-lg"
              >
                <FiDownload /> Export Everything (JSON)
              </button>

              <button
                onClick={handleExportCsv}
                disabled={exporting}
                className="btn btn-secondary btn-lg"
              >
                <FiFileText /> Export Records (CSV)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const settStyles = {
  subTitle: {
    fontSize: '0.78rem',
    fontWeight: '700',
    letterSpacing: '0.12em',
    color: '#818cf8',
    marginBottom: '4px',
  },
  tabRow: {
    display: 'flex',
    gap: '12px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    paddingBottom: '12px',
    flexWrap: 'wrap',
  },
  tabBtn: {
    background: 'transparent',
    border: 'none',
    color: '#94a3b8',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.92rem',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s',
  },
  tabBtnActive: {
    background: 'rgba(99, 102, 241, 0.15)',
    color: '#fff',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '24px',
  },
  metricRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 14px',
    background: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.04)',
  },
};
