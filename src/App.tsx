import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { TodayShiftCard } from './components/TodayShiftCard';
import { HistoryList } from './components/HistoryList';
import { AttendanceModal } from './components/AttendanceModal';
import { OvertimeModal } from './components/OvertimeModal';
import { SalaryModal } from './components/SalaryModal';
import { ScheduleModal } from './components/ScheduleModal';
import { SettingsModal } from './components/SettingsModal';
import { RecordDetailModal } from './components/RecordDetailModal';
import { SupportChatModal } from './components/SupportChatModal';
import { LoginScreen } from './components/LoginScreen';
import { ManagerDashboard } from './components/ManagerDashboard';
import { ManagerSetupWizard } from './components/ManagerSetupWizard';
import { AttendanceRecord, WorkShift } from './types';
import { attendanceService } from './services/attendanceService';
import { storageService } from './services/storageService';
import { Calendar, Clock, DollarSign, MessageSquare } from 'lucide-react';

export default function App() {
  const { user, t } = useAuth();

  // State ca làm hôm nay
  const [shifts] = useState<WorkShift[]>(() => storageService.getShifts());
  const todayShift = shifts[0];

  // State lịch sử chấm công
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(true);
  const [isHistoryError, setIsHistoryError] = useState<boolean>(false);

  // Modals state
  const [attendanceType, setAttendanceType] = useState<'IN' | 'OUT' | null>(null);
  const [showOvertimeModal, setShowOvertimeModal] = useState<boolean>(false);
  const [showSalaryModal, setShowSalaryModal] = useState<boolean>(false);
  const [showScheduleModal, setShowScheduleModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showSupportChatModal, setShowSupportChatModal] = useState<boolean>(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);

  // Tải danh sách lịch sử của nhân viên hiện tại
  const fetchHistory = useCallback(async () => {
    if (!user) return;
    setIsLoadingHistory(true);
    setIsHistoryError(false);
    try {
      const records = await attendanceService.getRecentHistory(user.id);
      setHistory(records);
    } catch {
      setIsHistoryError(true);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && user.role === 'STAFF') {
      fetchHistory();
    }
  }, [user, fetchHistory]);

  // Nếu chưa đăng nhập -> Chuyển sang màn hình Đăng nhập
  if (!user) {
    return <LoginScreen />;
  }

  // NẾU LÀ CHỦ QUẢN (MANAGER):
  if (user.role === 'MANAGER') {
    // Nếu chưa hoàn tất thiết lập lần đầu -> Hiển thị Wizard thiết lập
    if (!user.isSetupCompleted) {
      return (
        <ManagerSetupWizard
          onComplete={() => {
            window.location.reload();
          }}
        />
      );
    }
    // Đã hoàn tất thiết lập -> Vào Trang chính Chủ quản
    return <ManagerDashboard />;
  }

  // NẾU LÀ NHÂN VIÊN (STAFF) -> HIỂN THỊ GIAO DIỆN NHÂN VIÊN
  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecord = history.find(
    (r) => r.date === todayStr && r.shiftId === todayShift.id && r.employeeId === user.id
  );

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors pb-12">
      {/* 1. Header & Greeting */}
      <Header
        onOpenSettings={() => setShowSettingsModal(true)}
        onOpenChat={() => setShowSupportChatModal(true)}
      />

      {/* 2. Main Container */}
      <main className="max-w-2xl mx-auto px-4 pt-4 space-y-4">
        {/* Khối Chấm công Hôm nay */}
        <TodayShiftCard
          todayShift={todayShift}
          todayRecord={todayRecord}
          onClockIn={() => setAttendanceType('IN')}
          onClockOut={() => setAttendanceType('OUT')}
        />

        {/* Khối 3 Lối tắt Chức năng */}
        <div className="grid grid-cols-3 gap-2.5">
          {/* Lịch làm việc */}
          <button
            onClick={() => setShowScheduleModal(true)}
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-purple-300 dark:hover:border-purple-800 hover:bg-purple-50/30 dark:hover:bg-purple-950/20 active:scale-95 transition-all text-center"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-2">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
              {t('home.action_schedule')}
            </span>
          </button>

          {/* Đăng ký tăng ca */}
          <button
            onClick={() => setShowOvertimeModal(true)}
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-orange-300 dark:hover:border-orange-800 hover:bg-orange-50/30 dark:hover:bg-orange-950/20 active:scale-95 transition-all text-center"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-2">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
              {t('home.action_overtime')}
            </span>
          </button>

          {/* Tra lương */}
          <button
            onClick={() => setShowSalaryModal(true)}
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-emerald-300 dark:hover:border-emerald-800 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 active:scale-95 transition-all text-center"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
              {t('home.action_salary')}
            </span>
          </button>
        </div>

        {/* Nút Chat Hỗ trợ & Quên mật khẩu trực tiếp trên Home */}
        <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <MessageSquare className="w-4 h-4" />
            </span>
            <div>
              <strong className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Cần hỗ trợ hoặc quên mã tra cứu?
              </strong>
              <span className="text-[11px] text-slate-500">
                Gửi tin nhắn trực tiếp đến Chủ quản cửa hàng
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowSupportChatModal(true)}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
          >
            Mở Chat
          </button>
        </div>

        {/* Khối LỊCH SỬ CHẤM CÔNG (KHUNG SƯỜN: CHỈ SINH DỮ LIỆU KHI CHẤM CÔNG THỰC TẾ) */}
        <HistoryList
          records={history}
          isLoading={isLoadingHistory}
          isError={isHistoryError}
          onRetry={fetchHistory}
          onSelectRecord={(rec) => setSelectedRecord(rec)}
        />
      </main>

      {/* --- CÁC MODAL HỆ THỐNG --- */}

      {/* Modal Chấm công Vào/Tan ca (Camera + GPS) */}
      {attendanceType && (
        <AttendanceModal
          type={attendanceType}
          shift={todayShift}
          onClose={() => setAttendanceType(null)}
          onSuccess={() => {
            fetchHistory();
          }}
        />
      )}

      {/* Modal Khung Chat Hỗ trợ */}
      {showSupportChatModal && (
        <SupportChatModal onClose={() => setShowSupportChatModal(false)} />
      )}

      {/* Modal Đăng ký tăng ca */}
      {showOvertimeModal && (
        <OvertimeModal onClose={() => setShowOvertimeModal(false)} />
      )}

      {/* Modal Tra cứu lương */}
      {showSalaryModal && (
        <SalaryModal onClose={() => setShowSalaryModal(false)} />
      )}

      {/* Modal Lịch làm việc */}
      {showScheduleModal && (
        <ScheduleModal onClose={() => setShowScheduleModal(false)} />
      )}

      {/* Modal Cài đặt & Đổi mã */}
      {showSettingsModal && (
        <SettingsModal onClose={() => setShowSettingsModal(false)} />
      )}

      {/* Modal Chi tiết bản ghi chấm công */}
      {selectedRecord && (
        <RecordDetailModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      )}
    </div>
  );
}
