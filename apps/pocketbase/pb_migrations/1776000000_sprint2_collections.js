/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // 1. PROJECT WORKERS (GDPR W-001 System)
  const projectWorkers = new Collection({
    "id": "pbc_projectworkers",
    "name": "project_workers",
    "type": "base",
    "system": false,
    "listRule": "@request.auth.id != \"\"",
    "viewRule": "@request.auth.id != \"\"",
    "createRule": "@request.auth.id != \"\"",
    "updateRule": "@request.auth.id != \"\"",
    "deleteRule": "@request.auth.id != \"\"",
    "fields": [
      {
        "id": "text_pw_id",
        "name": "id",
        "type": "text",
        "primaryKey": true,
        "required": true,
        "system": true,
        "hidden": false,
        "pattern": "^[a-z0-9]+$"
      },
      {
        "id": "rel_pw_project",
        "name": "project_id",
        "type": "relation",
        "required": true,
        "collectionId": "pbc_6793512535",
        "cascadeDelete": true,
        "minSelect": 1,
        "maxSelect": 1
      },
      {
        "id": "text_pw_anonid",
        "name": "anonymous_id",
        "type": "text",
        "required": true,
        "pattern": "^W-[0-9]{3,}$"
      },
      {
        "id": "select_pw_role",
        "name": "role",
        "type": "select",
        "values": ["Scaffolder", "Foreman", "Helper", "Subcontractor"]
      },
      {
        "id": "text_pw_company",
        "name": "company",
        "type": "text"
      },
      {
        "id": "autodate_pw_c",
        "name": "created",
        "type": "autodate",
        "onCreate": true,
        "onUpdate": false
      },
      {
        "id": "autodate_pw_u",
        "name": "updated",
        "type": "autodate",
        "onCreate": true,
        "onUpdate": true
      }
    ]
  });

  try {
    app.save(projectWorkers);
  } catch (err) {
    console.log("project_workers error or exists", err.message);
  }

  // 2. WORKER HOURS
  // First, we might need to delete the old worker_hours or we can just create a new one called worker_hours_v2 or update the existing one.
  // We'll update the existing one if it exists.
  try {
    const existingWorkerHours = app.findCollectionByNameOrId("worker_hours");
    if (existingWorkerHours) {
        app.delete(existingWorkerHours);
    }
  } catch(e) {}

  const workerHours = new Collection({
    "id": "pbc_workerhours2",
    "name": "worker_hours",
    "type": "base",
    "system": false,
    "listRule": "@request.auth.id != \"\"",
    "viewRule": "@request.auth.id != \"\"",
    "createRule": "@request.auth.id != \"\"",
    "updateRule": "@request.auth.id != \"\"",
    "deleteRule": "@request.auth.id != \"\"",
    "fields": [
      {
        "id": "text_wh_id",
        "name": "id",
        "type": "text",
        "primaryKey": true,
        "required": true,
        "system": true,
        "hidden": false,
        "pattern": "^[a-z0-9]+$"
      },
      {
        "id": "rel_wh_project",
        "name": "project_id",
        "type": "relation",
        "required": true,
        "collectionId": "pbc_6793512535",
        "cascadeDelete": true,
        "minSelect": 1,
        "maxSelect": 1
      },
      {
        "id": "rel_wh_worker",
        "name": "worker_id",
        "type": "relation",
        "required": true,
        "collectionId": "pbc_projectworkers",
        "cascadeDelete": true,
        "minSelect": 1,
        "maxSelect": 1
      },
      {
        "id": "date_wh_date",
        "name": "date",
        "type": "date",
        "required": true
      },
      {
        "id": "num_wh_reg",
        "name": "regular_hours",
        "type": "number",
        "min": 0,
        "max": 24
      },
      {
        "id": "num_wh_over",
        "name": "overtime_hours",
        "type": "number",
        "min": 0,
        "max": 24
      },
      {
        "id": "text_wh_notes",
        "name": "notes",
        "type": "text"
      },
      {
        "id": "autodate_wh_c",
        "name": "created",
        "type": "autodate",
        "onCreate": true,
        "onUpdate": false
      },
      {
        "id": "autodate_wh_u",
        "name": "updated",
        "type": "autodate",
        "onCreate": true,
        "onUpdate": true
      }
    ]
  });

  try {
    app.save(workerHours);
  } catch (err) {
    console.log("worker_hours error", err.message);
  }

  // 3. QR TOKENS
  const qrTokens = new Collection({
    "id": "pbc_qrtokens",
    "name": "qr_tokens",
    "type": "base",
    "system": false,
    "listRule": "@request.auth.id != \"\"",
    "viewRule": "@request.auth.id != \"\"",
    "createRule": "@request.auth.id != \"\"",
    "updateRule": "@request.auth.id != \"\"",
    "deleteRule": "@request.auth.id != \"\"",
    "fields": [
      {
        "id": "text_qr_id",
        "name": "id",
        "type": "text",
        "primaryKey": true,
        "required": true,
        "system": true,
        "hidden": false,
        "pattern": "^[a-z0-9]+$"
      },
      {
        "id": "text_qr_token",
        "name": "token",
        "type": "text",
        "required": true
      },
      {
        "id": "rel_qr_project",
        "name": "project_id",
        "type": "relation",
        "required": true,
        "collectionId": "pbc_6793512535",
        "cascadeDelete": true,
        "minSelect": 1,
        "maxSelect": 1
      },
      {
        "id": "date_qr_exp",
        "name": "expires_at",
        "type": "date"
      },
      {
        "id": "bool_qr_used",
        "name": "used",
        "type": "bool",
        "required": false
      },
      {
        "id": "autodate_qr_c",
        "name": "created",
        "type": "autodate",
        "onCreate": true,
        "onUpdate": false
      },
      {
        "id": "autodate_qr_u",
        "name": "updated",
        "type": "autodate",
        "onCreate": true,
        "onUpdate": true
      }
    ]
  });

  try {
    app.save(qrTokens);
  } catch (err) {
    console.log("qr_tokens error", err.message);
  }

  // 4. RATE LIMITING FOR /join and /login
  let settings = app.settings();
  
  // Add new rules for specific API endpoints
  settings.rateLimits.rules.push({
    label: "POST /api/collections/users/records", // Registration endpoint (/join)
    audience: "",
    duration: 60 * 60, // 1 hour
    maxRequests: 10
  });
  
  settings.rateLimits.rules.push({
    label: "POST /api/collections/users/auth-with-password", // Login endpoint (/login)
    audience: "",
    duration: 5 * 60, // 5 minutes
    maxRequests: 10
  });

  app.save(settings);

}, (app) => {
  // Revert operations
  try {
    const pw = app.findCollectionByNameOrId("pbc_projectworkers");
    app.delete(pw);
  } catch(e) {}
  
  try {
    const wh = app.findCollectionByNameOrId("pbc_workerhours2");
    app.delete(wh);
  } catch(e) {}

  try {
    const qr = app.findCollectionByNameOrId("pbc_qrtokens");
    app.delete(qr);
  } catch(e) {}
})
