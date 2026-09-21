import React from 'react';
import { useApp } from '../../context/AppContext';
import { SpotlightCard } from '../common/SpotlightCard';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  ZAxis,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';
import { BarChart3, PieChart, TrendingUp, Compass, Activity } from 'lucide-react';

export const OutputEVisualAnalytics: React.FC = () => {
  const { jobs, users, teams, theme, currentPalette } = useApp();
  const isDark = theme === 'dark';
  const tokens = currentPalette[theme];
  const chart1 = tokens.charts[0];
  const chart2 = tokens.charts[1];
  const chart3 = tokens.charts[2];
  const chart4 = tokens.charts[3];
  const chart5 = tokens.charts[4];

  // 1. Distribution of Hours by Category & Complexity
  const categoryDistribution = Array.from(new Set(jobs.map(j => j.category))).map((cat: string) => {
    const catJobs = jobs.filter(j => j.category === cat);
    return {
      category: cat.replace(' Systems', '').replace(' Identity', ''),
      planned: catJobs.reduce((acc, j) => acc + j.estimatedHours, 0),
      actual: catJobs.reduce((acc, j) => acc + j.actualHours, 0)
    };
  });

  // 2. Radar/Spider chart: Team Capability & Operational Velocity across 6 dimensions
  const radarDimensions = [
    { dimension: 'SLA Velocity', value: 92, fullMark: 100 },
    { dimension: 'Estimation Precision', value: 86, fullMark: 100 },
    { dimension: 'Capacity Buffer', value: 78, fullMark: 100 },
    { dimension: 'Dependency Health', value: 74, fullMark: 100 },
    { dimension: 'Review Turnaround', value: 89, fullMark: 100 },
    { dimension: 'Audit Compliance', value: 95, fullMark: 100 },
  ];

  // 3. Polarity Dual-Axis Scatter (Estimated vs Actual Variance & Risk Polarity)
  const scatterData = jobs.map(j => ({
    name: j.id,
    estimated: j.estimatedHours,
    actual: j.actualHours,
    variance: j.actualHours - j.estimatedHours,
    isBlocked: j.status === 'blocked' ? 2 : 1
  }));

  // 4. Trend Line (Capacity vs Workload Trajectory over Sprint Weeks)
  const trendData = [
    { week: 'Wk 34', capacity: 380, workload: 340, throughput: 330 },
    { week: 'Wk 35', capacity: 380, workload: 360, throughput: 350 },
    { week: 'Wk 36', capacity: 380, workload: 395, throughput: 375 },
    { week: 'Wk 37', capacity: 380, workload: 410, throughput: 385 },
    { week: 'Wk 38 (Current)', capacity: 380, workload: 314, throughput: 300 }
  ];

  const tooltipBg = 'var(--color-surface-elevated)';
  const tooltipBorder = 'var(--color-border)';
  const tooltipColor = 'var(--color-text-primary)';

  return (
    <div className="space-y-6">
      {/* Banner */}
      <SpotlightCard className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider"
                style={{ backgroundColor: 'var(--color-brand-muted)', color: 'var(--color-brand)' }}
              >
                Pillar Output E
              </span>
              <h1 className="text-xl font-black tracking-tight text-text-primary">Interactive Visual Analytics Dashboard</h1>
            </div>
            <p className="text-xs text-text-secondary">
              Dynamic Recharts visualizations covering distribution bars, capability radar meshes, variance polarity scatters, and workload trends.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full border"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--color-brand) 12%, transparent)',
                borderColor: 'color-mix(in srgb, var(--color-brand) 30%, transparent)',
                color: 'var(--color-brand)'
              }}
            >
              Live Metrics Grounded
            </span>
          </div>
        </div>
      </SpotlightCard>

      {/* Grid of Recharts Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Distribution of Hours */}
        <SpotlightCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold tracking-tight">Hours Distribution by Stream</h3>
              <p className={`text-[11px] ${isDark ? 'text-[#8b9bb4]' : 'text-[#64748b]'}`}>
                Estimated vs Actual Logged Hours
              </p>
            </div>
            <BarChart3 className="w-4 h-4" style={{ color: 'var(--color-brand)' }} />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1a263d' : '#e2e8f0'} />
                <XAxis dataKey="category" stroke={isDark ? '#64748b' : '#94a3b8'} fontSize={11} />
                <YAxis stroke={isDark ? '#64748b' : '#94a3b8'} fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, color: tooltipColor, borderRadius: '8px', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="planned" name="Planned Hours" fill={chart1} radius={[4, 4, 0, 0]} />
                <Bar dataKey="actual" name="Actual Logged" fill={chart2} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SpotlightCard>

        {/* Chart 2: Radar Spider Mesh */}
        <SpotlightCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold tracking-tight">System Operational Radar</h3>
              <p className={`text-[11px] ${isDark ? 'text-[#8b9bb4]' : 'text-[#64748b]'}`}>
                6-Dimensional Velocity &amp; Quality Vector
              </p>
            </div>
            <Compass className="w-4 h-4" style={{ color: chart3 }} />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarDimensions} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
                <PolarGrid stroke={isDark ? '#1a263d' : '#e2e8f0'} />
                <PolarAngleAxis dataKey="dimension" stroke={isDark ? '#8b9bb4' : '#64748b'} fontSize={10} />
                <PolarRadiusAxis stroke={isDark ? '#475569' : '#cbd5e1'} fontSize={10} />
                <Radar name="Tibule Pulse Index" dataKey="value" stroke={chart3} fill={chart3} fillOpacity={0.4} />
                <Tooltip
                  contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, color: tooltipColor, borderRadius: '8px', fontSize: '11px' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </SpotlightCard>

        {/* Chart 3: Trend Lines */}
        <SpotlightCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold tracking-tight">Capacity vs. Workload Trajectory</h3>
              <p className={`text-[11px] ${isDark ? 'text-[#8b9bb4]' : 'text-[#64748b]'}`}>
                Weekly contractual threshold against committed demands
              </p>
            </div>
            <TrendingUp className="w-4 h-4" style={{ color: chart1 }} />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1a263d' : '#e2e8f0'} />
                <XAxis dataKey="week" stroke={isDark ? '#64748b' : '#94a3b8'} fontSize={11} />
                <YAxis stroke={isDark ? '#64748b' : '#94a3b8'} fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, color: tooltipColor, borderRadius: '8px', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="capacity" name="Available Capacity" stroke="#64748b" strokeDasharray="5 5" strokeWidth={2} />
                <Line type="monotone" dataKey="workload" name="Committed Workload" stroke={chart4} strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="throughput" name="Completed Output" stroke={chart2} strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SpotlightCard>

        {/* Chart 4: Variance Polarity Scatter */}
        <SpotlightCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold tracking-tight">Deliverable Estimation Variance Polarity</h3>
              <p className={`text-[11px] ${isDark ? 'text-[#8b9bb4]' : 'text-[#64748b]'}`}>
                Scatter plot of Estimated Hours (X) vs Actual Logged (Y)
              </p>
            </div>
            <Activity className="w-4 h-4" style={{ color: chart5 }} />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1a263d' : '#e2e8f0'} />
                <XAxis type="number" dataKey="estimated" name="Estimated (hrs)" stroke={isDark ? '#64748b' : '#94a3b8'} fontSize={11} />
                <YAxis type="number" dataKey="actual" name="Actual (hrs)" stroke={isDark ? '#64748b' : '#94a3b8'} fontSize={11} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, color: tooltipColor, borderRadius: '8px', fontSize: '11px' }}
                />
                <Scatter name="Deliverables" data={scatterData} fill={chart1} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </SpotlightCard>
      </div>
    </div>
  );
};
