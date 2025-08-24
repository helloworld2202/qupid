import { useQuery } from '@tanstack/react-query';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';
export function usePerformance(userId) {
    return useQuery({
        queryKey: ['performance', userId],
        queryFn: async () => {
            if (!userId) {
                throw new Error('User ID is required');
            }
            const response = await fetch(`${API_URL}/analytics/performance/${userId}`, {
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Failed to fetch performance data');
            }
            const result = await response.json();
            return result.data;
        },
        enabled: !!userId,
        refetchInterval: 60000, // 1분마다 자동 갱신
        staleTime: 30000, // 30초 동안 캐시 유지
    });
}
export function useWeeklyStats(userId) {
    return useQuery({
        queryKey: ['weeklyStats', userId],
        queryFn: async () => {
            if (!userId) {
                throw new Error('User ID is required');
            }
            const response = await fetch(`${API_URL}/analytics/weekly/${userId}`, {
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Failed to fetch weekly stats');
            }
            const result = await response.json();
            return result.data;
        },
        enabled: !!userId,
    });
}
export function useMonthlyStats(userId, month, year) {
    return useQuery({
        queryKey: ['monthlyStats', userId, month, year],
        queryFn: async () => {
            if (!userId) {
                throw new Error('User ID is required');
            }
            const params = new URLSearchParams();
            if (month)
                params.append('month', month.toString());
            if (year)
                params.append('year', year.toString());
            const response = await fetch(`${API_URL}/analytics/monthly/${userId}?${params}`, {
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Failed to fetch monthly stats');
            }
            const result = await response.json();
            return result.data;
        },
        enabled: !!userId,
    });
}
