/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("users");

  const existing = collection.fields.getByName("plan");
  if (existing) {
    if (existing.type === "select") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("plan"); // exists with wrong type, remove first
  }

  collection.fields.add(new SelectField({
    name: "plan",
    required: false,
    values: ["free", "pro", "premium"]
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("users");
  collection.fields.removeByName("plan");
  return app.save(collection);
})
