import { useQuery } from '@tanstack/react-query';
import { PerformanceData } from '@qupid/core';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

export function usePerformance(userId?: string) {
  return useQuery<PerformanceData>({
    queryKey: ['performance', userId || 'guest'],
    queryFn: async () => {
      console.log('📊 usePerformance 호출됨, userId:', userId);
      
      // 🚀 userId가 없으면 게스트 ID 사용
      const actualUserId = userId || 'guest-user';
      
      const response = await fetch(`${API_URL}/analytics/performance/${actualUserId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        console.error('❌ 성과 데이터 가져오기 실패:', response.status, response.statusText);
        throw new Error('Failed to fetch performance data');
      }

      const result = await response.json();
      console.log('✅ 성과 데이터 가져오기 성공:', result);
      return result.data;
    },
    enabled: true, // 🚀 항상 활성화 (게스트 모드 지원)
    refetchInterval: 60000, // 1분마다 자동 갱신
    staleTime: 30000, // 30초 동안 캐시 유지
    retry: 1, // 실패 시 1번만 재시도
  });
}

export function useWeeklyStats(userId?: string) {
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

export function useMonthlyStats(userId?: string, month?: number, year?: number) {
  return useQuery({
    queryKey: ['monthlyStats', userId, month, year],
    queryFn: async () => {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const params = new URLSearchParams();
      if (month) params.append('month', month.toString());
      if (year) params.append('year', year.toString());

      const response = await fetch(
        `${API_URL}/analytics/monthly/${userId}?${params}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch monthly stats');
      }

      const result = await response.json();
      return result.data;
    },
    enabled: !!userId,
  });
}