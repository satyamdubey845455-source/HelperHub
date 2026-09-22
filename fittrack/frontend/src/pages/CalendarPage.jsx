import React, { useState, useEffect } from 'react';
import { analyticsApi } from '../services/api';
import toast from 'react-hot-toast';
import {
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiActivity,
  FiPieChart,
  FiDroplet,
  FiMoon,
  FiCheck,
} from 'react-icons/fi';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState({});
  const [selectedDayData, setSelectedDayData] = useState(null);
  const [selectedDateStr, setSelectedDateStr] = useState(null);
  const [loading, setLoading] = useState(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed
  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;

  const fetchCalendar = async (m) => {
    setLoading(true);
    try {
      const res = await analyticsApi.getCalendar(m);
      setCalendarData(res.data.data || {});
    } catch (err) {
      toast.error('Could not load monthly calendar');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendar(monthStr);
  }, [monthStr]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Generate days in month + leading empty days
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const handleSelectDay = (dayNumber) => {
    const dayStr = `${monthStr}-${String(dayNumber).padStart(2, '0')}`;
    setSelectedDateStr(dayStr);
    setSelectedDayData(calendarData[dayStr] || null);
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div style={calStyles.headerRow}>
        <div>
          <div style={calStyles.subTitle}>ACTIVITY HEATMAP & SCHEDULE</div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Fitness Calendar</h1>
        </div>

        {/* Month Navigator */}
        <div style={calStyles.navControls}>
          <button onClick={handlePrevMonth} style={calStyles.arrowBtn} title="Previous Month">
            <FiChevronLeft size={18} />
          </button>
          <span style={calStyles.monthTitle}>
            {monthName} {year}
          </span>
          <button onClick={handleNextMonth} style={calStyles.arrowBtn} title="Next Month">
            <FiChevronRight size={18} />
          </button>
        </div>
      </div>

      <div style={calStyles.layoutGrid}>
        {/* Calendar Grid */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          {/* Weekday headers */}
          <div style={calStyles.weekdayGrid}>
            {WEEKDAYS.map((w) => (
              <div key={w} style={calStyles.weekdayCell}>
                {w}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div style={calStyles.daysGrid}>
            {/* Empty slots before first day */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} style={calStyles.emptyDayCell} />
            ))}

            {/* Actual Month Days */}
            {Array.from({ length: totalDays }).map((_, i) => {
              const dayNum = i + 1;
              const dayStr = `${monthStr}-${String(dayNum).padStart(2, '0')}`;
              const dayInfo = calendarData[dayStr];
              const isSelected = selectedDateStr === dayStr;
              const isToday = new Date().toISOString().slice(0, 10) === dayStr;

              return (
                <div
                  key={dayNum}
                  onClick={() => handleSelectDay(dayNum)}
                  style={{
                    ...calStyles.dayCell,
                    ...(isSelected ? calStyles.dayCellSelected : {}),
                    ...(isToday ? calStyles.dayCellToday : {}),
                  }}
                >
                  <span style={calStyles.dayNumber}>{dayNum}</span>

                  {/* Activity Indicator Dots */}
                  <div style={calStyles.indicatorsRow}>
                    {dayInfo?.workoutCompleted && (
                      <span title="Workout Completed" style={{ ...calStyles.dot, background: '#10b981' }} />
                    )}
                    {dayInfo?.mealsLogged && (
                      <span title="Meals Logged" style={{ ...calStyles.dot, background: '#6366f1' }} />
                    )}
                    {dayInfo?.waterConsumedMl > 0 && (
                      <span title={`Water: ${dayInfo.waterConsumedMl}ml`} style={{ ...calStyles.dot, background: '#38bdf8' }} />
                    )}
                    {dayInfo?.sleepHours > 0 && (
                      <span title={`Sleep: ${dayInfo.sleepHours}h`} style={{ ...calStyles.dot, background: '#a855f7' }} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div style={calStyles.legendRow}>
            <div style={calStyles.legendItem}>
              <span style={{ ...calStyles.dot, background: '#10b981' }} /> Workout
            </div>
            <div style={calStyles.legendItem}>
              <span style={{ ...calStyles.dot, background: '#6366f1' }} /> Meals
            </div>
            <div style={calStyles.legendItem}>
              <span style={{ ...calStyles.dot, background: '#38bdf8' }} /> Hydration
            </div>
            <div style={calStyles.legendItem}>
              <span style={{ ...calStyles.dot, background: '#a855f7' }} /> Sleep
            </div>
          </div>
        </div>

        {/* Selected Day Summary Card */}
        <div className="glass-panel" style={{ padding: '28px', height: 'fit-content' }}>
          <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '6px' }}>
            Day Summary
          </h3>
          <p style={{ fontSize: '0.84rem', color: '#818cf8', fontWeight: 600, marginBottom: '20px' }}>
            {selectedDateStr || 'Click any date on the calendar'}
          </p>

          {selectedDateStr ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={calStyles.summaryItem}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FiActivity style={{ color: '#10b981' }} />
                  <span style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>Workout Status</span>
                </div>
                <strong style={{ color: selectedDayData?.workoutCompleted ? '#10b981' : '#64748b' }}>
                  {selectedDayData?.workoutCompleted ? 'Completed ✅' : 'Rest / Not Logged'}
                </strong>
              </div>

              <div style={calStyles.summaryItem}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FiPieChart style={{ color: '#6366f1' }} />
                  <span style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>Meals Logged</span>
                </div>
                <strong style={{ color: selectedDayData?.mealsLogged ? '#6366f1' : '#64748b' }}>
                  {selectedDayData?.mealsLogged ? 'Yes ✅' : 'No entries'}
                </strong>
              </div>

              <div style={calStyles.summaryItem}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FiDroplet style={{ color: '#38bdf8' }} />
                  <span style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>Hydration</span>
                </div>
                <strong style={{ color: '#38bdf8' }}>
                  {selectedDayData?.waterConsumedMl ? `${selectedDayData.waterConsumedMl} ml` : '0 ml'}
                </strong>
              </div>

              <div style={calStyles.summaryItem}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FiMoon style={{ color: '#a855f7' }} />
                  <span style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>Sleep Tracked</span>
                </div>
                <strong style={{ color: '#a855f7' }}>
                  {selectedDayData?.sleepHours ? `${selectedDayData.sleepHours} hrs` : 'No log'}
                </strong>
              </div>
            </div>
          ) : (
            <div style={{ color: '#64748b', fontSize: '0.85rem', textAlign: 'center', padding: '24px 0' }}>
              Select a date on the calendar to view its logged metrics.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const calStyles = {
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
  navControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: 'rgba(255, 255, 255, 0.04)',
    padding: '6px 14px',
    borderRadius: '10px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  },
  arrowBtn: {
    background: 'transparent',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  monthTitle: {
    fontWeight: 700,
    fontSize: '1rem',
    color: '#fff',
    minWidth: '150px',
    textAlign: 'center',
  },
  layoutGrid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '24px',
  },
  weekdayGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    textAlign: 'center',
    marginBottom: '12px',
  },
  weekdayCell: {
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#64748b',
    textTransform: 'uppercase',
  },
  daysGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '8px',
  },
  emptyDayCell: {
    minHeight: '70px',
  },
  dayCell: {
    minHeight: '70px',
    padding: '8px',
    borderRadius: '8px',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    transition: 'all 0.15s ease',
  },
  dayCellSelected: {
    borderColor: '#6366f1',
    background: 'rgba(99, 102, 241, 0.15)',
  },
  dayCellToday: {
    borderLeft: '3px solid #38bdf8',
  },
  dayNumber: {
    fontSize: '0.85rem',
    fontWeight: 700,
    color: '#cbd5e1',
  },
  indicatorsRow: {
    display: 'flex',
    gap: '4px',
    marginTop: 'auto',
  },
  dot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
  },
  legendRow: {
    display: 'flex',
    gap: '20px',
    marginTop: '20px',
    paddingTop: '16px',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
    justifyContent: 'center',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.75rem',
    color: '#94a3b8',
  },
  summaryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 14px',
    background: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.04)',
  },
};
