export type Language = 'vi' | 'zh-CN' | 'ko' | 'en' | 'ja';

export type Theme = 'light' | 'dark' | 'system';

export type UserRole = 'STAFF' | 'MANAGER';

export interface Employee {
  id: string;
  name: string;
  cccd: string;
  displayCccd: string;
  employeeCode: string; // Mã nhân viên hoặc mã chủ quản
  storeId: string;
  storeName: string;
  branchName?: string;
  position?: string;
  role: UserRole;
  password?: string;
  isSetupCompleted?: boolean;
  avatarUrl?: string;
}

export interface StaffImportRow {
  name: string;
  position: string;
  cccd: string;
  employeeCode?: string;
  rowNumber: number;
  status: 'VALID' | 'DUPLICATE_FILE' | 'DUPLICATE_STORE' | 'ERROR';
  errorReason?: string;
}

export interface StaffImportResult {
  total: number;
  valid: number;
  added: number;
  updated: number;
  skipped: number;
  errors: number;
}

export interface WorkShift {
  id: string;
  date: string; // YYYY-MM-DD
  shiftCode: string; // PC, TN, CB, PV, DG, OFF, etc.
  shiftName: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  isNightShift?: boolean;
}

export type RecordStatus = 
  | 'COMPLETED' 
  | 'IN_PROGRESS' 
  | 'MISSING_IN' 
  | 'MISSING_OUT' 
  | 'LATE' 
  | 'EARLY' 
  | 'OFF';

export type ReviewStatus = 'VERIFIED' | 'PENDING_REVIEW';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  date: string; // YYYY-MM-DD
  shiftId: string;
  shiftCode: string;
  shiftName: string;
  // Vào ca
  checkInTime?: string;
  checkInPhoto?: string;
  checkInLat?: number;
  checkInLng?: number;
  checkInAccuracy?: number;
  // Tan ca
  checkOutTime?: string;
  checkOutPhoto?: string;
  checkOutLat?: number;
  checkOutLng?: number;
  checkOutAccuracy?: number;
  // Trạng thái
  status: RecordStatus;
  reviewStatus: ReviewStatus;
  note?: string;
}

export type OvertimeStatus = 'PENDING_STORE_MANAGER' | 'PENDING_SUPERVISOR' | 'APPROVED' | 'REJECTED';

export interface OvertimeRequest {
  id: string;
  employeeId: string;
  employeeName?: string;
  employeeCode?: string;
  date: string;
  startTime: string; // HH:00
  endTime: string;   // HH:00
  hours: number;
  reason: string;
  photoUrl?: string;
  lat?: number;
  lng?: number;
  status: OvertimeStatus;
  rejectReason?: string;
  createdAt: string;
}

export interface MonthlySalary {
  month: string; // YYYY-MM
  shiftSalary: number;
  approvedOvertimeSalary: number;
  bonus: number;
  deductions: number;
  estimatedSalary: number;
  netSalary: number;
  isSettled: boolean;
  pendingShiftsCount: number;
}

// Khung Chat Hỗ trợ & Quên mật khẩu
export interface SupportMessage {
  id: string;
  senderId: string;
  senderRole: 'STAFF' | 'MANAGER' | 'SYSTEM';
  senderName: string;
  senderCodeOrCccd: string;
  message: string;
  isResetRequest?: boolean;
  isResolved?: boolean;
  timestamp: string;
}
