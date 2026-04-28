/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("diary_entries");
  collection.fields.removeByName("visitors");
  return app.save(collection);
}, (app) => {

  const collection = app.findCollectionByNameOrId("diary_entries");
  collection.fields.add(new TextField({
    name: "visitors",
    required: false
  }));
  return app.save(collection);
})
