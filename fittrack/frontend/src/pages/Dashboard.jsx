import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardApi, waterApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  FiZap,
  FiDroplet,
  FiActivity,
  FiMoon,
  FiPlus,
  FiCheckCircle,
  FiCalendar,
  FiArrowUpRight,
  FiAlertTriangle,
  FiInfo,
  FiCompass,
  FiTarget,
} from 'react-icons/fi';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async (date) => {
    setLoading(true);
    try {
      const res = await dashboardApi.get(date);
      setData(res.data.data);
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard(selectedDate);
  }, [selectedDate]);

  const handleQuickWater = async (amount) => {
    try {
      await waterApi.log({ amountMl: amount, logDate: selectedDate });
      toast.success(`+${amount}ml water logged! 💧`);
      fetchDashboard(selectedDate);
    } catch (err) {
      toast.error('Could not log water');
    }
  };

  // Safe numbers
  const calories = Number(data?.totalCalories || 0);
  const calTarget = Number(data?.calorieTarget || 2000);
  const calPercent = Math.min(100, Math.round((calories / (calTarget || 1)) * 100));

  const protein = Number(data?.totalProtein || 0);
  const protTarget = Number(data?.proteinTarget || 140);
  const protPercent = Math.min(100, Math.round((protein / (protTarget || 1)) * 100));

  const carbs = Number(data?.totalCarbs || 0);
  const carbTarget = Number(data?.carbTarget || 250);

  const fat = Number(data?.totalFat || 0);
  const fatTarget = Number(data?.fatTarget || 65);

  const fiber = Number(data?.totalFiber || 0);
  const addedSugar = Number(data?.totalAddedSugar || 0);
  const sugarTarget = Number(data?.addedSugarTarget || 25);
  const sugarPercent = Math.min(100, Math.round((addedSugar / (sugarTarget || 1)) * 100));

  const waterMl = Number(data?.totalWaterMl || 0);
  const waterTarget = Number(data?.waterTargetMl || 2500);
  const waterPercent = Math.min(100, Math.round((waterMl / (waterTarget || 1)) * 100));

  const sleepHours = Number(data?.sleepHours || 0);
  const sleepTarget = Number(data?.sleepTarget || 8);

  const nutritionChartData = (data?.weeklyNutrition || []).map((item) => ({
    day: item.date?.slice(5),
    calories: item.calories || 0,
    protein: item.protein || 0,
    addedSugar: item.addedSugar || 0,
  }));

  const waterChartData = (data?.weeklyWater || []).map((item) => ({
    day: item.date?.slice(5),
    water: item.totalMl || 0,
  }));

  const todayFocus = data?.todayFocus;
  const nextActions = data?.nextActions || [];
  const smartAlerts = data?.smartAlerts || [];
  const topSugarSources = data?.topAddedSugarSources || [];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Row */}
      <div style={dashStyles.headerRow}>
        <div>
          <div style={dashStyles.greeting}>
            FITTRACK PERSONAL FITNESS OS • {todayFocus?.currentGoal?.toUpperCase() || 'FITNESS'}
          </div>
          <h1 style={dashStyles.pageTitle}>Dashboard & Daily Assistant</h1>
        </div>

        {/* Date Selector */}
        <div style={dashStyles.datePickerContainer}>
          <FiCalendar style={{ color: '#818cf8', fontSize: '18px' }} />
          <input
            type="date"
            className="form-input"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ width: 'auto', padding: '8px 12px', cursor: 'pointer', background: 'transparent', color: '#fff' }}
          />
        </div>
      </div>

      {/* SMART ASSISTANT HERO CARD: "WHAT SHOULD I DO TODAY?" */}
      <div className="glass-panel" style={dashStyles.assistantCard}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={dashStyles.assistantIconBox}>
              <FiCompass size={24} color="#818cf8" />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.1em', color: '#818cf8' }}>
                SMART FITNESS ASSISTANT
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#ffffff', marginTop: '2px' }}>
                {todayFocus?.greeting || `Welcome, ${user?.fullName || 'Athlete'}`}
              </h2>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span className="badge badge-primary">
              <FiTarget size={12} style={{ marginRight: '4px' }} /> {todayFocus?.currentGoal || 'Fitness Goal'}
            </span>
          </div>
        </div>

        {/* Dynamic Focus Pillars */}
        <div style={dashStyles.focusPillars}>
          <div style={dashStyles.pillarItem}>
            <span style={dashStyles.pillarIcon}>🏋️</span>
            <div>
              <div style={dashStyles.pillarLabel}>Workout Focus</div>
              <div style={dashStyles.pillarValue}>{todayFocus?.scheduledWorkout || 'Rest & Recovery'}</div>
            </div>
          </div>

          <div style={dashStyles.pillarItem}>
            <span style={dashStyles.pillarIcon}>💧</span>
            <div>
              <div style={dashStyles.pillarLabel}>Hydration Target</div>
              <div style={dashStyles.pillarValue}>{todayFocus?.hydrationStatus || `${(waterMl/1000).toFixed(1)}L / ${(waterTarget/1000).toFixed(1)}L`}</div>
            </div>
          </div>

          <div style={dashStyles.pillarItem}>
            <span style={dashStyles.pillarIcon}>🥗</span>
            <div>
              <div style={dashStyles.pillarLabel}>Protein Target</div>
              <div style={dashStyles.pillarValue}>{todayFocus?.proteinStatus || `${protein.toFixed(0)}g / ${protTarget}g`}</div>
            </div>
          </div>

          <div style={dashStyles.pillarItem}>
            <span style={dashStyles.pillarIcon}>😴</span>
            <div>
              <div style={dashStyles.pillarLabel}>Sleep Recovery</div>
              <div style={dashStyles.pillarValue}>{todayFocus?.sleepStatus || `${sleepHours} hrs`}</div>
            </div>
          </div>
        </div>

        {/* Next Actions List */}
        <div style={dashStyles.nextActionsBox}>
          <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.08em', marginBottom: '8px' }}>
            NEXT ACTIONS FOR TODAY
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {nextActions.map((action, idx) => (
              <div key={idx} style={dashStyles.actionItem}>
                <span style={dashStyles.actionBullet}>{idx + 1}</span>
                <span style={{ fontSize: '0.9rem', color: '#e2e8f0', flex: 1 }}>{action}</span>
                {action.toLowerCase().includes('workout') ? (
                  <button onClick={() => navigate('/workout')} className="btn btn-secondary btn-sm" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                    Open Workout
                  </button>
                ) : action.toLowerCase().includes('water') ? (
                  <button onClick={() => handleQuickWater(500)} className="btn btn-secondary btn-sm" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                    +500ml
                  </button>
                ) : action.toLowerCase().includes('meal') || action.toLowerCase().includes('protein') ? (
                  <button onClick={() => navigate('/diet')} className="btn btn-secondary btn-sm" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                    Log Food
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Smart Alerts Banner (Non-shaming, neutral) */}
      {smartAlerts.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {smartAlerts.map((alert, idx) => (
            <div
              key={idx}
              className="glass-panel"
              style={{
                padding: '12px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                borderLeft: alert.level === 'WARNING' ? '4px solid #f59e0b' : '4px solid #6366f1',
                background: alert.level === 'WARNING' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(99, 102, 241, 0.08)',
              }}
            >
              {alert.level === 'WARNING' ? (
                <FiAlertTriangle color="#f59e0b" size={20} />
              ) : (
                <FiInfo color="#818cf8" size={20} />
              )}
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: '700', color: '#fff', fontSize: '0.88rem', marginRight: '8px' }}>
                  {alert.title}:
                </span>
                <span style={{ color: '#cbd5e1', fontSize: '0.86rem' }}>{alert.message}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Action Navigation Buttons */}
      <div style={dashStyles.quickActionsRow}>
        <button onClick={() => navigate('/diet')} className="btn btn-secondary" style={dashStyles.actionBtn}>
          <FiPlus /> Add Food Entry
        </button>
        <button onClick={() => handleQuickWater(500)} className="btn btn-secondary" style={dashStyles.actionBtn}>
          <FiDroplet /> Drink 500ml Water
        </button>
        <button onClick={() => navigate('/workout')} className="btn btn-primary" style={dashStyles.actionBtn}>
          <FiActivity /> Start Workout
        </button>
        <button onClick={() => navigate('/sleep')} className="btn btn-secondary" style={dashStyles.actionBtn}>
          <FiMoon /> Log Sleep
        </button>
        <button onClick={() => navigate('/progress')} className="btn btn-secondary" style={dashStyles.actionBtn}>
          <FiZap /> Body Progress
        </button>
      </div>

      {/* Main Metric Cards Grid */}
      <div style={dashStyles.statsGrid}>
        {/* Calories Card */}
        <div className="glass-panel glass-panel-hover" style={dashStyles.metricCard}>
          <div style={dashStyles.metricHeader}>
            <span style={{ ...dashStyles.iconPill, background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>
              <FiZap size={18} />
            </span>
            <span style={dashStyles.metricLabel}>CALORIES</span>
            <span className="badge badge-primary">{calPercent}%</span>
          </div>
          <div style={dashStyles.valueRow}>
            <span style={dashStyles.metricLargeVal}>{calories}</span>
            <span style={dashStyles.metricSubVal}>/ {calTarget} kcal</span>
          </div>
          <div style={dashStyles.progressTrack}>
            <div
              style={{
                ...dashStyles.progressBar,
                width: `${calPercent}%`,
                background: 'linear-gradient(90deg, #ef4444, #f97316)',
              }}
            />
          </div>
          <div style={dashStyles.cardFooter}>
            <span>{Math.max(0, calTarget - calories)} kcal remaining</span>
            <button onClick={() => navigate('/diet')} style={dashStyles.quickNavBtn}>
              Log Food <FiArrowUpRight />
            </button>
          </div>
        </div>

        {/* Protein Card */}
        <div className="glass-panel glass-panel-hover" style={dashStyles.metricCard}>
          <div style={dashStyles.metricHeader}>
            <span style={{ ...dashStyles.iconPill, background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <FiActivity size={18} />
            </span>
            <span style={dashStyles.metricLabel}>PROTEIN</span>
            <span className="badge badge-primary">{protPercent}%</span>
          </div>
          <div style={dashStyles.valueRow}>
            <span style={dashStyles.metricLargeVal}>{protein.toFixed(1)}g</span>
            <span style={dashStyles.metricSubVal}>/ {protTarget}g</span>
          </div>
          <div style={dashStyles.progressTrack}>
            <div
              style={{
                ...dashStyles.progressBar,
                width: `${protPercent}%`,
                background: 'linear-gradient(90deg, #6366f1, #a855f7)',
              }}
            />
          </div>
          <div style={dashStyles.cardFooter}>
            <span>Carbs: {carbs.toFixed(0)}g | Fat: {fat.toFixed(0)}g</span>
            <button onClick={() => navigate('/diet')} style={dashStyles.quickNavBtn}>
              Details <FiArrowUpRight />
            </button>
          </div>
        </div>

        {/* Added Sugar Tracker Card (Section 19) */}
        <div className="glass-panel glass-panel-hover" style={dashStyles.metricCard}>
          <div style={dashStyles.metricHeader}>
            <span style={{ ...dashStyles.iconPill, background: 'rgba(236, 72, 153, 0.15)', color: '#f472b6' }}>
              🍬
            </span>
            <span style={dashStyles.metricLabel}>ADDED SUGAR</span>
            <span className={`badge ${addedSugar > sugarTarget ? 'badge-danger' : 'badge-primary'}`}>
              {addedSugar.toFixed(1)}g / {sugarTarget}g
            </span>
          </div>
          <div style={dashStyles.valueRow}>
            <span style={dashStyles.metricLargeVal}>{addedSugar.toFixed(1)}g</span>
            <span style={dashStyles.metricSubVal}>daily limit: {sugarTarget}g</span>
          </div>
          <div style={dashStyles.progressTrack}>
            <div
              style={{
                ...dashStyles.progressBar,
                width: `${sugarPercent}%`,
                background: addedSugar > sugarTarget ? '#ef4444' : 'linear-gradient(90deg, #ec4899, #f43f5e)',
              }}
            />
          </div>
          <div style={dashStyles.cardFooter}>
            <span>{data?.addedSugarStatus === 'EXCEEDED' ? '⚠️ Limit Exceeded' : data?.addedSugarStatus === 'APPROACHING_LIMIT' ? '⚠️ Approaching Limit' : 'Within daily limit'}</span>
            <button onClick={() => navigate('/diet')} style={dashStyles.quickNavBtn}>
              Sugar Sources <FiArrowUpRight />
            </button>
          </div>
        </div>

        {/* Water Card */}
        <div className="glass-panel glass-panel-hover" style={dashStyles.metricCard}>
          <div style={dashStyles.metricHeader}>
            <span style={{ ...dashStyles.iconPill, background: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee' }}>
              <FiDroplet size={18} />
            </span>
            <span style={dashStyles.metricLabel}>HYDRATION</span>
            <span className="badge badge-primary">{waterPercent}%</span>
          </div>
          <div style={dashStyles.valueRow}>
            <span style={dashStyles.metricLargeVal}>{(waterMl / 1000).toFixed(1)}L</span>
            <span style={dashStyles.metricSubVal}>/ {(waterTarget / 1000).toFixed(1)}L</span>
          </div>
          <div style={dashStyles.progressTrack}>
            <div
              style={{
                ...dashStyles.progressBar,
                width: `${waterPercent}%`,
                background: 'linear-gradient(90deg, #06b6d4, #3b82f6)',
              }}
            />
          </div>
          <div style={dashStyles.quickActionRow}>
            <button
              onClick={() => handleQuickWater(250)}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.78rem', flex: 1 }}
            >
              <FiPlus size={12} /> 250ml
            </button>
            <button
              onClick={() => handleQuickWater(500)}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.78rem', flex: 1 }}
            >
              <FiPlus size={12} /> 500ml
            </button>
          </div>
        </div>
      </div>

      {/* Added Sugar Sources Breakdown (if any consumed) */}
      {topSugarSources.length > 0 && (
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#fff' }}>
              Top Sources of Added Sugar Today
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Total: {addedSugar.toFixed(1)}g</span>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {topSugarSources.map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.07)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span style={{ color: '#e2e8f0', fontSize: '0.85rem' }}>{item.foodName}</span>
                <span style={{ fontWeight: '700', color: '#f472b6', fontSize: '0.85rem' }}>{item.grams}g</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Workout Session Card */}
      <div
        className="glass-panel"
        style={{
          ...dashStyles.workoutBanner,
          borderLeft: data?.workoutCompleted ? '4px solid #10b981' : '4px solid #6366f1',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: data?.workoutCompleted ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: data?.workoutCompleted ? '#10b981' : '#818cf8',
            }}
          >
            {data?.workoutCompleted ? <FiCheckCircle size={26} /> : <FiActivity size={26} />}
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', color: '#ffffff' }}>
              {data?.workoutCompleted ? 'Workout Crushed Today! 💪' : `Today's Workout: ${todayFocus?.scheduledWorkout || 'Scheduled'}`}
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '3px' }}>
              {data?.workoutCompleted
                ? `Completed "${data.workoutName || 'Session'}" (${data.workoutDurationMinutes || 0} mins)`
                : 'Enter Live Workout Mode to track sets, reps, weight, and rest timer.'}
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/workout')}
          className="btn btn-primary"
        >
          {data?.workoutCompleted ? 'View Workout' : 'Start Live Workout'}
        </button>
      </div>

      {/* Charts Section */}
      <div style={dashStyles.chartsGrid}>
        {/* Weekly Nutrition Trend Chart */}
        <div className="glass-panel" style={dashStyles.chartCard}>
          <div style={dashStyles.chartHeader}>
            <div>
              <h3 style={dashStyles.chartTitle}>Calorie & Protein Intake (7 Days)</h3>
              <p style={dashStyles.chartSubtitle}>Daily energy vs target</p>
            </div>
            <span className="badge badge-primary">Trend</span>
          </div>

          <div style={{ height: '260px', width: '100%', marginTop: '16px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={nutritionChartData}>
                <defs>
                  <linearGradient id="calGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="calories"
                  stroke="#6366f1"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#calGradient)"
                  name="Calories"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Hydration Bar Chart */}
        <div className="glass-panel" style={dashStyles.chartCard}>
          <div style={dashStyles.chartHeader}>
            <div>
              <h3 style={dashStyles.chartTitle}>Hydration Levels (7 Days)</h3>
              <p style={dashStyles.chartSubtitle}>Daily water intake volume</p>
            </div>
            <span className="badge badge-primary">Hydration</span>
          </div>

          <div style={{ height: '260px', width: '100%', marginTop: '16px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={waterChartData}>
                <XAxis dataKey="day" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Bar
                  dataKey="water"
                  fill="#06b6d4"
                  radius={[6, 6, 0, 0]}
                  name="Water (ml)"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

const dashStyles = {
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
  },
  greeting: {
    fontSize: '0.78rem',
    fontWeight: '700',
    letterSpacing: '0.12em',
    color: '#818cf8',
    marginBottom: '4px',
  },
  pageTitle: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#ffffff',
  },
  datePickerContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'rgba(255, 255, 255, 0.04)',
    padding: '4px 12px',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  },
  assistantCard: {
    padding: '24px',
    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(168, 85, 247, 0.06) 100%)',
    border: '1px solid rgba(99, 102, 241, 0.25)',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  assistantIconBox: {
    width: '46px',
    height: '46px',
    borderRadius: '12px',
    background: 'rgba(99, 102, 241, 0.18)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  focusPillars: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px',
  },
  pillarItem: {
    background: 'rgba(255, 255, 255, 0.04)',
    padding: '12px 14px',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  pillarIcon: {
    fontSize: '1.4rem',
  },
  pillarLabel: {
    fontSize: '0.74rem',
    color: '#94a3b8',
    fontWeight: '600',
  },
  pillarValue: {
    fontSize: '0.92rem',
    color: '#ffffff',
    fontWeight: '700',
    marginTop: '2px',
  },
  nextActionsBox: {
    background: 'rgba(0, 0, 0, 0.25)',
    padding: '16px',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  actionItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px 10px',
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '8px',
  },
  actionBullet: {
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    background: '#6366f1',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    fontWeight: '700',
    flexShrink: 0,
  },
  quickActionsRow: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  actionBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.84rem',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '20px',
  },
  metricCard: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  metricHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconPill: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricLabel: {
    flex: 1,
    marginLeft: '12px',
    fontSize: '0.8rem',
    fontWeight: '700',
    letterSpacing: '0.05em',
    color: '#94a3b8',
  },
  valueRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '8px',
  },
  metricLargeVal: {
    fontSize: '2rem',
    fontWeight: '800',
    fontFamily: 'Outfit, sans-serif',
    color: '#ffffff',
  },
  metricSubVal: {
    fontSize: '0.85rem',
    color: '#64748b',
  },
  progressTrack: {
    width: '100%',
    height: '7px',
    background: 'rgba(255, 255, 255, 0.06)',
    borderRadius: '99px',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: '99px',
    transition: 'width 0.4s ease',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.78rem',
    color: '#64748b',
    marginTop: '4px',
  },
  quickNavBtn: {
    background: 'none',
    border: 'none',
    color: '#818cf8',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
  },
  quickActionRow: {
    display: 'flex',
    gap: '8px',
    marginTop: '4px',
  },
  workoutBanner: {
    padding: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
    gap: '20px',
  },
  chartCard: {
    padding: '24px',
  },
  chartHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: '1.15rem',
    fontWeight: '700',
    color: '#ffffff',
  },
  chartSubtitle: {
    fontSize: '0.8rem',
    color: '#94a3b8',
    marginTop: '3px',
  },
};
