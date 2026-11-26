import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LANGUAGE_NAMES } from '../i18n';
import { AttendanceRecord, Employee, Language, OvertimeRequest, SupportMessage, Theme } from '../types';
import { storageService } from '../services/storageService';
import { attendanceService } from '../services/attendanceService';
import { ManagerSettingsModal } from './ManagerSettingsModal';
import { LanguageSelector } from './LanguageSelector';
import { 
  ShieldCheck, 
  Users, 
  Clock, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  KeyRound, 
  LogOut, 
  Globe, 
  Sun, 
  Moon, 
  Monitor, 
  Send, 
  Camera, 
  MapPin, 
  AlertCircle,
  Settings
} from 'lucide-react';

export const ManagerDashboard: React.FC = () => {
  const { user, language, setLanguage, logout, t } = useAuth();
  const { theme, setTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<'ATTENDANCE' | 'CHAT' | 'OVERTIME' | 'STAFF'>('ATTENDANCE');
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);

  // Realtime state
  const [history, setHistory] = useState<AttendanceRecord[]>(() => storageService.getAttendanceHistory());
  const [messages, setMessages] = useState<SupportMessage[]>(() => storageService.getSupportMessages());
  const [overtimes, setOvertimes] = useState<OvertimeRequest[]>(() => storageService.getOvertimeRequests());
  const [accounts, setAccounts] = useState<Employee[]>(() => storageService.getAccounts().filter((a) => a.role === 'STAFF'));

  // Chat reply state
  const [replyText, setReplyText] = useState<string>('');

  // Tự động đồng bộ mỗi 2 giây
  useEffect(() => {
    const timer = setInterval(() => {
      setHistory(storageService.getAttendanceHistory());
      setMessages(storageService.getSupportMessages());
      setOvertimes(storageService.getOvertimeRequests());
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  // Xử lý Reset mật khẩu cho nhân viên
  const handleResetPassword = (msgId: string, employeeCodeOrCccd: string) => {
    const confirmReset = window.confirm(
      `Bạn có chắc chắn muốn đặt lại mật khẩu cho nhân viên [${employeeCodeOrCccd}] về mật khẩu mặc định: TEAYOO không?`
    );
    if (!confirmReset) return;

    const ok = storageService.resolveResetRequest(msgId, employeeCodeOrCccd);
    if (ok) {
      alert(`Đã đặt lại mật khẩu của [${employeeCodeOrCccd}] thành TEAYOO!`);
      setMessages(storageService.getSupportMessages());
    } else {
      alert('Không tìm thấy tài khoản nhân viên tương ứng.');
    }
  };

  // Trả lời tin nhắn của nhân viên
  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    storageService.sendSupportMessage({
      senderId: user?.id || 'mgr_01',
      senderRole: 'MANAGER',
      senderName: user?.name || 'Chủ quản',
      senderCodeOrCccd: user?.employeeCode || 'CQ-8888',
      message: replyText.trim(),
    });

    setReplyText('');
    setMessages(storageService.getSupportMessages());
  };

  // Duyệt đơn tăng ca
  const handleReviewOt = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    let reason = '';
    if (status === 'REJECTED') {
      reason = prompt('Nhập lý do từ chối đơn tăng ca:') || 'Không phù hợp với kế hoạch cửa hàng';
    }
    await attendanceService.reviewOvertime(id, status, reason);
    setOvertimes(storageService.getOvertimeRequests());
  };

  const pendingResetCount = messages.filter((m) => m.isResetRequest && !m.isResolved).length;
  const pendingOtCount = overtimes.filter((o) => o.status === 'PENDING_STORE_MANAGER').length;

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors pb-12">
      {/* 1. Top Header Chủ Quản */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 sticky top-0 z-30 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center text-white font-extrabold text-sm shadow-md">
              CQ
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                  Cổng Quản Trị Chủ Quản
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                  {user?.employeeCode}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {user?.name} • {user?.storeName}
              </p>
            </div>
          </div>

          {/* Quick controls: Ngôn ngữ, Theme, Đăng xuất */}
          <div className="flex items-center gap-2">
            {/* Shared Language Selector */}
            <LanguageSelector />

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Đổi giao diện"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Nút Cài đặt Bánh Răng cho Chủ Quản */}
            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Cài đặt Chủ quản (Ngôn ngữ, Giao diện, Dữ liệu, Hướng dẫn)"
            >
              <Settings className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </button>

            {/* Logout */}
            <button
              onClick={() => {
                if (window.confirm('Bạn có chắc chắn muốn đăng xuất khỏi quyền Chủ quản?')) {
                  logout();
                }
              }}
              className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Tab Navigation */}
      <div className="max-w-4xl mx-auto px-4 pt-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-xs font-bold">
          <button
            onClick={() => setActiveTab('ATTENDANCE')}
            className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
              activeTab === 'ATTENDANCE'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Theo dõi Chấm công</span>
          </button>

          <button
            onClick={() => setActiveTab('CHAT')}
            className={`relative py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
              activeTab === 'CHAT'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Chat & Quên mật khẩu</span>
            {pendingResetCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center animate-bounce">
                {pendingResetCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('OVERTIME')}
            className={`relative py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
              activeTab === 'OVERTIME'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            <span>Duyệt Tăng ca</span>
            {pendingOtCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] flex items-center justify-center">
                {pendingOtCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('STAFF')}
            className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
              activeTab === 'STAFF'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Nhân sự ({accounts.length})</span>
          </button>
        </div>
      </div>

      {/* 3. Main Content Container */}
      <main className="max-w-4xl mx-auto px-4 pt-4 space-y-4">
        {/* TAB 1: THEO DÕI CHẤM CÔNG THỜI GIAN THỰC */}
        {activeTab === 'ATTENDANCE' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Bảng Theo Dõi Chấm Công Hôm Nay
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Dữ liệu cập nhật thời gian thực khi nhân viên thao tác Vào ca / Tan ca
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Trực tuyến
              </span>
            </div>

            {/* Trạng thái khung sườn rỗng nếu chưa có ai chấm công */}
            {history.length === 0 ? (
              <div className="py-12 text-center space-y-2 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                <Clock className="w-10 h-10 mx-auto text-slate-400" />
                <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300">
                  Khung sườn đã sẵn sàng (Chưa có bản ghi chấm công)
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Hệ thống đã reset sạch dữ liệu. Khi nhân viên đăng nhập tài khoản (ví dụ NV-1001) và bấm 
                  <strong> "Vào ca"</strong> hoặc <strong>"Tan ca"</strong>, bản ghi thực tế sẽ lập tức xuất hiện tại đây.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <strong className="text-sm font-bold text-slate-900 dark:text-white">
                          {rec.employeeName}
                        </strong>
                        <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold text-[11px]">
                          {rec.employeeCode}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400">• {rec.date}</span>
                      </div>

                      <div className="text-slate-600 dark:text-slate-300 font-medium">
                        Ca làm: <strong>{rec.shiftName}</strong>
                      </div>

                      <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 text-[11px] pt-1">
                        <span>
                          Vào ca: <strong className="text-emerald-600">{rec.checkInTime || 'Chưa chấm'}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Tan ca: <strong className="text-blue-600">{rec.checkOutTime || 'Chưa chấm'}</strong>
                        </span>
                        {rec.checkInAccuracy && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-emerald-500" /> GPS ±{rec.checkInAccuracy}m
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {rec.status === 'COMPLETED' ? (
                        <span className="px-3 py-1 rounded-full font-bold text-xs bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 inline-flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Hoàn thành ca
                        </span>
                      ) : rec.status === 'IN_PROGRESS' ? (
                        <span className="px-3 py-1 rounded-full font-bold text-xs bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 animate-spin" /> Đang trong ca làm
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full font-bold text-xs bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 inline-flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> {rec.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: KHUNG CHAT & XỬ LÝ QUÊN MẬT KHẨU */}
        {activeTab === 'CHAT' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Hộp Thư Tiếp Nhận & Đặt Lại Mật Khẩu
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Nhân viên quên mật khẩu gửi yêu cầu vào đây. Chủ quản bấm duyệt để đặt lại mật khẩu về mặc định (TEAYOO).
              </p>
            </div>

            {/* Danh sách tin nhắn */}
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1 text-xs">
              {messages.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-1">
                  <MessageSquare className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
                  <p>Chưa có tin nhắn hoặc yêu cầu hỗ trợ nào từ nhân viên.</p>
                </div>
              ) : (
                messages.map((m) => {
                  const isManager = m.senderRole === 'MANAGER';
                  const isSystem = m.senderRole === 'SYSTEM';

                  if (isSystem) {
                    return (
                      <div key={m.id} className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-300 text-[11px]">
                        <strong>{m.senderName}:</strong> {m.message} ({m.timestamp})
                      </div>
                    );
                  }

                  return (
                    <div
                      key={m.id}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isManager
                          ? 'bg-purple-50/60 dark:bg-purple-950/30 border-purple-200 dark:border-purple-900/60'
                          : m.isResetRequest && !m.isResolved
                          ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 ring-1 ring-amber-400'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <strong className="text-slate-900 dark:text-white font-bold">
                            {m.senderName}
                          </strong>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            {m.senderCodeOrCccd}
                          </span>
                          <span className="text-slate-400 text-[10px]">• {m.timestamp}</span>
                        </div>

                        {m.isResetRequest && (
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              m.isResolved
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800 animate-pulse'
                            }`}
                          >
                            {m.isResolved ? '✅ Đã Reset' : '🔑 Cần Reset Mật Khẩu'}
                          </span>
                        )}
                      </div>

                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-2">
                        {m.message}
                      </p>

                      {/* Nút bấm Reset Mật khẩu cho nhân viên */}
                      {m.isResetRequest && !m.isResolved && (
                        <div className="pt-2 border-t border-amber-200 dark:border-amber-800/60 flex items-center justify-between">
                          <span className="text-[11px] text-amber-800 dark:text-amber-300 font-medium">
                            Xác nhận cấp lại mật khẩu về mặc định (TEAYOO):
                          </span>
                          <button
                            onClick={() => handleResetPassword(m.id, m.senderCodeOrCccd)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                            <span>Phê duyệt & Đặt lại mật khẩu</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Trả lời tin nhắn */}
            <form onSubmit={handleSendReply} className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Nhập tin nhắn phản hồi tới nhân viên..."
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="submit"
                disabled={!replyText.trim()}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md disabled:bg-slate-300 dark:disabled:bg-slate-700"
              >
                <Send className="w-4 h-4" />
                <span>Gửi</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: DUYỆT ĐƠN TĂNG CA */}
        {activeTab === 'OVERTIME' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Danh Sách Đơn Tăng Ca Chờ Phê Duyệt
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Chỉ những đơn được Chủ quản phê duyệt mới được tự động tính vào lương tháng
              </p>
            </div>

            {overtimes.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                Hiện chưa có đơn đăng ký tăng ca nào từ nhân viên.
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                {overtimes.map((ot) => (
                  <div
                    key={ot.id}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-sm font-bold text-slate-900 dark:text-white">
                        {ot.date} • {ot.startTime} - {ot.endTime} ({ot.hours} giờ)
                      </strong>
                      <span className="font-bold text-purple-600 dark:text-purple-400">
                        {ot.status}
                      </span>
                    </div>

                    <p className="text-slate-600 dark:text-slate-300">
                      <strong>Lý do:</strong> {ot.reason}
                    </p>

                    {ot.status === 'PENDING_STORE_MANAGER' && (
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex gap-2 justify-end">
                        <button
                          onClick={() => handleReviewOt(ot.id, 'REJECTED')}
                          className="px-3 py-1.5 rounded-xl border border-rose-300 text-rose-700 font-bold hover:bg-rose-50"
                        >
                          Từ chối
                        </button>
                        <button
                          onClick={() => handleReviewOt(ot.id, 'APPROVED')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700"
                        >
                          Phê duyệt
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: DANH SÁCH NHÂN SỰ */}
        {activeTab === 'STAFF' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Danh Sách Nhân Viên Thuộc Cửa Hàng
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Quản lý mã định danh, CCCD và tình trạng tài khoản nhân sự
              </p>
            </div>

            <div className="space-y-3 text-xs">
              {accounts.map((acc) => (
                <div
                  key={acc.id}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <strong className="text-sm font-bold text-slate-900 dark:text-white">
                      {acc.name}
                    </strong>
                    <div className="text-slate-500">
                      Mã NV: <span className="font-bold text-purple-600">{acc.employeeCode}</span> • CCCD: {acc.displayCccd}
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                    Đang hoạt động
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modal Cài Đặt Chủ Quản */}
      {showSettingsModal && (
        <ManagerSettingsModal
          onClose={() => {
            setShowSettingsModal(false);
            setAccounts(storageService.getAccounts().filter((a) => a.role === 'STAFF'));
          }}
        />
      )}
    </div>
  );
};
