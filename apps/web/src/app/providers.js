import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});
export const Providers = ({ children }) => {
    return (_jsxs(QueryClientProvider, { client: queryClient, children: [children, (typeof window !== 'undefined' && import.meta.env?.DEV) && (_jsx(ReactQueryDevtools, { initialIsOpen: false }))] }));
};
