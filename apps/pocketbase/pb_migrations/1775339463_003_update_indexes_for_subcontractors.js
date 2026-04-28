/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("subcontractors");
  collection.indexes.push("CREATE UNIQUE INDEX idx_subcontractors_invite_token ON subcontractors (invite_token)");
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("subcontractors");
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_subcontractors_invite_token"));
  return app.save(collection);
})
