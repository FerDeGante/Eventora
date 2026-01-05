import { GlowCard } from "./GlowCard";

export function KpiBar({ stats }: { stats: { label: string; value: string; delta?: string }[] }) {
  return (
    <div className="bloom-kpi-bar">
      {stats.map((stat) => (
        <GlowCard key={stat.label} className="bloom-kpi-card">
          <p className="bloom-kpi-value">{stat.value}</p>
          <p className="bloom-kpi-label">{stat.label}</p>
          {stat.delta && <p className="bloom-kpi-delta">{stat.delta}</p>}
        </GlowCard>
      ))}
    </div>
  );
}
