/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("email_logs");
  collection.fields.removeByName("clickedAt");
  return app.save(collection);
}, (app) => {

  const collection = app.findCollectionByNameOrId("email_logs");
  collection.fields.add(new DateField({
    name: "clickedAt",
    required: false
  }));
  return app.save(collection);
})
