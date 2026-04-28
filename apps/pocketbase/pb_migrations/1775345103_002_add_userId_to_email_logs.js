/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("email_logs");

  const existing = collection.fields.getByName("userId");
  if (existing) {
    if (existing.type === "text") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("userId"); // exists with wrong type, remove first
  }

  collection.fields.add(new TextField({
    name: "userId",
    required: false
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("email_logs");
  collection.fields.removeByName("userId");
  return app.save(collection);
})
