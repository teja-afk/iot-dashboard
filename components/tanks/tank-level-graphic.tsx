type TankLevelGraphicProps = {
  id: string;
  fuelLevelLiters: number | null;
  waterLevelLiters: number | null;
  size?: "compact" | "detail";
};

function formatLiters(value: number | null): string {
  return value === null ? "Unavailable" : `${value.toLocaleString()} L`;
}

export function TankLevelGraphic({
  id,
  fuelLevelLiters,
  waterLevelLiters,
  size = "detail",
}: TankLevelGraphicProps) {
  const fuel = Math.max(0, fuelLevelLiters ?? 0);
  const water = Math.max(0, waterLevelLiters ?? 0);
  const total = fuel + water;
  const fuelShare = total === 0 ? 0 : (fuel / total) * 100;
  const waterShare = total === 0 ? 0 : (water / total) * 100;
  const compact = size === "compact";

  return (
    <figure className="grid w-full justify-items-center gap-2">
      <div
        role="img"
        aria-label={`${id} tank observed contents: fuel ${formatLiters(fuelLevelLiters)}, water ${formatLiters(waterLevelLiters)}. Bar shows proportions of reported contents, not tank capacity.`}
        className={`relative w-full overflow-hidden rounded-full border-[5px] border-slate-300 bg-slate-100 p-1.5 shadow-inner ${compact ? "h-20" : "h-28"}`}
      >
        <div className="absolute inset-1.5 flex overflow-hidden rounded-full bg-slate-200">
          {fuelShare > 0 && (
            <div className="h-full bg-[#d6ad58] transition-[width] duration-700" style={{ width: `${fuelShare}%` }} />
          )}
          {waterShare > 0 && (
            <div className="h-full bg-[#68a9d1] transition-[width] duration-700" style={{ width: `${waterShare}%` }} />
          )}
          {total === 0 && (
            <div className="h-full w-full bg-slate-200" />
          )}
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-5 top-1 h-px bg-white/60" />
        </div>
      </div>

      <figcaption className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-slate-600">
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="size-2.5 rounded-full bg-[#d6ad58]" />
          Fuel {formatLiters(fuelLevelLiters)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="size-2.5 rounded-full bg-[#68a9d1]" />
          Water {formatLiters(waterLevelLiters)}
        </span>
      </figcaption>
      <span className="sr-only">Fill segments show the proportions of reported contents, not tank capacity.</span>
    </figure>
  );
}
