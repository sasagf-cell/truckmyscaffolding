/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("scaffold_requests");
  collection.fields.removeByName("end_date");
  return app.save(collection);
}, (app) => {

  const collection = app.findCollectionByNameOrId("scaffold_requests");
  collection.fields.add(new DateField({
    name: "end_date",
    required: true
  }));
  return app.save(collection);
})
