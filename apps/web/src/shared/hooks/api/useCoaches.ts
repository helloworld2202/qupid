import { useQuery } from '@tanstack/react-query';
import { coachApi } from '../../api/coach.api';
import { Coach } from '@qupid/core';

export const useCoaches = () => {
  return useQuery<Coach[], Error>({
    queryKey: ['coaches'],
    queryFn: coachApi.getAllCoaches,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCoach = (id: string) => {
  return useQuery<Coach, Error>({
    queryKey: ['coaches', id],
    queryFn: () => coachApi.getCoachById(id),
    enabled: !!id,
  });
};