import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from 'react';
import { ArrowLeftIcon } from '@qupid/ui';
import { Chart, registerables } from 'chart.js/auto';
import { usePerformance } from '../../../shared/hooks/usePerformance';
import { useAppStore } from '../../../shared/stores/useAppStore';
Chart.register(...registerables);
const PerformanceDetailScreen = ({ onBack }) => {
    const { currentUserId } = useAppStore();
    const { data: performanceData, isLoading, error } = usePerformance(currentUserId || '');
    console.log('📊 PerformanceDetailScreen - currentUserId:', currentUserId);
    console.log('📊 PerformanceDetailScreen - performanceData:', performanceData);
    console.log('📊 PerformanceDetailScreen - isLoading:', isLoading);
    console.log('📊 PerformanceDetailScreen - error:', error);
    // 🚀 API 데이터를 우선 사용하고, 없을 때만 기본값 사용
    const data = performanceData || {
        weeklyScore: 0,
        scoreChange: 0,
        scoreChangePercentage: 0,
        dailyScores: [0, 0, 0, 0, 0, 0, 0],
        radarData: {
            labels: ['친근함', '호기심', '공감력', '유머', '배려', '적극성'],
            datasets: [{
                    label: '이번 주',
                    data: [0, 0, 0, 0, 0, 0],
                    backgroundColor: 'rgba(240, 147, 176, 0.2)',
                    borderColor: 'rgba(240, 147, 176, 1)',
                    borderWidth: 2,
                }]
        },
        stats: {
            totalTime: '0분',
            sessionCount: 0,
            avgTime: '0분',
            longestSession: { time: '0분', persona: '' },
            preferredType: '아직 대화 기록이 없습니다'
        },
        categoryScores: [
            { title: '친근함', emoji: '😊', score: 0, change: 0, goal: 90 },
            { title: '호기심', emoji: '🤔', score: 0, change: 0, goal: 90 },
            { title: '공감력', emoji: '💬', score: 0, change: 0, goal: 70 },
        ]
    };
    const lineChartRef = useRef(null);
    const radarChartRef = useRef(null);
    useEffect(() => {
        let lineChart = null;
        let radarChart = null;
        if (lineChartRef.current) {
            const lineCtx = lineChartRef.current.getContext('2d');
            if (lineCtx) {
                lineChart = new Chart(lineCtx, {
                    type: 'line',
                    data: {
                        labels: ['월', '화', '수', '목', '금', '토', '일'],
                        datasets: [{
                                label: '일일 점수',
                                data: data.dailyScores,
                                borderColor: '#F093B0',
                                backgroundColor: 'rgba(240, 147, 176, 0.1)',
                                fill: true,
                                tension: 0.4,
                            }]
                    },
                    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
                });
            }
        }
        if (radarChartRef.current) {
            const radarCtx = radarChartRef.current.getContext('2d');
            if (radarCtx) {
                radarChart = new Chart(radarCtx, {
                    type: 'radar',
                    data: data.radarData,
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                            r: {
                                angleLines: { display: false },
                                suggestedMin: 0,
                                suggestedMax: 100,
                                ticks: { display: false },
                                grid: { circular: true }
                            }
                        }
                    }
                });
            }
        }
        return () => {
            lineChart?.destroy();
            radarChart?.destroy();
        };
    }, [data]);
    if (isLoading) {
        return (_jsxs("div", { className: "flex flex-col h-full w-full bg-[#F9FAFB]", children: [_jsxs("header", { className: "flex-shrink-0 flex items-center justify-between p-3 border-b border-[#F2F4F6] bg-white", children: [_jsx("div", { className: "w-10", children: _jsx("button", { onClick: onBack, className: "p-2 rounded-full hover:bg-gray-100", children: _jsx(ArrowLeftIcon, { className: "w-6 h-6 text-[#8B95A1]" }) }) }), _jsx("h2", { className: "text-center text-lg font-bold text-[#191F28]", children: "\uB0B4 \uB300\uD654 \uC2E4\uB825 \uBD84\uC11D" }), _jsx("div", { className: "w-10" })] }), _jsx("div", { className: "flex-1 flex items-center justify-center", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-[#F093B0]" }) })] }));
    }
    return (_jsxs("div", { className: "flex flex-col h-full w-full bg-[#F9FAFB]", children: [_jsxs("header", { className: "flex-shrink-0 flex items-center justify-between p-3 border-b border-[#F2F4F6] bg-white", children: [_jsx("div", { className: "w-10", children: _jsx("button", { onClick: onBack, className: "p-2 rounded-full hover:bg-gray-100", children: _jsx(ArrowLeftIcon, { className: "w-6 h-6 text-[#8B95A1]" }) }) }), _jsx("h2", { className: "text-center text-lg font-bold text-[#191F28]", children: "\uB0B4 \uB300\uD654 \uC2E4\uB825 \uBD84\uC11D" }), _jsx("div", { className: "w-10" })] }), _jsxs("main", { className: "flex-1 overflow-y-auto p-5 space-y-4", children: [_jsxs("section", { className: "p-5 bg-white rounded-2xl border border-[#F2F4F6] transition-all hover:shadow-md", children: [_jsx("h2", { className: "font-bold text-lg", children: "\uC774\uBC88 \uC8FC \uC131\uACFC \uC694\uC57D" }), _jsxs("div", { className: "mt-3 grid grid-cols-3 gap-2 text-center", children: [_jsxs("div", { className: "transition-transform hover:scale-110", children: [_jsx("p", { className: "text-3xl font-black text-[#F093B0]", children: data.weeklyScore || 0 }), _jsx("p", { className: "text-sm font-medium text-gray-500", children: "\uCD1D\uC810" })] }), _jsxs("div", { className: "transition-transform hover:scale-110", children: [_jsxs("p", { className: "text-3xl font-black text-[#0AC5A8]", children: [data.scoreChangePercentage > 0 ? '+' : '', data.scoreChangePercentage || 0, "%", data.scoreChangePercentage > 0 ? '↗' : ''] }), _jsx("p", { className: "text-sm font-medium text-gray-500", children: "\uC131\uC7A5\uB960" })] }), _jsxs("div", { className: "transition-transform hover:scale-110", children: [_jsxs("p", { className: "text-3xl font-black text-[#4F7ABA]", children: [Math.round((data.weeklyScore || 0) * 0.85), "%"] }), _jsx("p", { className: "text-sm font-medium text-gray-500", children: "\uBAA9\uD45C\uB2EC\uC131" })] })] })] }), _jsxs("section", { className: "p-5 bg-white rounded-2xl border border-[#F2F4F6]", children: [_jsx("h3", { className: "font-bold text-lg", children: "\uC601\uC5ED\uBCC4 \uBD84\uC11D" }), _jsx("div", { className: "h-64 mt-2", children: _jsx("canvas", { ref: radarChartRef }) })] }), _jsxs("section", { className: "p-6 flex flex-col items-center bg-white rounded-2xl border border-[#F2F4F6]", children: [_jsx("p", { className: "text-lg font-semibold text-[#8B95A1]", children: "\uC774\uBC88 \uC8FC \uD3C9\uADE0" }), _jsxs("p", { className: "text-6xl font-black text-[#F093B0] my-1", children: [data.weeklyScore, "\uC810"] }), _jsxs("p", { className: "text-lg font-bold text-[#0AC5A8]", children: ["+", data.scoreChange, "\uC810 (", data.scoreChangePercentage, "%\u2197)"] })] }), _jsxs("section", { className: "p-5 bg-white rounded-2xl border border-[#F2F4F6]", children: [_jsx("h3", { className: "font-bold text-lg", children: "\uC8FC\uAC04 \uC810\uC218 \uBCC0\uD654" }), _jsx("div", { className: "h-48 mt-2", children: _jsx("canvas", { ref: lineChartRef }) })] }), _jsxs("section", { className: "p-5 bg-white rounded-2xl border border-[#F2F4F6]", children: [_jsx("h3", { className: "font-bold text-lg", children: "\uC601\uC5ED\uBCC4 \uB2A5\uB825\uCE58" }), _jsx("div", { className: "h-64 mt-2", children: _jsx("canvas", { ref: radarChartRef }) })] }), _jsx("section", { className: "space-y-3", children: data.categoryScores && data.categoryScores.length > 0 && data.categoryScores.map(cat => (_jsx("div", { className: "p-4 bg-white rounded-xl border border-[#F2F4F6]", children: _jsxs("div", { className: "flex items-center", children: [_jsx("p", { className: "text-2xl mr-3", children: cat.emoji }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "font-bold", children: cat.title }), _jsxs("p", { className: "text-sm text-[#8B95A1]", children: ["\uBAA9\uD45C: ", cat.goal, "\uC810"] })] }), _jsxs("p", { className: "text-2xl font-bold text-[#191F28]", children: [cat.score, "\uC810"] }), _jsxs("p", { className: `ml-2 text-sm font-semibold ${cat.change >= 0 ? 'text-[#0AC5A8]' : 'text-red-500'}`, children: ["(", cat.change >= 0 ? '+' : '', cat.change, ")"] })] }) }, cat.title))) }), _jsxs("section", { className: "p-5 bg-white rounded-2xl border border-[#F2F4F6]", children: [_jsx("h3", { className: "font-bold text-lg", children: "\uB300\uD654 \uAE30\uB85D \uC694\uC57D" }), _jsxs("div", { className: "grid grid-cols-2 gap-4 mt-4 text-center", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xl font-bold", children: data.stats.totalTime }), _jsx("p", { className: "text-sm text-[#8B95A1]", children: "\uCD1D \uB300\uD654 \uC2DC\uAC04" })] }), _jsxs("div", { children: [_jsxs("p", { className: "text-xl font-bold", children: [data.stats.sessionCount, "\uD68C"] }), _jsx("p", { className: "text-sm text-[#8B95A1]", children: "\uB300\uD654 \uD69F\uC218" })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xl font-bold", children: data.stats.avgTime }), _jsx("p", { className: "text-sm text-[#8B95A1]", children: "\uD3C9\uADE0 \uB300\uD654 \uC2DC\uAC04" })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xl font-bold", children: data.stats.longestSession.time }), _jsx("p", { className: "text-sm text-[#8B95A1]", children: data.stats.longestSession.persona })] })] })] })] })] }));
};
export { PerformanceDetailScreen };
export default PerformanceDetailScreen;
