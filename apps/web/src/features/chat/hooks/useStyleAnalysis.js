import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../../../shared/api/apiClient';
export const useStyleAnalysis = () => {
    return useMutation({
        mutationFn: async (messages) => {
            const response = await apiClient.post('/api/v1/chat/style-analysis', { messages });
            return response.data.data;
        }
    });
};
