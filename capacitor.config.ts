import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.chamcong.app',
  appName: 'App Chấm Công',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true,
  },
  plugins: {
    Camera: {
      presentationStyle: 'fullscreen',
    },
    Geolocation: {
      // Cho phép cấu hình quyền trên Android/iOS
    }
  }
};

export default config;
