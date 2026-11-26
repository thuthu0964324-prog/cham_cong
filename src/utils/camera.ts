/**
 * Tiện ích chụp ảnh trực tiếp từ Camera
 * TUYỆT ĐỐI KHÔNG cung cấp nút chọn ảnh từ thư viện
 */

export async function requestCameraStream(): Promise<MediaStream | null> {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return null;
    }
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user', // Camera trước để selfie tại nơi làm việc
        width: { ideal: 640 },
        height: { ideal: 640 }
      },
      audio: false
    });
    return stream;
  } catch (error) {
    console.warn('Không thể mở camera phần cứng:', error);
    return null;
  }
}

export function captureFrameFromVideo(videoElement: HTMLVideoElement): string {
  const canvas = document.createElement('canvas');
  canvas.width = videoElement.videoWidth || 320;
  canvas.height = videoElement.videoHeight || 320;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Lật gương cho camera trước tự nhiên
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
  }
  return canvas.toDataURL('image/jpeg', 0.85);
}

/**
 * Sinh ảnh chân dung mô phỏng nếu camera bị khóa hoặc không có phần cứng
 */
export function generateMockAttendancePhoto(name: string, timestamp: string): string {
  const canvas = document.createElement('canvas');
  canvas.width = 300;
  canvas.height = 300;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Nền gradient
    const grad = ctx.createLinearGradient(0, 0, 300, 300);
    grad.addColorStop(0, '#10b981');
    grad.addColorStop(1, '#047857');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 300, 300);

    // Vẽ icon camera / avatar
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(150, 110, 50, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(150, 240, 70, Math.PI, 0);
    ctx.fill();

    // Watermark thời gian và nhân viên
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 240, 300, 60);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`NV: ${name}`, 150, 260);

    ctx.font = '12px sans-serif';
    ctx.fillText(`${timestamp} • TEAYOO HQ`, 150, 285);
  }
  return canvas.toDataURL('image/jpeg', 0.8);
}
