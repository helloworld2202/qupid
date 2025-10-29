/**
 * API 설정 유틸리티
 * - 웹 브라우저: localhost 또는 환경 변수 사용
 * - Capacitor 앱: 실제 배포된 API URL 사용
 */
// Capacitor가 설치되어 있는지 확인
const isCapacitorApp = () => {
    return (typeof window !== 'undefined' &&
        window.Capacitor !== undefined &&
        window.Capacitor.isNativePlatform &&
        window.Capacitor.isNativePlatform());
};
/**
 * 현재 플랫폼에 맞는 API URL 반환
 */
export const getApiUrl = () => {
    // Capacitor 네이티브 앱에서 실행 중
    if (isCapacitorApp()) {
        // TODO: 실제 배포된 API URL로 변경하세요
        // Railway 또는 다른 호스팅 서비스 URL
        return 'https://qupid-api.railway.app/api/v1';
    }
    // 웹 브라우저에서 실행 중
    return import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';
};
/**
 * Supabase URL 반환
 */
export const getSupabaseUrl = () => {
    return import.meta.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
};
/**
 * Supabase Anon Key 반환
 */
export const getSupabaseAnonKey = () => {
    return import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
};
