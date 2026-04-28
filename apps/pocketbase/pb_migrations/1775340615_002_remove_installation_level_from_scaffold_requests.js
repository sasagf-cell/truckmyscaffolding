/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("scaffold_requests");
  collection.fields.removeByName("installation_level");
  return app.save(collection);
}, (app) => {

  const collection = app.findCollectionByNameOrId("scaffold_requests");
  collection.fields.add(new NumberField({
    name: "installation_level",
    required: false
  }));
  return app.save(collection);
})
