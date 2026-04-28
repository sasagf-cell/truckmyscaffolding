/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("loginHistory");
  collection.indexes.push("CREATE INDEX idx_loginHistory_userId ON loginHistory (userId)");
  collection.indexes.push("CREATE INDEX idx_loginHistory_created ON loginHistory (created)");
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("loginHistory");
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_loginHistory_userId"));
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_loginHistory_created"));
  return app.save(collection);
})
