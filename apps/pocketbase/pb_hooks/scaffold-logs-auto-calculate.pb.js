/// <reference path="../pb_data/types.d.ts" />
onRecordAfterCreateSuccess((e) => {
  const length_m = e.record.getFloat("length_m");
  const width_m = e.record.getFloat("width_m");
  const height_m = e.record.getFloat("height_m");
  const unit_price_eur = e.record.getFloat("unit_price_eur");
  const start_date = e.record.get("start_date");
  const end_date = e.record.get("end_date");

  const volume_m3 = length_m * width_m * height_m;
  e.record.set("volume_m3", volume_m3);

  const startDate = new Date(start_date);
  const endDate = new Date(end_date);
  const rental_days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  e.record.set("rental_days", rental_days);

  const total_price_eur = volume_m3 * unit_price_eur;
  e.record.set("total_price_eur", total_price_eur);

  const holding_fee_eur = rental_days * (unit_price_eur / 30);
  e.record.set("holding_fee_eur", holding_fee_eur);

  $app.save(e.record);
  e.next();
}, "scaffold_logs");

onRecordAfterUpdateSuccess((e) => {
  const length_m = e.record.getFloat("length_m");
  const width_m = e.record.getFloat("width_m");
  const height_m = e.record.getFloat("height_m");
  const unit_price_eur = e.record.getFloat("unit_price_eur");
  const start_date = e.record.get("start_date");
  const end_date = e.record.get("end_date");

  const volume_m3 = length_m * width_m * height_m;
  e.record.set("volume_m3", volume_m3);

  const startDate = new Date(start_date);
  const endDate = new Date(end_date);
  const rental_days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  e.record.set("rental_days", rental_days);

  const total_price_eur = volume_m3 * unit_price_eur;
  e.record.set("total_price_eur", total_price_eur);

  const holding_fee_eur = rental_days * (unit_price_eur / 30);
  e.record.set("holding_fee_eur", holding_fee_eur);

  $app.save(e.record);
  e.next();
}, "scaffold_logs");
