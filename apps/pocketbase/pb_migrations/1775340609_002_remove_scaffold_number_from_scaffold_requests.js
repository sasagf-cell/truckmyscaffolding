/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("scaffold_requests");
  collection.fields.removeByName("scaffold_number");
  return app.save(collection);
}, (app) => {

  const collection = app.findCollectionByNameOrId("scaffold_requests");
  collection.fields.add(new TextField({
    name: "scaffold_number",
    required: true
  }));
  return app.save(collection);
})
