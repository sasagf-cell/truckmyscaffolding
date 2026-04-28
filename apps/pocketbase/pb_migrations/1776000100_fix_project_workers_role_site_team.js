/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("project_workers");

  const roleField = collection.fields.getByName("role");
  if (!roleField) {
    console.log("project_workers.role field not found, skipping");
    return;
  }

  // Remove "Subcontractor" — terminology change to Site Team model
  // Foreman = Site Team Leader, Warehouse Manager = optional magacioner
  roleField.values = ["Foreman", "Scaffolder", "Helper", "Warehouse Manager"];

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("project_workers");
  const roleField = collection.fields.getByName("role");
  if (!roleField) return;
  roleField.values = ["Scaffolder", "Foreman", "Helper", "Subcontractor"];
  return app.save(collection);
});
