import { AttendanceRecord, Employee, MonthlySalary, OvertimeRequest, SupportMessage, WorkShift } from '../types';
import { INITIAL_ACCOUNTS, INITIAL_HISTORY, INITIAL_OVERTIME, INITIAL_SALARY_TEMPLATE, INITIAL_SHIFTS, INITIAL_SUPPORT_MESSAGES } from './mockData';

const KEYS = {
  CURRENT_USER: 'app_current_user',
  ACCOUNTS: 'app_accounts_v2',
  REMEMBER_ME: 'app_remember_me',
  ATTENDANCE_HISTORY: 'app_attendance_history_v2',
  OVERTIME_REQUESTS: 'app_overtime_requests_v2',
  SUPPORT_MESSAGES: 'app_support_messages_v2',
  SHIFTS: 'app_shifts_v2',
};

export const storageService = {
  // --- ACCOUNTS & AUTH ---
  getAccounts(): Employee[] {
    const raw = localStorage.getItem(KEYS.ACCOUNTS);
    if (!raw) {
      localStorage.setItem(KEYS.ACCOUNTS, JSON.stringify(INITIAL_ACCOUNTS));
      return INITIAL_ACCOUNTS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_ACCOUNTS;
    }
  },

  saveAccounts(accounts: Employee[]): void {
    localStorage.setItem(KEYS.ACCOUNTS, JSON.stringify(accounts));
  },

  findAccountByIdentifier(identifier: string): Employee | undefined {
    const clean = identifier.trim().toUpperCase();
    const accounts = this.getAccounts();
    return accounts.find(
      (acc) =>
        acc.employeeCode.toUpperCase() === clean ||
        acc.cccd === identifier.trim()
    );
  },

  getCurrentUser(): Employee | null {
    const raw = localStorage.getItem(KEYS.CURRENT_USER);
    return raw ? JSON.parse(raw) : null;
  },

  setCurrentUser(user: Employee, remember: boolean): void {
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
    localStorage.setItem(KEYS.REMEMBER_ME, String(remember));
  },

  clearSession(): void {
    localStorage.removeItem(KEYS.CURRENT_USER);
  },

  // Hoàn tất luồng thiết lập lần đầu cho Chủ quản
  completeManagerSetup(params: {
    managerId: string;
    storeName: string;
    branchName: string;
    managerName: string;
    newPassword?: string;
  }): boolean {
    const accounts = this.getAccounts();
    const updated = accounts.map((acc) => {
      if (acc.id === params.managerId) {
        return {
          ...acc,
          storeName: params.storeName.trim(),
          branchName: params.branchName.trim(),
          name: params.managerName.trim(),
          password: params.newPassword ? params.newPassword.trim() : acc.password,
          isSetupCompleted: true,
        };
      }
      return acc;
    });

    this.saveAccounts(updated);

    const curr = this.getCurrentUser();
    if (curr && curr.id === params.managerId) {
      const updatedUser: Employee = {
        ...curr,
        storeName: params.storeName.trim(),
        branchName: params.branchName.trim(),
        name: params.managerName.trim(),
        password: params.newPassword ? params.newPassword.trim() : curr.password,
        isSetupCompleted: true,
      };
      this.setCurrentUser(updatedUser, true);
    }
    return true;
  },

  // Cập nhật thông tin cửa hàng / chi nhánh / quản lý từ Cài đặt
  updateStoreInfo(params: {
    managerId: string;
    storeName: string;
    branchName: string;
    managerName: string;
  }): boolean {
    return this.completeManagerSetup(params);
  },

  // Quản lý Nhân sự theo cửa hàng
  getStaffList(storeId: string): Employee[] {
    const accounts = this.getAccounts();
    return accounts.filter((a) => a.role === 'STAFF' && a.storeId === storeId);
  },

  // Thêm 1 nhân viên lẻ
  addSingleStaff(storeId: string, branchName: string, staff: { name: string; position: string; cccd: string; employeeCode?: string }): { success: boolean; error?: string } {
    const cleanCccd = String(staff.cccd).trim();
    const accounts = this.getAccounts();

    if (accounts.some((a) => a.cccd === cleanCccd)) {
      return { success: false, error: `Số CCCD ${cleanCccd} đã tồn tại trong hệ thống.` };
    }

    const code = staff.employeeCode?.trim() || `NV-${Math.floor(1000 + Math.random() * 9000)}`;
    if (accounts.some((a) => a.employeeCode.toUpperCase() === code.toUpperCase())) {
      return { success: false, error: `Mã nhân viên ${code} đã tồn tại.` };
    }

    const newEmp: Employee = {
      id: `emp_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name: staff.name.trim(),
      cccd: cleanCccd,
      displayCccd: cleanCccd.length >= 8 ? `${cleanCccd.slice(0, 4)}******${cleanCccd.slice(-2)}` : cleanCccd,
      employeeCode: code,
      storeId,
      storeName: 'TEAYOO',
      branchName,
      position: staff.position.trim(),
      role: 'STAFF',
      password: 'TEAYOO',
      isSetupCompleted: true,
    };

    this.saveAccounts([...accounts, newEmp]);
    return { success: true };
  },

  // Cập nhật thông tin 1 nhân viên
  updateSingleStaff(staffId: string, data: { name?: string; position?: string; employeeCode?: string; cccd?: string }): boolean {
    const accounts = this.getAccounts();
    const updated = accounts.map((acc) => {
      if (acc.id === staffId) {
        const nextCccd = data.cccd ? String(data.cccd).trim() : acc.cccd;
        return {
          ...acc,
          name: data.name !== undefined ? data.name.trim() : acc.name,
          position: data.position !== undefined ? data.position.trim() : acc.position,
          employeeCode: data.employeeCode !== undefined ? data.employeeCode.trim() : acc.employeeCode,
          cccd: nextCccd,
          displayCccd: nextCccd.length >= 8 ? `${nextCccd.slice(0, 4)}******${nextCccd.slice(-2)}` : nextCccd,
        };
      }
      return acc;
    });
    this.saveAccounts(updated);
    return true;
  },

  // Nhập hàng loạt danh sách nhân sự (Hỗ trợ bỏ qua hoặc cập nhật)
  importStaffBatch(
    storeId: string,
    branchName: string,
    items: { name: string; position: string; cccd: string; employeeCode?: string }[],
    mode: 'SKIP_EXISTING' | 'UPDATE_EXISTING'
  ): { added: number; updated: number; skipped: number } {
    let accounts = [...this.getAccounts()];
    let added = 0;
    let updated = 0;
    let skipped = 0;

    items.forEach((item) => {
      const cleanCccd = String(item.cccd).trim();
      const cleanCode = item.employeeCode?.trim();

      const existingIndex = accounts.findIndex(
        (a) => a.cccd === cleanCccd || (cleanCode && a.employeeCode.toUpperCase() === cleanCode.toUpperCase())
      );

      if (existingIndex >= 0) {
        if (mode === 'UPDATE_EXISTING') {
          accounts[existingIndex] = {
            ...accounts[existingIndex],
            name: item.name.trim() || accounts[existingIndex].name,
            position: item.position.trim() || accounts[existingIndex].position,
            employeeCode: cleanCode || accounts[existingIndex].employeeCode,
          };
          updated++;
        } else {
          skipped++;
        }
      } else {
        const newEmp: Employee = {
          id: `emp_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
          name: item.name.trim(),
          cccd: cleanCccd,
          displayCccd: cleanCccd.length >= 8 ? `${cleanCccd.slice(0, 4)}******${cleanCccd.slice(-2)}` : cleanCccd,
          employeeCode: cleanCode || `NV-${Math.floor(1000 + Math.random() * 9000)}`,
          storeId,
          storeName: 'TEAYOO',
          branchName,
          position: item.position.trim(),
          role: 'STAFF',
          password: 'TEAYOO',
          isSetupCompleted: true,
        };
        accounts.push(newEmp);
        added++;
      }
    });

    this.saveAccounts(accounts);
    return { added, updated, skipped };
  },

  // Đặt lại mật khẩu cho nhân viên (Do chủ quản bấm hoặc nhân viên tự đổi)
  updatePassword(identifier: string, newPass: string): boolean {
    const accounts = this.getAccounts();
    const target = this.findAccountByIdentifier(identifier);
    if (!target) return false;

    const updated = accounts.map((acc) => {
      if (acc.id === target.id) {
        return { ...acc, password: newPass };
      }
      return acc;
    });

    this.saveAccounts(updated);

    // Cập nhật session nếu là user hiện tại
    const curr = this.getCurrentUser();
    if (curr && curr.id === target.id) {
      this.setCurrentUser({ ...curr, password: newPass }, true);
    }

    return true;
  },

  // --- ATTENDANCE RECORDS (KHUNG SƯỜN RỖNG) ---
  getAttendanceHistory(): AttendanceRecord[] {
    const raw = localStorage.getItem(KEYS.ATTENDANCE_HISTORY);
    if (!raw) {
      // Bắt đầu sạch sẽ bằng mảng rỗng
      localStorage.setItem(KEYS.ATTENDANCE_HISTORY, JSON.stringify(INITIAL_HISTORY));
      return INITIAL_HISTORY;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_HISTORY;
    }
  },

  saveAttendanceHistory(history: AttendanceRecord[]): void {
    localStorage.setItem(KEYS.ATTENDANCE_HISTORY, JSON.stringify(history));
  },

  // --- OVERTIME REQUESTS ---
  getOvertimeRequests(): OvertimeRequest[] {
    const raw = localStorage.getItem(KEYS.OVERTIME_REQUESTS);
    if (!raw) {
      localStorage.setItem(KEYS.OVERTIME_REQUESTS, JSON.stringify(INITIAL_OVERTIME));
      return INITIAL_OVERTIME;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_OVERTIME;
    }
  },

  saveOvertimeRequests(requests: OvertimeRequest[]): void {
    localStorage.setItem(KEYS.OVERTIME_REQUESTS, JSON.stringify(requests));
  },

  // --- SUPPORT CHAT & QUÊN MẬT KHẨU ---
  getSupportMessages(): SupportMessage[] {
    const raw = localStorage.getItem(KEYS.SUPPORT_MESSAGES);
    if (!raw) {
      localStorage.setItem(KEYS.SUPPORT_MESSAGES, JSON.stringify(INITIAL_SUPPORT_MESSAGES));
      return INITIAL_SUPPORT_MESSAGES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_SUPPORT_MESSAGES;
    }
  },

  sendSupportMessage(msg: Omit<SupportMessage, 'id' | 'timestamp'>): SupportMessage {
    const list = this.getSupportMessages();
    const newMsg: SupportMessage = {
      ...msg,
      id: `msg_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };

    const updated = [...list, newMsg];
    localStorage.setItem(KEYS.SUPPORT_MESSAGES, JSON.stringify(updated));
    return newMsg;
  },

  resolveResetRequest(messageId: string, employeeCodeOrCccd: string): boolean {
    // 1. Reset mật khẩu nhân viên về 'TEAYOO'
    const success = this.updatePassword(employeeCodeOrCccd, 'TEAYOO');
    if (!success) return false;

    // 2. Cập nhật trạng thái tin nhắn
    const list = this.getSupportMessages();
    const updated = list.map((m) => {
      if (m.id === messageId) {
        return { ...m, isResolved: true };
      }
      return m;
    });

    // 3. Gửi tin nhắn xác nhận của hệ thống vào khung chat
    updated.push({
      id: `msg_sys_${Date.now()}`,
      senderId: 'system',
      senderRole: 'SYSTEM',
      senderName: 'Hệ thống Quản lý',
      senderCodeOrCccd: 'SYSTEM',
      message: `Chủ quản đã phê duyệt và đặt lại mật khẩu cho tài khoản [${employeeCodeOrCccd}] về mặc định: TEAYOO. Vui lòng đăng nhập và đổi mật khẩu mới.`,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    });

    localStorage.setItem(KEYS.SUPPORT_MESSAGES, JSON.stringify(updated));
    return true;
  },

  // --- SALARY TEMPLATE ---
  getSalary(): MonthlySalary {
    return INITIAL_SALARY_TEMPLATE;
  },

  // --- SHIFTS ---
  getShifts(): WorkShift[] {
    const raw = localStorage.getItem(KEYS.SHIFTS);
    if (!raw) {
      localStorage.setItem(KEYS.SHIFTS, JSON.stringify(INITIAL_SHIFTS));
      return INITIAL_SHIFTS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_SHIFTS;
    }
  }
};
