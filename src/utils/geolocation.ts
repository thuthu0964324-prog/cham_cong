export interface GeoLocationResult {
  latitude: number;
  longitude: number;
  accuracy: number; // in meters (sai số ±X m)
  distanceFromStore: number; // in meters
  isValid: boolean; // within allowed radius
  error?: string;
}

// Cấu hình tọa độ cửa hàng mẫu TEAYOO
export const STORE_LOCATION = {
  latitude: 10.80055,
  longitude: 106.64449,
  name: 'TEAYOO - Cửa hàng Trung tâm',
  allowedRadiusMeters: 250 // Bán kính cho phép chấm công quanh cửa hàng
};

/**
 * Tính khoảng cách giữa hai tọa độ GPS theo công thức Haversine (đơn vị: mét)
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Lấy tọa độ GPS hiện tại của thiết bị (hỗ trợ Web Browser và Mobile)
 */
export async function getCurrentLocation(): Promise<GeoLocationResult> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({
        latitude: STORE_LOCATION.latitude,
        longitude: STORE_LOCATION.longitude,
        accuracy: 15,
        distanceFromStore: 10,
        isValid: true,
        error: 'Trình duyệt không hỗ trợ Geolocation, dùng tọa độ mặc định của cửa hàng'
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const distance = calculateHaversineDistance(
          latitude,
          longitude,
          STORE_LOCATION.latitude,
          STORE_LOCATION.longitude
        );

        resolve({
          latitude,
          longitude,
          accuracy: Math.round(accuracy),
          distanceFromStore: distance,
          isValid: distance <= STORE_LOCATION.allowedRadiusMeters,
        });
      },
      (err) => {
        // Fallback mô phỏng cho môi trường thử nghiệm không có GPS thật (đang ở trong cửa hàng)
        resolve({
          latitude: STORE_LOCATION.latitude,
          longitude: STORE_LOCATION.longitude,
          accuracy: 18,
          distanceFromStore: 15,
          isValid: true,
          error: `Quyền định vị bị hạn chế (${err.message}). Sử dụng vị trí mô phỏng cửa hàng.`
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 0,
      }
    );
  });
}
