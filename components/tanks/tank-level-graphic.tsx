type TankLevelGraphicProps = {
  id: string;
  fuelLevelLiters: number | null;
  waterLevelLiters: number | null;
  ullageLiters: number | null;
  size?: "compact" | "detail";
};

type TankLayer = {
  key: "fuel" | "water" | "ullage";
  label: string;
  color: string;
};

function formatLiters(value: number | null): string {
  return value === null ? "Unavailable" : `${value.toLocaleString()} L`;
}

function formatPercent(value: number | null): string {
  if (value === null) return "—";
  if (value === 0) return "0%";
  return value >= 1 ? `${value.toFixed(1)}%` : `${value.toFixed(2)}%`;
}

export function TankLevelGraphic({
  id,
  fuelLevelLiters,
  waterLevelLiters,
  ullageLiters,
  size = "detail",
}: TankLevelGraphicProps) {
  const fuel = Math.max(0, fuelLevelLiters ?? 0);
  const water = Math.max(0, waterLevelLiters ?? 0);
  const ullage = Math.max(0, ullageLiters ?? 0);
  const capacity = fuel + water + ullage;
  const share = (value: number) => (capacity === 0 ? null : (value / capacity) * 100);
  const fuelPercent = share(fuel);
  const waterPercent = share(water);
  const ullagePercent = share(ullage);
  const compact = size === "compact";

  const layers: TankLayer[] = [
    { key: "fuel", label: "Fuel", color: "bg-[#d6ad58]" },
    { key: "water", label: "Water", color: "bg-[#68a9d1]" },
    { key: "ullage", label: "Ullage", color: "bg-slate-200" },
  ];
  const layerPercent: Record<TankLayer["key"], number | null> = {
    fuel: fuelPercent,
    water: waterPercent,
    ullage: ullagePercent,
  };
  const liquidPercent =
    fuelPercent === null || waterPercent === null ? null : fuelPercent + waterPercent;
  const levelMarks = [25, 50, 75];

  return (
    <figure className="grid w-full justify-items-center gap-3">
      <div
        role="img"
        aria-label={`${id} tank contents: fuel ${formatLiters(fuelLevelLiters)} (${formatPercent(fuelPercent)}), water ${formatLiters(waterLevelLiters)} (${formatPercent(waterPercent)}), ullage ${formatLiters(ullageLiters)} (${formatPercent(ullagePercent)}). Contents are stacked from the bottom: water, then fuel, then ullage air, with the liquid level marked inside the tank.`}
        className={`relative w-full overflow-hidden rounded-full border-2 border-slate-300 bg-slate-100 shadow-inner ${compact ? "h-20" : "h-28"}`}
      >
        <div className="absolute inset-0 overflow-hidden rounded-full bg-slate-200">
          {liquidPercent !== null && liquidPercent > 0 && (
            <div
              className="absolute inset-x-0 bottom-0 bg-[#d6ad58]"
              style={{ height: `${liquidPercent}%` }}
            />
          )}
          {waterPercent !== null && waterPercent > 0 && (
            <div
              className="absolute inset-x-0 bottom-0 min-h-[4px] bg-[#68a9d1]"
              style={{ height: `${waterPercent}%` }}
            />
          )}
        </div>

        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          {levelMarks.map((mark) => (
            <div
              key={mark}
              className="absolute right-2 h-px w-2.5 rounded-full bg-slate-500/70"
              style={{ bottom: `${mark}%` }}
            />
          ))}
          {liquidPercent !== null && liquidPercent > 0 && (
            <div
              className="absolute inset-x-0 h-[2px] bg-slate-800/55"
              style={{ bottom: `${liquidPercent}%` }}
            />
          )}
        </div>
      </div>

      <dl className="grid w-full grid-cols-3 gap-2 text-center">
        {layers.map((layer) => (
          <div key={layer.key} className="min-w-0">
            <dt className="flex items-center justify-center gap-1.5 text-[11px] uppercase tracking-wide text-slate-500">
              <span aria-hidden="true" className={`size-2 shrink-0 rounded-full ${layer.color}`} />
              {layer.label}
            </dt>
            <dd className="mt-1 truncate text-sm font-semibold text-[#17352f]">
              {formatPercent(layerPercent[layer.key])}
            </dd>
          </div>
        ))}
      </dl>
      <span className="sr-only">
        Layer heights follow the tank capacity derived from the reported fuel, water, and ullage
        volumes. The water layer keeps a minimum height so a small water volume stays visible.
      </span>
    </figure>
  );
}
