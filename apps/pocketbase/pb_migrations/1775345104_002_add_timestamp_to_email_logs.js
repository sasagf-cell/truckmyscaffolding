/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("email_logs");

  const existing = collection.fields.getByName("timestamp");
  if (existing) {
    if (existing.type === "autodate") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("timestamp"); // exists with wrong type, remove first
  }

  collection.fields.add(new AutodateField({
    name: "timestamp",
    onCreate: true,
    onUpdate: false
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("email_logs");
  collection.fields.removeByName("timestamp");
  return app.save(collection);
})
