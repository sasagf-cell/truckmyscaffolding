/// <reference path="../pb_data/types.d.ts" />

/**
 * Migration: scaffold_inspections — API rules + performance indexes
 *
 * Before: collection fully open (no rules = anyone can read/write without auth)
 * After:  authentication required for all operations
 *         indexes on scaffold_tag_id, project_id, confirmed_at for query performance
 *
 * Rollback: removes rules (reverts to open) and drops the three indexes.
 */
migrate(
  // ── UP ──────────────────────────────────────────────────────────────────────
  (app) => {
    let collection;
    try {
      collection = app.findCollectionByNameOrId("scaffold_inspections");
    } catch (_) {
      // Collection doesn't exist yet — create it with minimal schema so rules
      // and indexes can be applied. The full schema is managed by the app.
      collection = new Collection({
        name: "scaffold_inspections",
        type: "base",
        fields: [
          {
            name: "scaffold_tag_id",
            type: "text",
            required: false,
          },
          {
            name: "scaffold_number",
            type: "text",
            required: false,
          },
          {
            name: "project_id",
            type: "text",
            required: false,
          },
          {
            name: "confirmed_by",
            type: "text",
            required: false,
          },
          {
            name: "confirmed_by_name",
            type: "text",
            required: false,
          },
          {
            name: "confirmed_at",
            type: "date",
            required: false,
          },
          {
            name: "previous_due",
            type: "text",
            required: false,
          },
          {
            name: "new_due",
            type: "text",
            required: false,
          },
          {
            name: "interval_days",
            type: "number",
            required: false,
          },
          {
            name: "notes",
            type: "text",
            required: false,
          },
        ],
      });
    }

    // ── Access rules: authentication required for all operations ──────────────
    // project_id is a plain text field (not a relation), so ownership is
    // enforced at the application layer. Rule: must be logged in.
    collection.listRule   = "@request.auth.id != \"\"";
    collection.viewRule   = "@request.auth.id != \"\"";
    collection.createRule = "@request.auth.id != \"\"";
    collection.updateRule = "@request.auth.id != \"\"";
    collection.deleteRule = "@request.auth.id != \"\"";

    app.save(collection);

    // ── Performance indexes ───────────────────────────────────────────────────
    // Re-fetch after save so PocketBase assigns the internal collection ID.
    collection = app.findCollectionByNameOrId("scaffold_inspections");

    // Index 1: project_id — primary filter in list queries
    try {
      const idx1 = new Index({
        collectionId: collection.id,
        name: "idx_scaffold_inspections_project_id",
        unique: false,
        columns: [{ name: "project_id", order: "ASC" }],
      });
      app.save(idx1);
    } catch (err) {
      console.log("[migration] idx_scaffold_inspections_project_id:", err.message);
    }

    // Index 2: scaffold_tag_id — used in InspectionHistoryModal filter
    try {
      const idx2 = new Index({
        collectionId: collection.id,
        name: "idx_scaffold_inspections_tag_id",
        unique: false,
        columns: [{ name: "scaffold_tag_id", order: "ASC" }],
      });
      app.save(idx2);
    } catch (err) {
      console.log("[migration] idx_scaffold_inspections_tag_id:", err.message);
    }

    // Index 3: confirmed_at — used for sort: '-confirmed_at' in history queries
    try {
      const idx3 = new Index({
        collectionId: collection.id,
        name: "idx_scaffold_inspections_confirmed_at",
        unique: false,
        columns: [{ name: "confirmed_at", order: "DESC" }],
      });
      app.save(idx3);
    } catch (err) {
      console.log("[migration] idx_scaffold_inspections_confirmed_at:", err.message);
    }
  },

  // ── DOWN (rollback) ──────────────────────────────────────────────────────────
  (app) => {
    let collection;
    try {
      collection = app.findCollectionByNameOrId("scaffold_inspections");
    } catch (_) {
      return; // nothing to roll back
    }

    // Remove rules (revert to fully open — matches original state)
    collection.listRule   = null;
    collection.viewRule   = null;
    collection.createRule = null;
    collection.updateRule = null;
    collection.deleteRule = null;

    app.save(collection);

    // Drop indexes
    for (const name of [
      "idx_scaffold_inspections_project_id",
      "idx_scaffold_inspections_tag_id",
      "idx_scaffold_inspections_confirmed_at",
    ]) {
      try {
        const idx = app.findIndexByCollectionAndName(collection.id, name);
        app.delete(idx);
      } catch (_) {
        // index may not exist — ignore
      }
    }
  }
);
