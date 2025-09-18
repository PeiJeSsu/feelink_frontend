import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

const EmotionHistoryChart = ({ data }) => {
    const chartData = data.map(item => ({
        date: item.dateString,
        score: Math.min(Math.max(item.score, -1), 1)
    }));

    return (
        <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                        dataKey="date"
                        stroke="#64748b"
                        fontSize={12}
                    />
                    <YAxis
                        domain={[-1, 1]}
                        stroke="#64748b"
                        fontSize={12}
                        tickFormatter={(value) => value.toFixed(1)}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                        formatter={(value) => [value.toFixed(2), '情緒分數']}
                    />
                    <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#4F46E5"
                        strokeWidth={3}
                        dot={{ fill: "#4F46E5", strokeWidth: 2, r: 6 }}
                        activeDot={{ r: 8, fill: "#06B6D4" }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default EmotionHistoryChart;
