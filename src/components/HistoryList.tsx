import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AttendanceRecord, RecordStatus } from '../types';
import { formatDate, getDayOfWeekName } from '../utils/formatters';
import { Calendar, ChevronRight, CheckCircle2, Clock, AlertTriangle, AlertCircle, RefreshCw, Filter } from 'lucide-react';

interface HistoryListProps {
  records: AttendanceRecord[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onSelectRecord: (record: AttendanceRecord) => void;
}

type FilterOption = 'ALL' | 'COMPLETED' | 'INCOMPLETE' | 'OFF';

export const HistoryList: React.FC<HistoryListProps> = ({
  records,
  isLoading,
  isError,
  onRetry,
  onSelectRecord,
}) => {
  const { language, t } = useAuth();
  const [filter, setFilter] = useState<FilterOption>('ALL');
  const [visibleCount, setVisibleCount] = useState<number>(7);

  // Lọc bản ghi
  const filteredRecords = records.filter((rec) => {
    if (filter === 'COMPLETED') return rec.status === 'COMPLETED';
    if (filter === 'INCOMPLETE') return rec.status === 'MISSING_IN' || rec.status === 'MISSING_OUT' || rec.status === 'IN_PROGRESS';
    if (filter === 'OFF') return rec.status === 'OFF';
    return true;
  });

  const displayedRecords = filteredRecords.slice(0, visibleCount);
  const hasMore = visibleCount < filteredRecords.length;

  const getStatusBadge = (status: RecordStatus) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="w-3 h-3" />
            {t('status_labels.COMPLETED')}
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300">
            <Clock className="w-3 h-3 animate-spin" />
            {t('status_labels.IN_PROGRESS')}
          </span>
        );
      case 'MISSING_OUT':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300">
            <AlertCircle className="w-3 h-3" />
            {t('status_labels.MISSING_OUT')}
          </span>
        );
      case 'MISSING_IN':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300">
            <AlertCircle className="w-3 h-3" />
            {t('status_labels.MISSING_IN')}
          </span>
        );
      case 'LATE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300">
            <AlertTriangle className="w-3 h-3" />
            {t('status_labels.LATE')}
          </span>
        );
      case 'OFF':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {t('status_labels.OFF')}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 transition-colors">
      {/* Title & Filter bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {t('home.history_title')}
          </h3>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
          <span className="text-slate-400 dark:text-slate-500 mr-1 hidden sm:inline">
            <Filter className="w-3 h-3" />
          </span>
          {(['ALL', 'COMPLETED', 'INCOMPLETE', 'OFF'] as FilterOption[]).map((opt) => (
            <button
              key={opt}
              onClick={() => setFilter(opt)}
              className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                filter === opt
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {opt === 'ALL'
                ? t('common.all')
                : opt === 'COMPLETED'
                ? t('status_labels.COMPLETED')
                : opt === 'INCOMPLETE'
                ? 'Thiếu ca/Dở ca'
                : t('status_labels.OFF')}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-3 py-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Error State with Retry Button */}
      {isError && (
        <div className="p-6 text-center space-y-3">
          <AlertTriangle className="w-8 h-8 mx-auto text-rose-500" />
          <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
            {t('home.history_load_error')}
          </p>
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            {t('common.retry')}
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && displayedRecords.length === 0 && (
        <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs space-y-1">
          <p>{t('home.history_empty')}</p>
        </div>
      )}

      {/* Records List Directly on Home Screen */}
      {!isLoading && !isError && displayedRecords.length > 0 && (
        <div className="space-y-2.5">
          {displayedRecords.map((rec) => {
            const dayName = getDayOfWeekName(rec.date, language);
            const dateDisplay = formatDate(rec.date, language);

            return (
              <div
                key={rec.id}
                onClick={() => onSelectRecord(rec)}
                className="group p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 hover:border-emerald-200 dark:hover:border-emerald-800/60 transition-all cursor-pointer flex items-center justify-between"
              >
                {/* Left: Date, Shift, In/Out */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                      {dayName}, {dateDisplay}
                    </span>
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                      {rec.shiftCode}
                    </span>
                  </div>

                  {rec.status === 'OFF' ? (
                    <div className="text-xs text-slate-400 dark:text-slate-500">
                      {t('schedule.shift_off')}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3">
                      <span>
                        {t('home.check_in')}:{' '}
                        <strong className="text-slate-700 dark:text-slate-300 font-semibold">
                          {rec.checkInTime || t('common.not_clocked')}
                        </strong>
                      </span>
                      <span>•</span>
                      <span>
                        {t('home.check_out')}:{' '}
                        <strong className="text-slate-700 dark:text-slate-300 font-semibold">
                          {rec.checkOutTime || t('common.not_clocked')}
                        </strong>
                      </span>
                    </div>
                  )}
                </div>

                {/* Right: Status badge & Chevron */}
                <div className="flex items-center gap-2">
                  {getStatusBadge(rec.status)}
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Load More Button */}
      {!isLoading && hasMore && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setVisibleCount((prev) => prev + 5)}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 py-1.5 px-3 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
          >
            {t('common.load_more')} ({filteredRecords.length - visibleCount} ngày còn lại)
          </button>
        </div>
      )}
    </div>
  );
};
