export default function Ruler({
  pageW,
  left,
  right,
}: {
  pageW: number
  left: number
  right: number
  zoom: number
}) {
  const ticks: number[] = []
  for (let i = 0; i <= pageW; i += 12) ticks.push(i)

  return (
    <div className="ruler">
      <div className="ruler-track">
        {ticks.map((t, i) => (
          <span
            key={t}
            className={`tick${i % 8 === 0 ? ' major' : i % 4 === 0 ? ' mid' : ''}`}
            style={{ left: t }}
          />
        ))}
        {ticks.map((t, i) =>
          i % 8 === 0 ? (
            <span key={`l${t}`} className="tick-label" style={{ left: t + 2 }}>
              {t / 96}
            </span>
          ) : null,
        )}
      </div>
      <div className="ruler-margin left" style={{ left }} />
      <div className="ruler-margin right" style={{ right }} />
      <div className="ruler-content" style={{ left, right }} />
    </div>
  )
}
