import { AttendanceRecord, OvertimeRequest, WorkShift, Employee } from '../types';
import { storageService } from './storageService';

let isSubmitting = false;

export const attendanceService = {
  /**
   * Lấy lịch sử (mới nhất trước)
   */
  async getRecentHistory(employeeId?: string): Promise<AttendanceRecord[]> {
    await new Promise((r) => setTimeout(r, 200));
    const history = storageService.getAttendanceHistory();
    const filtered = employeeId 
      ? history.filter((r) => r.employeeId === employeeId)
      : history;
    return [...filtered].sort((a, b) => b.date.localeCompare(a.date));
  },

  /**
   * Chấm công Vào ca (Check-in)
   */
  async clockIn(params: {
    user: Employee;
    shift: WorkShift;
    photo: string;
    latitude: number;
    longitude: number;
    accuracy: number;
  }): Promise<{ success: boolean; record?: AttendanceRecord; error?: string }> {
    if (isSubmitting) {
      return { success: false, error: 'Thao tác đang được xử lý, vui lòng không bấm liên tục.' };
    }
    isSubmitting = true;

    try {
      await new Promise((r) => setTimeout(r, 600));

      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      const todayStr = now.toISOString().split('T')[0];

      const history = storageService.getAttendanceHistory();
      
      let existingRecord = history.find(
        (r) => r.date === todayStr && r.shiftId === params.shift.id && r.employeeId === params.user.id
      );

      if (existingRecord && existingRecord.checkInTime) {
        return {
          success: false,
          error: 'Ca làm việc này bạn đã chấm Vào ca trước đó. Không thể chấm đúp.',
        };
      }

      const newRecord: AttendanceRecord = existingRecord || {
        id: `rec_${Date.now()}`,
        employeeId: params.user.id,
        employeeName: params.user.name,
        employeeCode: params.user.employeeCode,
        date: todayStr,
        shiftId: params.shift.id,
        shiftCode: params.shift.shiftCode,
        shiftName: params.shift.shiftName,
        status: 'IN_PROGRESS',
        reviewStatus: 'PENDING_REVIEW',
      };

      newRecord.checkInTime = timeStr;
      newRecord.checkInPhoto = params.photo;
      newRecord.checkInLat = params.latitude;
      newRecord.checkInLng = params.longitude;
      newRecord.checkInAccuracy = params.accuracy;
      newRecord.status = 'IN_PROGRESS';

      const updatedHistory = existingRecord
        ? history.map((r) => (r.id === newRecord.id ? newRecord : r))
        : [newRecord, ...history];

      storageService.saveAttendanceHistory(updatedHistory);

      return { success: true, record: newRecord };
    } catch (err: any) {
      return { success: false, error: 'Lỗi máy chủ khi ghi nhận vào ca.' };
    } finally {
      isSubmitting = false;
    }
  },

  /**
   * Chấm công Tan ca (Check-out)
   */
  async clockOut(params: {
    user: Employee;
    shift: WorkShift;
    photo: string;
    latitude: number;
    longitude: number;
    accuracy: number;
  }): Promise<{ success: boolean; record?: AttendanceRecord; error?: string }> {
    if (isSubmitting) {
      return { success: false, error: 'Thao tác đang được xử lý, vui lòng không bấm liên tục.' };
    }
    isSubmitting = true;

    try {
      await new Promise((r) => setTimeout(r, 600));

      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      const todayStr = now.toISOString().split('T')[0];

      const history = storageService.getAttendanceHistory();

      let record = history.find(
        (r) => r.date === todayStr && r.shiftId === params.shift.id && r.employeeId === params.user.id
      );

      if (!record) {
        record = {
          id: `rec_${Date.now()}`,
          employeeId: params.user.id,
          employeeName: params.user.name,
          employeeCode: params.user.employeeCode,
          date: todayStr,
          shiftId: params.shift.id,
          shiftCode: params.shift.shiftCode,
          shiftName: params.shift.shiftName,
          status: 'MISSING_IN',
          reviewStatus: 'PENDING_REVIEW',
          note: 'Thiếu lần chấm Vào ca',
        };
        history.unshift(record);
      }

      if (record.checkOutTime) {
        return {
          success: false,
          error: 'Ca làm việc này đã được chấm Tan ca rồi.',
        };
      }

      record.checkOutTime = timeStr;
      record.checkOutPhoto = params.photo;
      record.checkOutLat = params.latitude;
      record.checkOutLng = params.longitude;
      record.checkOutAccuracy = params.accuracy;
      
      if (record.status !== 'MISSING_IN') {
        record.status = 'COMPLETED';
        record.reviewStatus = 'VERIFIED';
      }

      const updatedHistory = history.map((r) => (r.id === record!.id ? record! : r));
      storageService.saveAttendanceHistory(updatedHistory);

      return { success: true, record };
    } finally {
      isSubmitting = false;
    }
  },

  /**
   * Gửi đơn tăng ca
   */
  async submitOvertime(request: Omit<OvertimeRequest, 'id' | 'createdAt' | 'status'>): Promise<{ success: boolean; error?: string }> {
    if (isSubmitting) {
      return { success: false, error: 'Đang gửi, vui lòng không bấm liên tục.' };
    }
    isSubmitting = true;

    try {
      await new Promise((r) => setTimeout(r, 500));

      const newOt: OvertimeRequest = {
        ...request,
        id: `ot_${Date.now()}`,
        status: 'PENDING_STORE_MANAGER',
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      };

      const list = storageService.getOvertimeRequests();
      storageService.saveOvertimeRequests([newOt, ...list]);

      return { success: true };
    } finally {
      isSubmitting = false;
    }
  },

  /**
   * Chủ quản duyệt / từ chối đơn tăng ca
   */
  async reviewOvertime(otId: string, status: 'APPROVED' | 'REJECTED', rejectReason?: string): Promise<boolean> {
    const list = storageService.getOvertimeRequests();
    const updated = list.map((ot) => {
      if (ot.id === otId) {
        return {
          ...ot,
          status: status === 'APPROVED' ? ('APPROVED' as const) : ('REJECTED' as const),
          rejectReason: status === 'REJECTED' ? rejectReason || 'Không hợp lệ' : undefined,
        };
      }
      return ot;
    });
    storageService.saveOvertimeRequests(updated);
    return true;
  }
};
