import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from 'react';
import { Screen } from '@qupid/core';
import { Chart, registerables } from 'chart.js/auto';
import { useCoaches } from '../../../shared/hooks/useCoaches';
Chart.register(...registerables);
const CoachCard = ({ coach, onStart }) => (_jsxs("div", { className: "p-4 bg-white rounded-xl border border-[#F2F4F6] flex items-center space-x-4", children: [_jsx("img", { src: coach.avatar, alt: coach.name, className: "w-16 h-16 rounded-full object-cover" }), _jsxs("div", { className: "flex-1", children: [_jsxs("p", { className: "font-bold text-base text-[#191F28]", children: [coach.name, " \uCF54\uCE58"] }), _jsxs("p", { className: "text-sm font-semibold text-[#4F7ABA]", children: [coach.specialty, " \uC804\uBB38"] }), _jsx("p", { className: "text-xs text-[#8B95A1] mt-1 truncate", children: coach.tagline })] }), _jsx("button", { onClick: onStart, className: "px-3 py-1.5 bg-[#FDF2F8] text-sm text-[#DB7093] font-bold rounded-full", children: "\uC0C1\uB2F4 \uC2DC\uC791" })] }));
const CoachingTabScreen = ({ onNavigate, onStartCoachChat }) => {
    const { data: coaches = [], isLoading } = useCoaches();
    // const { currentUserId } = useAppStore();
    // 임시 데이터 - 나중에 API로 교체
    const data = {
        weeklyScore: 78,
        scoreChange: 12,
        scoreChangePercentage: 18,
        dailyScores: [60, 65, 70, 68, 75, 72, 78],
        radarData: {
            labels: ['친근함', '호기심', '공감력', '유머', '배려', '적극성'],
            datasets: [{
                    label: '이번 주',
                    data: [85, 92, 58, 60, 75, 70],
                    backgroundColor: 'rgba(240, 147, 176, 0.2)',
                    borderColor: 'rgba(240, 147, 176, 1)',
                    borderWidth: 2,
                }]
        },
        stats: {
            totalTime: '2시간 15분',
            sessionCount: 8,
            avgTime: '17분',
            longestSession: { time: '32분', persona: '소연님과' },
            preferredType: '활발한 성격 (60%)'
        },
        categoryScores: [
            { title: '친근함', emoji: '😊', score: 85, change: 8, goal: 90 },
            { title: '호기심', emoji: '🤔', score: 92, change: 15, goal: 90 },
            { title: '공감력', emoji: '💬', score: 58, change: 3, goal: 70 },
        ]
    };
    const radarChartRef = useRef(null);
    useEffect(() => {
        let radarChart = null;
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
                                angleLines: { color: 'rgba(0,0,0,0.05)' },
                                suggestedMin: 0,
                                suggestedMax: 100,
                                ticks: { display: false },
                                grid: { circular: true, color: 'rgba(0,0,0,0.05)' },
                                pointLabels: { font: { size: 14, weight: 'bold' }, color: '#191F28' }
                            }
                        }
                    }
                });
            }
        }
        return () => {
            radarChart?.destroy();
        };
    }, [data]);
    return (_jsxs("div", { className: "flex flex-col h-full w-full bg-[#F9FAFB]", children: [_jsx("header", { className: "flex-shrink-0 p-4 pt-5 bg-white border-b border-[#F2F4F6]", children: _jsx("h1", { className: "text-2xl font-bold text-[#191F28]", children: "\uCF54\uCE6D" }) }), _jsxs("main", { className: "flex-1 overflow-y-auto p-4 space-y-4 pb-24", children: [_jsxs("section", { className: "p-5 bg-white rounded-2xl border border-[#F2F4F6]", children: [_jsx("h2", { className: "font-bold text-lg", children: "\uC774\uBC88 \uC8FC \uC131\uACFC \uC694\uC57D" }), _jsxs("div", { className: "mt-3 grid grid-cols-3 gap-2 text-center", children: [_jsxs("div", { children: [_jsx("p", { className: "text-3xl font-black text-[#F093B0]", children: data.weeklyScore }), _jsx("p", { className: "text-sm font-medium text-gray-500", children: "\uCD1D\uC810" })] }), _jsxs("div", { children: [_jsxs("p", { className: "text-3xl font-black text-[#0AC5A8]", children: [data.scoreChangePercentage, "%\u2197"] }), _jsx("p", { className: "text-sm font-medium text-gray-500", children: "\uC131\uC7A5\uB960" })] }), _jsxs("div", { children: [_jsx("p", { className: "text-3xl font-black text-[#4F7ABA]", children: "85%" }), _jsx("p", { className: "text-sm font-medium text-gray-500", children: "\uBAA9\uD45C\uB2EC\uC131" })] })] })] }), _jsxs("section", { className: "p-5 bg-white rounded-2xl border border-[#F2F4F6]", children: [_jsx("h3", { className: "font-bold text-lg", children: "\uC601\uC5ED\uBCC4 \uBD84\uC11D" }), _jsx("div", { className: "h-64 mt-2", children: _jsx("canvas", { ref: radarChartRef }) })] }), _jsxs("section", { children: [_jsx("h2", { className: "text-lg font-bold text-[#191F28] px-1", children: "1:1 \uB9DE\uCDA4 \uCF54\uCE6D \uD83C\uDF93" }), _jsx("p", { className: "text-sm text-[#8B95A1] px-1 mb-3", children: "\uBD80\uC871\uD55C \uBD80\uBD84\uC744 \uC804\uBB38 \uCF54\uCE58\uC640 \uD568\uAED8 \uC9D1\uC911\uC801\uC73C\uB85C \uC5F0\uC2B5\uD574\uBCF4\uC138\uC694." }), _jsx("div", { className: "space-y-3", children: isLoading ? (_jsx("div", { className: "flex justify-center items-center py-8", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-[#0AC5A8]" }) })) : (coaches.map(coach => (_jsx(CoachCard, { coach: coach, onStart: () => {
                                        if (onStartCoachChat) {
                                            onStartCoachChat(coach);
                                        }
                                        else {
                                            // Fallback to navigate to Chat screen
                                            onNavigate(Screen.Chat);
                                        }
                                    } }, coach.id)))) })] }), _jsxs("section", { children: [_jsx("h2", { className: "font-bold text-lg px-1", children: "\uB9DE\uCDA4 \uD559\uC2B5 \uCF58\uD150\uCE20 \uD83D\uDCA1" }), _jsxs("div", { className: "mt-2 space-y-3", children: [_jsxs("div", { className: "p-4 bg-white rounded-xl border border-[#F2F4F6]", children: [_jsx("p", { className: "font-semibold text-blue-600", children: "\uCD94\uCC9C \uAC15\uC758" }), _jsx("p", { className: "font-bold text-base mt-1", children: "\uACF5\uAC10 \uB2A5\uB825 \uD5A5\uC0C1\uC2DC\uD0A4\uAE30: \uC0C1\uB300\uC758 \uB9C8\uC74C\uC744 \uC5BB\uB294 3\uAC00\uC9C0 \uC9C8\uBB38\uBC95" }), _jsx("p", { className: "text-sm text-gray-500 mt-1", children: "15\uBD84 \uAC15\uC758 \u00B7 75% \uC218\uAC15" })] }), _jsxs("div", { className: "p-4 bg-white rounded-xl border border-[#F2F4F6]", children: [_jsx("p", { className: "font-semibold text-green-600", children: "\uC2E4\uC804 \uD301" }), _jsx("p", { className: "font-bold text-base mt-1", children: "\uC5B4\uC0C9\uD55C \uCE68\uBB35 \uAE68\uAE30: 5\uAC00\uC9C0 \uC720\uC6A9\uD55C \uB300\uD654 \uC8FC\uC81C" }), _jsx("p", { className: "text-sm text-gray-500 mt-1", children: "3\uBD84 \uBD84\uB7C9" })] })] })] }), _jsxs("section", { className: "p-5 bg-white rounded-2xl border border-[#F2F4F6]", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h2", { className: "font-bold text-lg", children: "\uBAA9\uD45C \uAD00\uB9AC" }), _jsx("button", { className: "text-sm font-bold text-[#F093B0]", children: "\uC218\uC815\uD558\uAE30" })] }), _jsxs("div", { className: "mt-3", children: [_jsx("p", { className: "font-semibold", children: "\uD604\uC7AC \uBAA9\uD45C: \uD83D\uDD25 \uC9D1\uC911" }), _jsx("p", { className: "text-sm text-gray-500", children: "\uC77C 3\uD68C \uB300\uD654 (45\uBD84) / \uC0C8\uB85C\uC6B4 AI\uC640 \uB300\uD654\uD558\uAE30" })] }), _jsx("button", { className: "w-full mt-3 h-10 bg-[#F2F4F6] text-[#191F28] font-bold rounded-lg", children: "\uC0C8\uB85C\uC6B4 \uBAA9\uD45C \uC124\uC815\uD558\uAE30" })] })] })] }));
};
export { CoachingTabScreen };
export default CoachingTabScreen;
