import { Employee, WorkShift, AttendanceRecord, OvertimeRequest, MonthlySalary, SupportMessage } from '../types';

export const INITIAL_ACCOUNTS: Employee[] = [
  // 1. Tài khoản CHỦ QUẢN (Mã: CQ-8888, Mật khẩu: ADMIN)
  {
    id: 'mgr_01',
    name: 'Trần Hoàng',
    cccd: '001000888888',
    displayCccd: '0010******88',
    employeeCode: 'CQ-8888',
    storeId: 'store_teayoo_01',
    storeName: 'TEAYOO',
    branchName: 'Chi nhánh 1',
    position: 'Chủ quản / Quản lý',
    role: 'MANAGER',
    password: 'ADMIN',
    isSetupCompleted: false, // Thiết lập lần đầu sau khi đăng nhập
  },
  // 2. Tài khoản NHÂN VIÊN 1 (Mã: NV-1001, Mật khẩu: TEAYOO)
  {
    id: 'emp_01',
    name: 'Nguyễn Văn A',
    cccd: '001099012345',
    displayCccd: '0010******45',
    employeeCode: 'NV-1001',
    storeId: 'store_teayoo_01',
    storeName: 'TEAYOO',
    branchName: 'Chi nhánh 1',
    position: 'Pha chế (PC)',
    role: 'STAFF',
    password: 'TEAYOO',
    isSetupCompleted: true,
  },
  // 3. Tài khoản NHÂN VIÊN 2 (Mã: NV-1002, Mật khẩu: TEAYOO)
  {
    id: 'emp_02',
    name: 'Lê Thị B',
    cccd: '001099012346',
    displayCccd: '0010******46',
    employeeCode: 'NV-1002',
    storeId: 'store_teayoo_01',
    storeName: 'TEAYOO',
    branchName: 'Chi nhánh 1',
    position: 'Thu ngân (TN)',
    role: 'STAFF',
    password: 'TEAYOO',
    isSetupCompleted: true,
  }
];

// Khung sườn ca làm mẫu của cửa hàng
export const INITIAL_SHIFTS: WorkShift[] = [
  { id: 's_pc', shiftCode: 'PC', shiftName: 'Pha chế (15:00 - 23:00)', startTime: '15:00', endTime: '23:00', date: '2026-11-20' },
  { id: 's_tn', shiftCode: 'TN', shiftName: 'Thu ngân (07:00 - 15:00)', startTime: '07:00', endTime: '15:00', date: '2026-11-20' },
  { id: 's_cb', shiftCode: 'CB', shiftName: 'Chuẩn bị (06:00 - 14:00)', startTime: '06:00', endTime: '14:00', date: '2026-11-20' },
  { id: 's_pv', shiftCode: 'PV', shiftName: 'Phục vụ (13:00 - 21:00)', startTime: '13:00', endTime: '21:00', date: '2026-11-20' },
  { id: 's_night', shiftCode: 'DG', shiftName: 'Dọn dẹp & Ca đêm (22:00 - 06:00)', startTime: '22:00', endTime: '06:00', isNightShift: true, date: '2026-11-20' },
  { id: 's_off', shiftCode: 'OFF', shiftName: 'Nghỉ ca', startTime: '00:00', endTime: '00:00', date: '2026-11-20' }
];

// KHUNG SƯỜN RỖNG THEO YÊU CẦU:
// Xóa hết dữ liệu mẫu, chỉ sinh dữ liệu khi nhân viên bấm chấm công vào ca / tan ca thực tế
export const INITIAL_HISTORY: AttendanceRecord[] = [];

export const INITIAL_OVERTIME: OvertimeRequest[] = [];

export const INITIAL_SUPPORT_MESSAGES: SupportMessage[] = [];

export const INITIAL_SALARY_TEMPLATE: MonthlySalary = {
  month: '2026-11',
  shiftSalary: 0,
  approvedOvertimeSalary: 0,
  bonus: 0,
  deductions: 0,
  estimatedSalary: 0,
  netSalary: 0,
  isSettled: false,
  pendingShiftsCount: 0
};
