/// <reference path="../pb_data/types.d.ts" />

onRecordCreate((e) => {
  if (!e || !e.record) {
    e.next();
    return;
  }
  try {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let token = "";
    for (let i = 0; i < 32; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    e.record.set("unsubscribeToken", token + Date.now().toString(36));
  } catch (err) {
    try {
      e.record.set("unsubscribeToken", Date.now().toString(36) + Math.random().toString(36).slice(2));
    } catch (e2) { }
  }
  e.next();
}, "users");
