/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("material_items");
  collection.fields.removeByName("weight_kg");
  return app.save(collection);
}, (app) => {

  const collection = app.findCollectionByNameOrId("material_items");
  collection.fields.add(new NumberField({
    name: "weight_kg",
    required: false
  }));
  return app.save(collection);
})
