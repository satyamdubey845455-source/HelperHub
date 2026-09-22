import React, { useState, useEffect, useRef } from 'react';
import { workoutApi, workoutScheduleApi, exerciseApi } from '../services/api';
import toast from 'react-hot-toast';
import {
  FiActivity,
  FiPlus,
  FiTrash2,
  FiAward,
  FiClock,
  FiSearch,
  FiCalendar,
  FiCheck,
  FiX,
  FiZap,
  FiPlay,
  FiPause,
  FiRotateCcw,
  FiFastForward,
  FiList,
  FiSliders,
} from 'react-icons/fi';

const DAYS_OF_WEEK = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
];

export default function Workout() {
  const [activeTab, setActiveTab] = useState('workout'); // 'workout', 'live', 'schedule'
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // New session modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [sessionForm, setSessionForm] = useState({
    name: 'Push Hypertrophy',
    notes: 'Focus on bench press & triceps progressive overload',
    durationMinutes: 60,
  });

  // Add set modal
  const [showAddSetModal, setShowAddSetModal] = useState(false);
  const [exercises, setExercises] = useState([]);
  const [exerciseQuery, setExerciseQuery] = useState('');
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [setForm, setSetForm] = useState({
    weightKg: 60,
    reps: 10,
    restSeconds: 90,
  });

  // ── Rest Timer State ────────────────────────────────────────
  const [restTimeLeft, setRestTimeLeft] = useState(90);
  const [restInitialTime, setRestInitialTime] = useState(90);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef(null);

  // ── Weekly Schedule State ───────────────────────────────────
  const [schedules, setSchedules] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);

  const fetchWorkouts = async (date) => {
    setLoading(true);
    try {
      const res = await workoutApi.getByDate(date);
      const list = res.data.data || [];
      setSessions(list);
      if (list.length > 0) {
        const detailRes = await workoutApi.getSession(list[0].id);
        setActiveSession(detailRes.data.data);
      } else {
        setActiveSession(null);
      }
    } catch (err) {
      toast.error('Could not load workout sessions');
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedules = async () => {
    setScheduleLoading(true);
    try {
      const res = await workoutScheduleApi.get();
      setSchedules(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setScheduleLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkouts(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    if (activeTab === 'schedule') {
      fetchSchedules();
    }
  }, [activeTab]);

  // Exercise search
  useEffect(() => {
    if (!showAddSetModal && activeTab !== 'live') return;
    const timer = setTimeout(async () => {
      try {
        const res = await exerciseApi.search(exerciseQuery);
        setExercises(res.data.data || []);
      } catch (err) {
        console.error(err);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [exerciseQuery, showAddSetModal, activeTab]);

  // Rest Timer countdown
  useEffect(() => {
    if (isTimerRunning && restTimeLeft > 0) {
      timerRef.current = setInterval(() => {
        setRestTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsTimerRunning(false);
            toast.success('⏰ Rest time is up! Get ready for your next set! 🔥', { duration: 5000 });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isTimerRunning, restTimeLeft]);

  const startRestTimer = (seconds = 90) => {
    setRestInitialTime(seconds);
    setRestTimeLeft(seconds);
    setIsTimerRunning(true);
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    try {
      await workoutApi.create({
        ...sessionForm,
        sessionDate: selectedDate,
      });
      toast.success('Workout session started! 🏋️');
      setShowCreateModal(false);
      fetchWorkouts(selectedDate);
    } catch (err) {
      toast.error('Failed to create session');
    }
  };

  const handleAddSet = async () => {
    if (!activeSession || !selectedExercise) {
      toast.error('Select an exercise first');
      return;
    }
    const currentSets = activeSession.sets || [];
    const nextSetNumber = currentSets.filter(
      (s) => s.exercise?.id === selectedExercise.id
    ).length + 1;

    try {
      const res = await workoutApi.addSet(activeSession.id, {
        exerciseId: selectedExercise.id,
        setNumber: nextSetNumber,
        weightKg: Number(setForm.weightKg),
        reps: Number(setForm.reps),
        restSeconds: Number(setForm.restSeconds),
      });

      const loggedSet = res.data.data;
      if (loggedSet.isPr) {
        toast.success(
          `🎉 NEW PERSONAL RECORD! Est. 1RM: ${loggedSet.estimated1rmKg?.toFixed(1)} kg!`,
          { duration: 5000 }
        );
      } else {
        toast.success(`Set #${nextSetNumber} logged!`);
      }

      // Auto-start rest timer
      startRestTimer(Number(setForm.restSeconds) || 90);

      setShowAddSetModal(false);
      const detail = await workoutApi.getSession(activeSession.id);
      setActiveSession(detail.data.data);
    } catch (err) {
      toast.error('Could not log set');
    }
  };

  const handleDeleteSet = async (setId) => {
    if (!activeSession) return;
    try {
      await workoutApi.deleteSet(activeSession.id, setId);
      toast.success('Set removed');
      const detail = await workoutApi.getSession(activeSession.id);
      setActiveSession(detail.data.data);
    } catch (err) {
      toast.error('Could not delete set');
    }
  };

  const handleDeleteSession = async (id) => {
    if (!window.confirm('Delete this workout session?')) return;
    try {
      await workoutApi.delete(id);
      toast.success('Session deleted');
      fetchWorkouts(selectedDate);
    } catch (err) {
      toast.error('Could not delete session');
    }
  };

  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    try {
      await workoutScheduleApi.save(schedules);
      toast.success('Weekly workout split saved! 📅');
    } catch (err) {
      toast.error('Failed to save schedule');
    }
  };

  const formatSeconds = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={woStyles.headerRow}>
        <div>
          <div style={woStyles.subTitle}>FITNESS & ATHLETICS</div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Workouts & Live Gym Mode</h1>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={woStyles.datePickerContainer}>
            <FiCalendar style={{ color: '#818cf8', fontSize: '18px' }} />
            <input
              type="date"
              className="form-input"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ width: 'auto', padding: '6px 12px', cursor: 'pointer' }}
            />
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            <FiPlus /> New Session
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={woStyles.tabRow}>
        <button
          onClick={() => setActiveTab('workout')}
          style={{ ...woStyles.tabBtn, ...(activeTab === 'workout' ? woStyles.tabBtnActive : {}) }}
        >
          <FiActivity /> Today's Session
        </button>
        <button
          onClick={() => setActiveTab('live')}
          style={{ ...woStyles.tabBtn, ...(activeTab === 'live' ? woStyles.tabBtnActive : {}) }}
        >
          <FiZap style={{ color: '#fbbf24' }} /> Live Workout & Rest Timer
        </button>
        <button
          onClick={() => setActiveTab('schedule')}
          style={{ ...woStyles.tabBtn, ...(activeTab === 'schedule' ? woStyles.tabBtnActive : {}) }}
        >
          <FiList /> Weekly Workout Split
        </button>
      </div>

      {/* TAB 1: WORKOUT SESSIONS */}
      {activeTab === 'workout' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {sessions.length === 0 ? (
            <div className="glass-panel" style={{ padding: '48px', textAlign: 'center' }}>
              <FiActivity size={48} style={{ color: '#6366f1', marginBottom: '16px' }} />
              <h2 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '8px' }}>
                No Workout Logged for this Date
              </h2>
              <p style={{ color: '#94a3b8', maxWidth: '440px', margin: '0 auto 24px auto' }}>
                Ready to crush today's target? Start a session or jump directly into Live Gym Mode.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
                  <FiPlus /> Start Workout
                </button>
                <button onClick={() => setActiveTab('schedule')} className="btn btn-secondary">
                  <FiCalendar /> View Weekly Schedule
                </button>
              </div>
            </div>
          ) : (
            <div style={woStyles.sessionContainer}>
              {/* Session Header Card */}
              <div className="glass-panel" style={woStyles.sessionHeaderCard}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h2 style={{ fontSize: '1.4rem', color: '#fff' }}>{activeSession?.name}</h2>
                    <span style={woStyles.durationBadge}>
                      <FiClock size={13} /> {activeSession?.durationMinutes || 60} min
                    </span>
                  </div>
                  {activeSession?.notes && (
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>
                      {activeSession.notes}
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => setActiveTab('live')}
                    className="btn btn-primary btn-sm"
                  >
                    <FiZap /> Enter Live Mode
                  </button>
                  <button
                    onClick={() => setShowAddSetModal(true)}
                    className="btn btn-secondary btn-sm"
                  >
                    <FiPlus /> Add Set
                  </button>
                  <button
                    onClick={() => handleDeleteSession(activeSession?.id)}
                    className="btn btn-danger btn-sm"
                    title="Delete Session"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>

              {/* Sets Log Table */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '16px' }}>
                  Logged Exercises & Sets
                </h3>

                {(!activeSession?.sets || activeSession.sets.length === 0) ? (
                  <p style={{ color: '#64748b', textAlign: 'center', padding: '24px' }}>
                    No sets logged yet. Click "+ Add Set" or switch to "Live Workout & Rest Timer".
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {activeSession.sets.map((set, idx) => (
                      <div key={set.id} style={woStyles.setRow}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <span style={woStyles.setNumber}>#{set.setNumber || idx + 1}</span>
                          <div>
                            <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem' }}>
                              {set.exercise?.name || 'Exercise'}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                              {set.exercise?.muscleGroup} • {set.exercise?.equipment}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 700, color: '#fff', fontSize: '1.05rem' }}>
                              {set.weightKg} kg × {set.reps} reps
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#818cf8' }}>
                              Est. 1RM: {set.estimated1rmKg ? `${set.estimated1rmKg.toFixed(1)} kg` : '--'}
                            </div>
                          </div>

                          {set.isPr && (
                            <span style={woStyles.prBadge}>
                              <FiAward size={13} /> PR!
                            </span>
                          )}

                          <button
                            onClick={() => handleDeleteSet(set.id)}
                            style={woStyles.deleteSetBtn}
                            title="Delete Set"
                          >
                            <FiTrash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: LIVE WORKOUT & REST TIMER */}
      {activeTab === 'live' && (
        <div style={woStyles.liveGrid}>
          {/* Left Column: Quick Set Logger */}
          <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiZap style={{ color: '#fbbf24' }} />
                <h2 style={{ fontSize: '1.3rem', color: '#fff' }}>Live Gym Logger</h2>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '4px' }}>
                Designed with high contrast and big touch targets for easy use during workouts.
              </p>
            </div>

            {/* Exercise Selector */}
            <div className="form-group">
              <label className="form-label">Exercise</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ ...woStyles.searchBox, flex: 1 }}>
                  <FiSearch style={{ color: '#64748b' }} />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Search exercise (e.g. Bench, Squat, Pull Up)..."
                    value={exerciseQuery}
                    onChange={(e) => setExerciseQuery(e.target.value)}
                  />
                </div>
              </div>

              {exercises.length > 0 && !selectedExercise && (
                <div style={woStyles.exerciseDropdown}>
                  {exercises.slice(0, 6).map((ex) => (
                    <div
                      key={ex.id}
                      onClick={() => { setSelectedExercise(ex); setExerciseQuery(ex.name); }}
                      style={woStyles.exerciseOption}
                    >
                      <strong style={{ color: '#fff' }}>{ex.name}</strong>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{ex.muscleGroup}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedExercise && (
              <div style={woStyles.selectedExerciseBanner}>
                <div>
                  <span style={{ color: '#818cf8', fontWeight: 700 }}>{selectedExercise.name}</span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: '8px' }}>
                    ({selectedExercise.muscleGroup})
                  </span>
                </div>
                <button
                  onClick={() => { setSelectedExercise(null); setExerciseQuery(''); }}
                  style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                  <FiX />
                </button>
              </div>
            )}

            {/* Weight & Reps Steppers */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {/* Weight */}
              <div className="glass-panel" style={{ padding: '16px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>WEIGHT (KG)</span>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', margin: '6px 0' }}>
                  {setForm.weightKg}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                  <button
                    onClick={() => setSetForm({ ...setForm, weightKg: Math.max(0, Number(setForm.weightKg) - 2.5) })}
                    className="btn btn-secondary btn-sm"
                    style={{ minWidth: '42px', fontWeight: 700 }}
                  >
                    -2.5
                  </button>
                  <button
                    onClick={() => setSetForm({ ...setForm, weightKg: Number(setForm.weightKg) + 2.5 })}
                    className="btn btn-secondary btn-sm"
                    style={{ minWidth: '42px', fontWeight: 700 }}
                  >
                    +2.5
                  </button>
                </div>
              </div>

              {/* Reps */}
              <div className="glass-panel" style={{ padding: '16px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>REPS</span>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', margin: '6px 0' }}>
                  {setForm.reps}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                  <button
                    onClick={() => setSetForm({ ...setForm, reps: Math.max(1, Number(setForm.reps) - 1) })}
                    className="btn btn-secondary btn-sm"
                    style={{ minWidth: '42px', fontWeight: 700 }}
                  >
                    -1
                  </button>
                  <button
                    onClick={() => setSetForm({ ...setForm, reps: Number(setForm.reps) + 1 })}
                    className="btn btn-secondary btn-sm"
                    style={{ minWidth: '42px', fontWeight: 700 }}
                  >
                    +1
                  </button>
                </div>
              </div>
            </div>

            {/* Log Set Button */}
            <button
              onClick={handleAddSet}
              disabled={!activeSession || !selectedExercise}
              className="btn btn-primary btn-lg"
              style={{ padding: '16px', fontSize: '1.1rem', fontWeight: 700, width: '100%', justifyContent: 'center' }}
            >
              <FiCheck size={20} /> Complete Set & Start Rest
            </button>
          </div>

          {/* Right Column: Interactive Rest Timer */}
          <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.12em', color: '#818cf8', marginBottom: '8px' }}>
              REST INTERVAL TIMER
            </span>

            {/* Circular Countdown Display */}
            <div style={woStyles.timerCircle}>
              <span style={woStyles.timerClock}>{formatSeconds(restTimeLeft)}</span>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                {isTimerRunning ? 'Resting...' : restTimeLeft === 0 ? 'Ready!' : 'Paused'}
              </span>
            </div>

            {/* Presets */}
            <div style={{ display: 'flex', gap: '8px', margin: '20px 0 16px 0', flexWrap: 'wrap', justifyContent: 'center' }}>
              {[30, 60, 90, 120].map((sec) => (
                <button
                  key={sec}
                  onClick={() => startRestTimer(sec)}
                  style={{
                    ...woStyles.presetBtn,
                    ...(restInitialTime === sec ? woStyles.presetBtnActive : {}),
                  }}
                >
                  {sec}s
                </button>
              ))}
            </div>

            {/* Timer Action Controls */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="btn btn-primary"
                style={{ padding: '10px 24px', fontSize: '1rem' }}
              >
                {isTimerRunning ? <><FiPause /> Pause</> : <><FiPlay /> Start</>}
              </button>
              <button
                onClick={() => setRestTimeLeft((prev) => prev + 30)}
                className="btn btn-secondary"
                title="Add 30 seconds"
              >
                <FiFastForward /> +30s
              </button>
              <button
                onClick={() => { setIsTimerRunning(false); setRestTimeLeft(restInitialTime); }}
                className="btn btn-secondary"
                title="Reset timer"
              >
                <FiRotateCcw />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: WEEKLY WORKOUT SPLIT */}
      {activeTab === 'schedule' && (
        <div className="glass-panel" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '1.3rem', color: '#fff' }}>Custom Weekly Workout Split</h2>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>
                Configure your split (e.g. Chest + Triceps, Back + Biceps, Legs, Rest Day).
              </p>
            </div>
            <button onClick={handleSaveSchedule} className="btn btn-primary">
              <FiCheck /> Save Schedule
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {DAYS_OF_WEEK.map((day) => {
              const currentDaySched = schedules.find((s) => s.dayOfWeek === day) || {
                dayOfWeek: day,
                workoutName: day === 'SUNDAY' ? 'Rest Day' : 'Workout Day',
                targetMuscleGroups: '',
                notes: '',
              };

              return (
                <div key={day} style={woStyles.scheduleRow}>
                  <div style={woStyles.dayBadge}>{day.slice(0, 3)}</div>

                  <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Workout Name (e.g. Chest & Triceps, Rest)"
                      value={currentDaySched.workoutName || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSchedules((prev) => {
                          const existing = prev.filter((s) => s.dayOfWeek !== day);
                          return [...existing, { ...currentDaySched, workoutName: val }];
                        });
                      }}
                    />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Target Muscles (e.g. Chest, Shoulders)"
                      value={currentDaySched.targetMuscleGroups || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSchedules((prev) => {
                          const existing = prev.filter((s) => s.dayOfWeek !== day);
                          return [...existing, { ...currentDaySched, targetMuscleGroups: val }];
                        });
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* New Session Modal */}
      {showCreateModal && (
        <div style={woStyles.modalOverlay}>
          <div className="glass-panel" style={woStyles.modalContent}>
            <div style={woStyles.modalHeader}>
              <h2 style={{ fontSize: '1.3rem', color: '#fff' }}>Start Workout Session</h2>
              <button onClick={() => setShowCreateModal(false)} style={woStyles.closeBtn}>
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateSession} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Session Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={sessionForm.name}
                  onChange={(e) => setSessionForm({ ...sessionForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Duration (Minutes)</label>
                <input
                  type="number"
                  className="form-input"
                  value={sessionForm.durationMinutes}
                  onChange={(e) => setSessionForm({ ...sessionForm, durationMinutes: Number(e.target.value) })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea
                  className="form-input"
                  rows="3"
                  value={sessionForm.notes}
                  onChange={(e) => setSessionForm({ ...sessionForm, notes: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <FiCheck /> Start Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Set Modal */}
      {showAddSetModal && (
        <div style={woStyles.modalOverlay}>
          <div className="glass-panel" style={woStyles.modalContent}>
            <div style={woStyles.modalHeader}>
              <h2 style={{ fontSize: '1.3rem', color: '#fff' }}>Log Exercise Set</h2>
              <button onClick={() => setShowAddSetModal(false)} style={woStyles.closeBtn}>
                <FiX size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Search Exercise</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Barbell Bench Press..."
                  value={exerciseQuery}
                  onChange={(e) => setExerciseQuery(e.target.value)}
                />
                {exercises.length > 0 && !selectedExercise && (
                  <div style={woStyles.exerciseDropdown}>
                    {exercises.slice(0, 5).map((ex) => (
                      <div
                        key={ex.id}
                        onClick={() => { setSelectedExercise(ex); setExerciseQuery(ex.name); }}
                        style={woStyles.exerciseOption}
                      >
                        <strong style={{ color: '#fff' }}>{ex.name}</strong> ({ex.muscleGroup})
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedExercise && (
                <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '10px', borderRadius: '8px', color: '#818cf8', fontWeight: 600 }}>
                  Selected: {selectedExercise.name} ({selectedExercise.muscleGroup})
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    className="form-input"
                    value={setForm.weightKg}
                    onChange={(e) => setSetForm({ ...setForm, weightKg: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Reps</label>
                  <input
                    type="number"
                    className="form-input"
                    value={setForm.reps}
                    onChange={(e) => setSetForm({ ...setForm, reps: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Rest Timer (Seconds)</label>
                <input
                  type="number"
                  className="form-input"
                  value={setForm.restSeconds}
                  onChange={(e) => setSetForm({ ...setForm, restSeconds: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowAddSetModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button onClick={handleAddSet} className="btn btn-primary">
                  <FiCheck /> Log Set
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const woStyles = {
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
  tabRow: {
    display: 'flex',
    gap: '8px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    paddingBottom: '10px',
  },
  tabBtn: {
    background: 'transparent',
    border: 'none',
    color: '#94a3b8',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem',
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
  sessionContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  sessionHeaderCard: {
    padding: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
  },
  durationBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.75rem',
    background: 'rgba(255, 255, 255, 0.06)',
    padding: '3px 8px',
    borderRadius: '6px',
    color: '#cbd5e1',
  },
  setRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    background: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.04)',
  },
  setNumber: {
    fontSize: '0.85rem',
    fontWeight: 800,
    color: '#818cf8',
    width: '28px',
  },
  prBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.72rem',
    fontWeight: 800,
    background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
    color: '#fff',
    padding: '3px 8px',
    borderRadius: '6px',
  },
  deleteSetBtn: {
    background: 'transparent',
    border: 'none',
    color: '#ef4444',
    cursor: 'pointer',
    padding: '6px',
  },
  liveGrid: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: '24px',
  },
  timerCircle: {
    width: '200px',
    height: '200px',
    borderRadius: '50%',
    border: '4px solid #6366f1',
    boxShadow: '0 0 30px rgba(99, 102, 241, 0.3)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '16px 0',
  },
  timerClock: {
    fontSize: '3rem',
    fontWeight: 900,
    color: '#fff',
    letterSpacing: '-0.02em',
  },
  presetBtn: {
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#94a3b8',
    padding: '6px 14px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.82rem',
    fontWeight: 600,
  },
  presetBtnActive: {
    background: 'rgba(99, 102, 241, 0.2)',
    borderColor: '#6366f1',
    color: '#fff',
  },
  exerciseDropdown: {
    background: '#0f172a',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    marginTop: '6px',
    maxHeight: '180px',
    overflowY: 'auto',
  },
  exerciseOption: {
    padding: '8px 12px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
  },
  selectedExerciseBanner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(99, 102, 241, 0.12)',
    border: '1px solid rgba(99, 102, 241, 0.3)',
    padding: '10px 14px',
    borderRadius: '8px',
  },
  scheduleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '12px 16px',
    background: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.04)',
  },
  dayBadge: {
    width: '50px',
    fontWeight: 800,
    fontSize: '0.85rem',
    color: '#818cf8',
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
    maxWidth: '520px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '28px',
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
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    padding: '0 12px',
  },
};
