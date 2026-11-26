import React from 'react';
import { useAuth } from '../context/AuthContext';
import { AttendanceRecord } from '../types';
import { formatDate, getDayOfWeekName } from '../utils/formatters';
import { X, MapPin, CheckCircle, AlertTriangle, ShieldCheck, User } from 'lucide-react';

interface RecordDetailModalProps {
  record: AttendanceRecord;
  onClose: () => void;
}

export const RecordDetailModal: React.FC<RecordDetailModalProps> = ({ record, onClose }) => {
  const { user, language, t } = useAuth();

  const dayName = getDayOfWeekName(record.date, language);
  const dateStr = formatDate(record.date, language);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Chi tiết bản ghi chấm công
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {dayName}, {dateStr}
            </p>
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
          {/* Identity & Shift Banner */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Nhân viên:
              </span>
              <strong className="text-slate-800 dark:text-slate-200 font-semibold">
                {user?.name} ({user?.employeeCode})
              </strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Ca làm việc:</span>
              <strong className="text-slate-800 dark:text-slate-200 font-semibold">
                {record.shiftName} [{record.shiftCode}]
              </strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Trạng thái đối soát:</span>
              {record.reviewStatus === 'VERIFIED' ? (
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" /> Đã đối soát hợp lệ
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-amber-500 font-bold">
                  <AlertTriangle className="w-3.5 h-3.5" /> Đang chờ quản lý đối soát
                </span>
              )}
            </div>
          </div>

          {/* Vào ca (Check In) */}
          <div className="p-3.5 rounded-2xl border border-emerald-100 dark:border-emerald-950/60 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-2">
            <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
              <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                <CheckCircle className="w-4 h-4" /> {t('home.check_in')}
              </span>
              <span>{record.checkInTime || t('common.not_clocked')}</span>
            </div>

            {record.checkInLat && (
              <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5 pt-1 border-t border-emerald-100 dark:border-emerald-900/40">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-600" />
                  <span>
                    GPS: {record.checkInLat.toFixed(5)}, {record.checkInLng?.toFixed(5)}
                  </span>
                </div>
                <div>Độ chính xác: ±{record.checkInAccuracy || 15}m (Hợp lệ trong bán kính)</div>
              </div>
            )}
          </div>

          {/* Tan ca (Check Out) */}
          <div className="p-3.5 rounded-2xl border border-blue-100 dark:border-blue-950/60 bg-blue-50/40 dark:bg-blue-950/20 space-y-2">
            <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
              <span className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400">
                <CheckCircle className="w-4 h-4" /> {t('home.check_out')}
              </span>
              <span>{record.checkOutTime || t('common.not_clocked')}</span>
            </div>

            {record.checkOutLat ? (
              <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5 pt-1 border-t border-blue-100 dark:border-blue-900/40">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-blue-600" />
                  <span>
                    GPS: {record.checkOutLat.toFixed(5)}, {record.checkOutLng?.toFixed(5)}
                  </span>
                </div>
                <div>Độ chính xác: ±{record.checkOutAccuracy || 15}m (Hợp lệ trong bán kính)</div>
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 italic">
                Chưa có dữ liệu tan ca hoặc chưa chấm tan ca.
              </p>
            )}
          </div>

          {/* Note if any */}
          {record.note && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Ghi chú hệ thống: {record.note}</span>
            </div>
          )}
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
