import React from 'react';
import { useAuth } from '../context/AuthContext';
import { AttendanceRecord, WorkShift } from '../types';
import { Clock, MapPin, Camera, CheckCircle2, AlertCircle } from 'lucide-react';

interface TodayShiftCardProps {
  todayShift: WorkShift;
  todayRecord?: AttendanceRecord;
  onClockIn: () => void;
  onClockOut: () => void;
}

export const TodayShiftCard: React.FC<TodayShiftCardProps> = ({
  todayShift,
  todayRecord,
  onClockIn,
  onClockOut,
}) => {
  const { t } = useAuth();

  const isCheckedIn = Boolean(todayRecord?.checkInTime);
  const isCheckedOut = Boolean(todayRecord?.checkOutTime);
  const isCompleted = isCheckedIn && isCheckedOut;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <Clock className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t('home.today_card_title')}
            </h2>
            <div className="text-base font-bold text-slate-900 dark:text-white">
              {todayShift.shiftName}
            </div>
          </div>
        </div>

        {/* Status Badge */}
        {isCompleted ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {t('common.success')}
          </span>
        ) : isCheckedIn ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            {t('home.status_working')}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
            <AlertCircle className="w-3.5 h-3.5" />
            {t('common.not_clocked')}
          </span>
        )}
      </div>

      {/* Check In / Out Time Status Grid */}
      <div className="grid grid-cols-2 gap-3 mb-5 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
        {/* Vào ca */}
        <div>
          <div className="text-slate-500 dark:text-slate-400 font-medium mb-1">
            {t('home.check_in')} ({todayShift.startTime}):
          </div>
          <div className="font-bold text-sm text-slate-800 dark:text-slate-200">
            {isCheckedIn ? (
              <span className="text-emerald-600 dark:text-emerald-400">
                ✅ {todayRecord?.checkInTime}
              </span>
            ) : (
              <span className="text-slate-400 dark:text-slate-500">
                {t('common.not_clocked')}
              </span>
            )}
          </div>
        </div>

        {/* Tan ca */}
        <div>
          <div className="text-slate-500 dark:text-slate-400 font-medium mb-1">
            {t('home.check_out')} ({todayShift.endTime}):
          </div>
          <div className="font-bold text-sm text-slate-800 dark:text-slate-200">
            {isCheckedOut ? (
              <span className="text-emerald-600 dark:text-emerald-400">
                ✅ {todayRecord?.checkOutTime}
              </span>
            ) : (
              <span className="text-slate-400 dark:text-slate-500">
                {t('common.not_clocked')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* GPS Status Indicator */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-4 px-1">
        <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span className="truncate">
          10.8005° N, 106.6445° E (Sai số ±15m • Hợp lệ tại cửa hàng)
        </span>
      </div>

      {/* Action Buttons: Designed for prominent, mistakeless tap */}
      <div className="grid grid-cols-2 gap-3">
        {/* Nút Vào ca */}
        <button
          onClick={onClockIn}
          disabled={isCheckedIn}
          className={`relative flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-sm transition-all shadow-sm active:scale-95 ${
            !isCheckedIn
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-500/30'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-slate-700'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>{isCheckedIn ? t('home.checked_in') : t('home.check_in')}</span>
        </button>

        {/* Nút Tan ca */}
        <button
          onClick={onClockOut}
          disabled={!isCheckedIn || isCheckedOut}
          className={`relative flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-sm transition-all shadow-sm active:scale-95 ${
            isCheckedIn && !isCheckedOut
              ? 'bg-blue-600 hover:bg-blue-700 text-white ring-2 ring-blue-500/30 animate-pulse'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-slate-700'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>{isCheckedOut ? t('home.checked_out') : t('home.check_out')}</span>
        </button>
      </div>
    </div>
  );
};
