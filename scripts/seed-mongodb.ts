console.error(
  "The demo seeder is disabled because the database now uses the retail-outlet inventory and telemetry schema. Import current-schema documents through your approved data pipeline instead.",
);
process.exitCode = 1;
