import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getCumulativeData, getPaceLineData } from '../utils/calculations';
import './PaceChart.css';

export default function PaceChart({ activities }) {
  const cumulativeData = getCumulativeData(activities);
  const paceData = getPaceLineData();

  // Merge pace and actual data
  const merged = {};
  paceData.forEach(p => {
    merged[p.date] = { date: p.date, pace: p.pace };
  });
  cumulativeData.forEach(a => {
    merged[a.date] = { ...merged[a.date], ...a };
  });

  const chartData = Object.values(merged).sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="pace-chart">
      <h2>Goal Progress Over Time</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="date" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip
            contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '6px' }}
            labelStyle={{ color: '#e2e8f0' }}
            formatter={(value) => value ? Math.round(value) : 0}
          />
          <Legend />
          <Line type="monotone" dataKey="pace" stroke="#06b6d4" name="Target Pace" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="actual" stroke="#10b981" name="Actual Miles" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
