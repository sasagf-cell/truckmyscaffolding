/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("material_deliveries");
  collection.fields.removeByName("supplier");
  return app.save(collection);
}, (app) => {

  const collection = app.findCollectionByNameOrId("material_deliveries");
  collection.fields.add(new TextField({
    name: "supplier",
    required: false
  }));
  return app.save(collection);
})
