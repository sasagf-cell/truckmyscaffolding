/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("subscriptions");
  collection.indexes.push("CREATE INDEX idx_subscriptions_userId ON subscriptions (userId)");
  collection.indexes.push("CREATE INDEX idx_subscriptions_projectId ON subscriptions (projectId)");
  collection.indexes.push("CREATE UNIQUE INDEX idx_subscriptions_stripeSubscriptionId ON subscriptions (stripeSubscriptionId)");
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("subscriptions");
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_subscriptions_userId"));
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_subscriptions_projectId"));
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_subscriptions_stripeSubscriptionId"));
  return app.save(collection);
})
