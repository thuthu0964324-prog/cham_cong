import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { SupportMessage } from '../types';
import { storageService } from '../services/storageService';
import { MessageSquare, Send, KeyRound, CheckCircle2, X, RefreshCw } from 'lucide-react';

interface SupportChatModalProps {
  onClose: () => void;
  initialIdentifier?: string;
}

export const SupportChatModal: React.FC<SupportChatModalProps> = ({
  onClose,
  initialIdentifier = '',
}) => {
  const { user, t } = useAuth();
  const [messages, setMessages] = useState<SupportMessage[]>(() =>
    storageService.getSupportMessages()
  );

  // Form states if not logged in
  const [identifier, setIdentifier] = useState<string>(
    user ? user.employeeCode : initialIdentifier || ''
  );
  const [fullName, setFullName] = useState<string>(user ? user.name : '');
  const [inputText, setInputText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Cập nhật tin nhắn realtime
  useEffect(() => {
    const interval = setInterval(() => {
      setMessages(storageService.getSupportMessages());
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Gửi tin nhắn thông thường
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (!identifier.trim()) {
      alert('Vui lòng nhập Mã nhân viên hoặc số CCCD của bạn.');
      return;
    }

    setIsSubmitting(true);
    storageService.sendSupportMessage({
      senderId: user ? user.id : `guest_${identifier}`,
      senderRole: user?.role || 'STAFF',
      senderName: fullName.trim() || identifier.trim(),
      senderCodeOrCccd: identifier.trim(),
      message: inputText.trim(),
    });

    setInputText('');
    setMessages(storageService.getSupportMessages());
    setIsSubmitting(false);
  };

  // Nút nhanh: Gửi yêu cầu đặt lại mật khẩu
  const handleQuickResetRequest = () => {
    if (!identifier.trim()) {
      alert('Vui lòng nhập Mã nhân viên hoặc số CCCD để chủ quản biết cấp lại cho ai.');
      return;
    }

    const defaultMsg = `Chào chủ quản, tôi là ${fullName || identifier}. Tôi quên mật khẩu đăng nhập cá nhân, nhờ chủ quản hỗ trợ reset lại giúp tôi.`;

    storageService.sendSupportMessage({
      senderId: user ? user.id : `guest_${identifier}`,
      senderRole: 'STAFF',
      senderName: fullName.trim() || identifier.trim(),
      senderCodeOrCccd: identifier.trim(),
      message: defaultMsg,
      isResetRequest: true,
      isResolved: false,
    });

    setMessages(storageService.getSupportMessages());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col h-[600px] max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <MessageSquare className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Khung Chat Hỗ trợ & Quên mật khẩu
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gửi yêu cầu trực tiếp đến Chủ quản cửa hàng
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sender identification bar (nếu chưa đăng nhập) */}
        {!user && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/50 text-xs grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-amber-900 dark:text-amber-300 mb-0.5">
                Mã NV hoặc CCCD của bạn:
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Ví dụ: NV-1001 hoặc CCCD"
                className="w-full px-2.5 py-1.5 rounded-lg border border-amber-300 dark:border-amber-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-amber-900 dark:text-amber-300 mb-0.5">
                Họ và tên của bạn:
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ví dụ: Nguyễn Văn A"
                className="w-full px-2.5 py-1.5 rounded-lg border border-amber-300 dark:border-amber-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
              />
            </div>
          </div>
        )}

        {/* Messages List Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50 dark:bg-slate-950/40 text-xs">
          {/* Quick prompt button */}
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
            <div className="space-y-0.5 pr-2">
              <span className="font-bold text-emerald-800 dark:text-emerald-300 block">
                Bạn bị quên mật khẩu / mã tra cứu?
              </span>
              <span className="text-[11px] text-slate-600 dark:text-slate-400 block">
                Bấm nút bên cạnh để gửi yêu cầu reset mật khẩu đến Chủ quản ngay.
              </span>
            </div>
            <button
              onClick={handleQuickResetRequest}
              type="button"
              className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Gửi yêu cầu Reset</span>
            </button>
          </div>

          {messages.length === 0 ? (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500 space-y-1">
              <MessageSquare className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
              <p>Chưa có tin nhắn nào trong khung chat.</p>
              <p className="text-[11px]">Hãy nhập tin nhắn bên dưới để liên hệ với Chủ quản.</p>
            </div>
          ) : (
            messages.map((m) => {
              const isMe = user ? m.senderId === user.id : m.senderCodeOrCccd === identifier;
              const isSystem = m.senderRole === 'SYSTEM';
              const isManager = m.senderRole === 'MANAGER';

              if (isSystem) {
                return (
                  <div key={m.id} className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-300 text-[11px] space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-blue-700 dark:text-blue-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{m.senderName} ({m.timestamp})</span>
                    </div>
                    <p>{m.message}</p>
                  </div>
                );
              }

              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-0.5 px-1">
                    <span className="font-semibold text-slate-600 dark:text-slate-300">
                      {m.senderName} {isManager && '⭐ (Chủ quản)'}
                    </span>
                    <span>• {m.timestamp}</span>
                  </div>

                  <div
                    className={`max-w-[85%] p-3 rounded-2xl shadow-sm text-xs leading-relaxed ${
                      isMe
                        ? 'bg-emerald-600 text-white rounded-tr-none'
                        : isManager
                        ? 'bg-purple-600 text-white rounded-tl-none font-medium'
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-none'
                    }`}
                  >
                    {m.isResetRequest && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-white/20 text-white font-bold mb-1 block w-fit">
                        🔑 Yêu cầu đặt lại mật khẩu
                      </span>
                    )}
                    <p>{m.message}</p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Nhập nội dung cần hỗ trợ hoặc trao đổi với Chủ quản..."
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isSubmitting}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md active:scale-95 transition-all flex items-center gap-1.5 disabled:bg-slate-300 dark:disabled:bg-slate-700"
          >
            {isSubmitting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Gửi</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
