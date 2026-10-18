(async () => {
  const res = await fetch("http://localhost:3000/nozzles");
  const html = await res.text();
  console.log("STATUS:", res.status);
  const names = html.match(/Nozzle [0-9]+/g);
  console.log("NOZZLE NAMES:", names ? names.join(", ") : "none");
  const m = html.match(/No items|no items|empty/i);
  console.log("EMPTY MSG:", m ? m[0] : "none");
  const counts = html.match(/Telemetry records<\/dt>[\s\S]{0,30}?<dd[^>]*>([\s\S]*?)<\/dd>/g);
  console.log("RECORD COUNTS:", counts ? counts.map(c=>c.match(/>(\d[\d,]*)<\/dd>/)[1]).join(",") : "none");
})();
