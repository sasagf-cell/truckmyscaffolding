/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("users");

  const existing = collection.fields.getByName("planId");
  if (existing) {
    if (existing.type === "select") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("planId"); // exists with wrong type, remove first
  }

  collection.fields.add(new SelectField({
    name: "planId",
    values: ["Starter", "Professional", "Enterprise"]
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("users");
  collection.fields.removeByName("planId");
  return app.save(collection);
})
