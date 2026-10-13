import type { Tank } from "@/features/data";

type TankLevelGraphicProps = Pick<Tank, "id" | "product" | "levelPercent" | "waterPercent"> & {
  size?: "compact" | "detail";
};

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

export function TankLevelGraphic({
  id,
  product,
  levelPercent,
  waterPercent,
  size = "detail",
}: TankLevelGraphicProps) {
  const fuel = clampPercent(levelPercent);
  const water = waterPercent === null ? 0 : clampPercent(waterPercent);
  const total = fuel + water;
  const scale = total > 100 ? 100 / total : 1;
  const fuelHeight = fuel * scale;
  const waterHeight = water * scale;
  const compact = size === "compact";

  return (
    <figure className="grid w-full justify-items-center gap-2">
      <div
        role="img"
        aria-label={`${id} ${product} tank: ${fuel}% fuel, ${waterPercent === null ? "water level unavailable" : `${water}% water`}`}
        className={`relative w-full overflow-hidden rounded-full border-[5px] border-slate-300 bg-slate-100 p-1.5 shadow-inner ${compact ? "h-20" : "h-28"}`}
      >
        <div className="absolute inset-1.5 overflow-hidden rounded-full bg-slate-200">
          {fuelHeight > 0 && (
            <div
              className="absolute inset-x-0 bg-[#d6ad58] transition-[height,bottom] duration-700"
              style={{ height: `${fuelHeight}%`, bottom: `${waterHeight}%` }}
            />
          )}
          {waterHeight > 0 && (
            <div
              className="absolute inset-x-0 bottom-0 bg-[#68a9d1] transition-[height] duration-700"
              style={{ height: `${waterHeight}%` }}
            />
          )}
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-5 top-1 h-px bg-white/60" />
        </div>
      </div>

      <figcaption className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-slate-600">
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="size-2.5 rounded-full bg-[#d6ad58]" />
          {product} {fuel}%
        </span>
        {waterPercent !== null && (
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden="true" className="size-2.5 rounded-full bg-[#68a9d1]" />
            Water {water}%
          </span>
        )}
      </figcaption>
    </figure>
  );
}
