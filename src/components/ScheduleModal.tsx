import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storageService';
import { formatDate, getDayOfWeekName } from '../utils/formatters';
import { Calendar as CalendarIcon, Info, X } from 'lucide-react';

interface ScheduleModalProps {
  onClose: () => void;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({ onClose }) => {
  const { language, t } = useAuth();
  const [shifts] = useState(() => storageService.getShifts());

  const legend = [
    { code: 'PC', label: t('schedule.shift_pc'), desc: 'Pha chế / Bartender' },
    { code: 'TN', label: t('schedule.shift_tn'), desc: 'Thu ngân / Điểm món' },
    { code: 'CB', label: t('schedule.shift_cb'), desc: 'Chuẩn bị / Sơ chế nguyên liệu' },
    { code: 'PV', label: t('schedule.shift_pv'), desc: 'Phục vụ / Chăm sóc bàn' },
    { code: 'DG', label: t('schedule.shift_dg'), desc: 'Dọn dẹp / Đóng cửa / Ca đêm' },
    { code: 'OFF', label: t('schedule.shift_off'), desc: 'Ngày nghỉ ca' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
              <CalendarIcon className="w-5 h-5" />
            </span>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {t('schedule.title')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-900/50 text-purple-900 dark:text-purple-300">
            {t('schedule.personal_only')}
          </div>

          {/* Roster List */}
          <div className="space-y-2.5">
            {shifts.map((s) => {
              const dayOfWeek = getDayOfWeekName(s.date, language);
              const dateText = formatDate(s.date, language);
              const isOff = s.shiftCode === 'OFF';

              return (
                <div
                  key={s.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                    isOff
                      ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-70'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900 dark:text-slate-100">
                      {dayOfWeek}, {dateText}
                    </div>
                    <div className="text-slate-500 dark:text-slate-400">
                      {isOff ? 'Nghỉ ca (OFF)' : `${s.startTime} - ${s.endTime}`}
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-xl font-bold text-xs ${
                      isOff
                        ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                    }`}
                  >
                    {s.shiftCode}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
              <Info className="w-4 h-4 text-slate-500" />
              <span>{t('schedule.legend_title')}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {legend.map((item) => (
                <div key={item.code} className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  <strong className="text-emerald-600 dark:text-emerald-400 font-bold block">
                    [{item.code}]
                  </strong>
                  <span className="text-slate-700 dark:text-slate-300">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
};
