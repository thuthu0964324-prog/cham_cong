import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { WorkShift } from '../types';
import { attendanceService } from '../services/attendanceService';
import { captureFrameFromVideo, generateMockAttendancePhoto, requestCameraStream } from '../utils/camera';
import { getCurrentLocation, GeoLocationResult } from '../utils/geolocation';
import { Camera, MapPin, AlertTriangle, Check, RefreshCw, X, ShieldCheck } from 'lucide-react';

interface AttendanceModalProps {
  type: 'IN' | 'OUT';
  shift: WorkShift;
  onClose: () => void;
  onSuccess: () => void;
}

export const AttendanceModal: React.FC<AttendanceModalProps> = ({
  type,
  shift,
  onClose,
  onSuccess,
}) => {
  const { user, t } = useAuth();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [photo, setPhoto] = useState<string | null>(null);
  const [location, setLocation] = useState<GeoLocationResult | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);

  // Khởi động Camera và GPS khi mở modal
  useEffect(() => {
    let isMounted = true;

    // 1. Camera
    async function startCamera() {
      const stream = await requestCameraStream();
      if (!isMounted) return;

      if (stream && videoRef.current) {
        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      } else {
        // Fallback mô phỏng nếu không có webcam/quyền camera bị chặn trên web máy tính
        setCameraActive(false);
      }
    }

    // 2. Định vị GPS
    async function fetchLocation() {
      setIsLocating(true);
      const loc = await getCurrentLocation();
      if (!isMounted) return;
      setLocation(loc);
      setIsLocating(false);
    }

    startCamera();
    fetchLocation();

    return () => {
      isMounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Chụp ảnh
  const handleTakePhoto = () => {
    if (cameraActive && videoRef.current) {
      const captured = captureFrameFromVideo(videoRef.current);
      setPhoto(captured);
    } else {
      // Mock selfie nếu camera phần cứng không sẵn sàng
      const nowStr = new Date().toLocaleTimeString('vi-VN');
      const mockPhoto = generateMockAttendancePhoto(user?.name || 'Nhân viên', nowStr);
      setPhoto(mockPhoto);
    }
  };

  // Chụp lại
  const handleRetake = () => {
    setPhoto(null);
  };

  // Xác nhận gửi
  const handleSubmit = async () => {
    if (!photo) {
      setErrorMsg(t('attendance.step_photo'));
      return;
    }
    if (!location) {
      setErrorMsg(t('attendance.loc_error'));
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const payload = {
      user: user!,
      shift,
      photo,
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy,
    };

    const res =
      type === 'IN'
        ? await attendanceService.clockIn(payload)
        : await attendanceService.clockOut(payload);

    setIsSubmitting(false);

    if (res.success) {
      onSuccess();
      onClose();
    } else {
      setErrorMsg(res.error || t('common.error'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`p-1.5 rounded-lg text-white font-bold text-xs ${
                type === 'IN' ? 'bg-emerald-600' : 'bg-blue-600'
              }`}
            >
              {type === 'IN' ? t('home.check_in') : t('home.check_out')}
            </span>
            <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">
              {type === 'IN' ? t('attendance.title_in') : t('attendance.title_out')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Container */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Employee & Shift info badge */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Nhân viên:</span>
              <strong className="text-slate-800 dark:text-slate-200">{user?.name} ({user?.employeeCode})</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Ca làm:</span>
              <strong className="text-slate-800 dark:text-slate-200">{shift.shiftName}</strong>
            </div>
          </div>

          {/* Camera Viewfinder */}
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center border-2 border-slate-300 dark:border-slate-700 shadow-inner">
            {!photo ? (
              cameraActive ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover -scale-x-100"
                />
              ) : (
                <div className="text-center p-6 text-slate-400 space-y-2">
                  <Camera className="w-12 h-12 mx-auto text-slate-500" />
                  <p className="text-xs">
                    Mô phỏng chụp ảnh khuôn mặt tại cửa hàng (Camera trực tiếp)
                  </p>
                </div>
              )
            ) : (
              <img
                src={photo}
                alt="Captured"
                className="w-full h-full object-cover"
              />
            )}

            {/* Viewfinder overlay reticle */}
            {!photo && (
              <div className="absolute inset-6 border border-white/30 rounded-2xl pointer-events-none flex items-center justify-center">
                <span className="text-[10px] text-white/70 bg-black/40 px-2 py-0.5 rounded-full">
                  Giữ khuôn mặt trong khung
                </span>
              </div>
            )}
          </div>

          {/* Camera action buttons */}
          <div className="flex justify-center">
            {!photo ? (
              <button
                type="button"
                onClick={handleTakePhoto}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md active:scale-95 transition-all"
              >
                <Camera className="w-4 h-4" />
                {t('attendance.take_photo')}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleRetake}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                {t('attendance.retake_photo')}
              </button>
            )}
          </div>

          <p className="text-[11px] text-center text-slate-500 dark:text-slate-400">
            {t('attendance.camera_notice')}
          </p>

          {/* GPS Info Card */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs space-y-1.5">
            <div className="flex items-center justify-between font-semibold">
              <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                {t('attendance.step_location')}
              </span>
              {isLocating ? (
                <span className="text-amber-500 animate-pulse text-[11px]">
                  {t('attendance.loc_checking')}
                </span>
              ) : location?.isValid ? (
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {t('attendance.loc_valid')}
                </span>
              ) : (
                <span className="text-rose-500 font-bold text-[11px]">
                  {t('attendance.loc_error')}
                </span>
              )}
            </div>

            {location && (
              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex justify-between">
                <span>Tọa độ: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</span>
                <span>{t('attendance.accuracy')}: ±{location.accuracy}m</span>
              </div>
            )}
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Footer Confirmation */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {t('common.cancel')}
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!photo || isSubmitting}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 ${
              !photo || isSubmitting
                ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed'
                : type === 'IN'
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{t('attendance.submitting')}</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>{type === 'IN' ? t('attendance.submit_in') : t('attendance.submit_out')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
