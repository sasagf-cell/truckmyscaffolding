/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("scaffold_requests");
  collection.fields.removeByName("section");
  return app.save(collection);
}, (app) => {

  const collection = app.findCollectionByNameOrId("scaffold_requests");
  collection.fields.add(new TextField({
    name: "section",
    required: true
  }));
  return app.save(collection);
})
