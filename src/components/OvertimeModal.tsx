import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { OvertimeRequest, OvertimeStatus } from '../types';
import { storageService } from '../services/storageService';
import { attendanceService } from '../services/attendanceService';
import { Clock, Send, CheckCircle2, XCircle, AlertCircle, Calendar, PlusCircle, ListFilter, X, ShieldAlert } from 'lucide-react';

interface OvertimeModalProps {
  onClose: () => void;
}

export const OvertimeModal: React.FC<OvertimeModalProps> = ({ onClose }) => {
  const { user, t } = useAuth();
  const [tab, setTab] = useState<'NEW' | 'LIST'>('NEW');

  // Form states
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [startHour, setStartHour] = useState<number>(18);
  const [endHour, setEndHour] = useState<number>(21);
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [msg, setMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // List of requests
  const [requests, setRequests] = useState<OvertimeRequest[]>(() =>
    storageService.getOvertimeRequests()
  );

  const hoursCalculated = Math.max(0, endHour - startHour);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setMsg({ text: 'Vui lòng nhập lý do tăng ca chi tiết.', isError: true });
      return;
    }
    if (hoursCalculated <= 0) {
      setMsg({ text: 'Giờ kết thúc phải lớn hơn giờ bắt đầu.', isError: true });
      return;
    }

    setIsSubmitting(true);
    setMsg(null);

    const res = await attendanceService.submitOvertime({
      employeeId: user?.id || 'emp_01',
      employeeName: user?.name || 'Nhân viên',
      employeeCode: user?.employeeCode || 'NV-1001',
      date,
      startTime: `${String(startHour).padStart(2, '0')}:00`,
      endTime: `${String(endHour).padStart(2, '0')}:00`,
      hours: hoursCalculated,
      reason: reason.trim(),
    });

    setIsSubmitting(false);

    if (res.success) {
      setMsg({ text: 'Đã gửi đơn tăng ca thành công! Vui lòng theo dõi tiến độ duyệt.', isError: false });
      setReason('');
      setRequests(storageService.getOvertimeRequests());
      setTab('LIST');
    } else {
      setMsg({ text: res.error || 'Có lỗi xảy ra', isError: true });
    }
  };

  const getStatusBadge = (status: OvertimeStatus) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {t('overtime.status_approved')}
          </span>
        );
      case 'PENDING_STORE_MANAGER':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
            <Clock className="w-3.5 h-3.5" />
            {t('overtime.status_store_pending')}
          </span>
        );
      case 'PENDING_SUPERVISOR':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
            <Clock className="w-3.5 h-3.5" />
            {t('overtime.status_supervisor_pending')}
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300">
            <XCircle className="w-3.5 h-3.5" />
            {t('overtime.status_rejected')}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400">
              <Clock className="w-5 h-5" />
            </span>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {t('overtime.title')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 px-5 pt-2">
          <button
            onClick={() => setTab('NEW')}
            className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors ${
              tab === 'NEW'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            {t('overtime.new_request')}
          </button>
          <button
            onClick={() => setTab('LIST')}
            className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors ${
              tab === 'LIST'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <ListFilter className="w-4 h-4" />
            {t('overtime.my_requests')} ({requests.length})
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {tab === 'NEW' ? (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Notice */}
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{t('overtime.rule_notice')}</span>
              </div>

              {/* Ngày tăng ca */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('overtime.date')}:
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Giờ chẵn: Bắt đầu & Kết thúc */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('overtime.start_time')}:
                  </label>
                  <select
                    value={startHour}
                    onChange={(e) => setStartHour(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    {Array.from({ length: 24 }).map((_, i) => (
                      <option key={i} value={i}>
                        {String(i).padStart(2, '0')}:00
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('overtime.end_time')}:
                  </label>
                  <select
                    value={endHour}
                    onChange={(e) => setEndHour(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    {Array.from({ length: 24 }).map((_, i) => (
                      <option key={i} value={i}>
                        {String(i).padStart(2, '0')}:00
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Total hours */}
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 flex justify-between items-center font-bold">
                <span className="text-slate-600 dark:text-slate-400">{t('overtime.hours_count')}:</span>
                <span className="text-emerald-600 dark:text-emerald-400 text-sm">
                  {hoursCalculated} giờ
                </span>
              </div>

              {/* Lý do bắt buộc */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('overtime.reason')}:
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={t('overtime.reason_placeholder')}
                  required
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              {msg && (
                <div
                  className={`p-3 rounded-xl flex items-center gap-2 ${
                    msg.isError
                      ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                      : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
                  }`}
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{msg.text}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? t('attendance.submitting') : t('overtime.submit_btn')}</span>
              </button>
            </form>
          ) : (
            <div className="space-y-3">
              {requests.length === 0 ? (
                <p className="text-center py-8 text-slate-400 text-xs">{t('overtime.empty')}</p>
              ) : (
                requests.map((ot) => (
                  <div
                    key={ot.id}
                    className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {ot.date} • {ot.startTime} - {ot.endTime} ({ot.hours}h)
                      </span>
                      {getStatusBadge(ot.status)}
                    </div>
                    <div className="text-slate-600 dark:text-slate-400">
                      <strong>Lý do:</strong> {ot.reason}
                    </div>
                    {ot.rejectReason && (
                      <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-medium">
                        <strong>Lý do từ chối:</strong> {ot.rejectReason}
                      </div>
                    )}
                    <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                      Gửi lúc: {ot.createdAt}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
