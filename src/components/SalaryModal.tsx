import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storageService';
import { formatCurrencyVND } from '../utils/formatters';
import { DollarSign, AlertCircle, CheckCircle, Info, X } from 'lucide-react';

interface SalaryModalProps {
  onClose: () => void;
}

export const SalaryModal: React.FC<SalaryModalProps> = ({ onClose }) => {
  const { t } = useAuth();
  const [salary] = useState(() => storageService.getSalary());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </span>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {t('salary.title')} ({salary.month})
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
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Lương tạm tính Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md text-center">
            <div className="text-xs uppercase tracking-wider text-emerald-100 font-semibold mb-1">
              {t('salary.estimated_header')}
            </div>
            <div className="text-3xl font-extrabold tracking-tight">
              {formatCurrencyVND(salary.estimatedSalary)}
            </div>

            {salary.pendingShiftsCount > 0 ? (
              <div className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-full text-xs bg-white/20 text-white font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                {t('salary.pending_shifts', { count: salary.pendingShiftsCount })}
              </div>
            ) : (
              <div className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-full text-xs bg-emerald-800/60 text-white font-medium">
                <CheckCircle className="w-3.5 h-3.5" />
                {t('salary.settled')}
              </div>
            )}
          </div>

          {/* 5 dòng chi tiết theo đúng PDF */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
            <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
              <span>① {t('salary.shift_salary')}:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {formatCurrencyVND(salary.shiftSalary)}
              </span>
            </div>

            <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
              <span>② {t('salary.ot_salary')}:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                + {formatCurrencyVND(salary.approvedOvertimeSalary)}
              </span>
            </div>

            <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
              <span>③ {t('salary.bonus')}:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                + {formatCurrencyVND(salary.bonus)}
              </span>
            </div>

            <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
              <span>④ {t('salary.deductions')}:</span>
              <span className="font-bold text-rose-600 dark:text-rose-400">
                - {formatCurrencyVND(salary.deductions)}
              </span>
            </div>

            <div className="pt-2.5 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center font-extrabold text-sm text-slate-900 dark:text-white">
              <span>{t('salary.net_salary')} (Thực nhận):</span>
              <span className="text-emerald-600 dark:text-emerald-400 text-base">
                {formatCurrencyVND(salary.netSalary)}
              </span>
            </div>
          </div>

          {/* Note from PDF */}
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900/50 text-[11px] text-blue-800 dark:text-blue-300 space-y-1">
            <div className="flex items-center gap-1 font-bold">
              <Info className="w-3.5 h-3.5" />
              <span>{t('salary.formula_note')}</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400">
              {t('salary.settlement_note')}
            </p>
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
