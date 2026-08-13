export default function StatsSection({ stats }: { stats: { value: string; label: string }[] }) {
  return (
    <section className="stats-section">
      <div className="container stats-grid">
        {stats.map((s) => (
          <div key={s.label} className="stat">
            <span className="stat-value gradient-text">{s.value}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </div>
      <style>{`
        .stats-section { padding: 40px 0; }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 32px;
          box-shadow: var(--shadow-card);
        }
        .stat { text-align: center; }
        .stat-value { display: block; font-family: var(--font-display); font-size: 32px; font-weight: 700; }
        .stat-label { font-size: 13px; color: var(--text-muted); }
        @media (max-width: 768px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
      `}</style>
    </section>
  );
}
