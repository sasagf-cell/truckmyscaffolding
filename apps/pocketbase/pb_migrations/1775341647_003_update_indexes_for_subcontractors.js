/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("subcontractors");
  collection.indexes.push("CREATE UNIQUE INDEX idx_subcontractors_inviteToken ON subcontractors (inviteToken)");
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("subcontractors");
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_subcontractors_inviteToken"));
  return app.save(collection);
})
