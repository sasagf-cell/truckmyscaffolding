import pb from './pocketbaseClient.js';
import logger from './logger.js';

/**
 * Ensure required PocketBase collections exist.
 * Safe to run on every startup — skips if collection already exists.
 */
export async function runMigrations() {
  await ensureUserCustomFields();
  await ensureSiteTeamInvites();
  await ensureEmailVerifications();
}

async function ensureUserCustomFields() {
  const REQUIRED_FIELDS = [
    { name: 'full_name',             type: 'text',   required: false },
    { name: 'company_name',          type: 'text',   required: false },
    { name: 'vat_number',            type: 'text',   required: false },
    { name: 'role',                  type: 'select', required: false,
      options: { maxSelect: 1, values: ['Coordinator', 'Site Team'] } },
    { name: 'plan',                  type: 'select', required: false,
      options: { maxSelect: 1, values: ['free', 'pro', 'enterprise'] } },
    { name: 'language',              type: 'text',   required: false },
    { name: 'unsubscribeToken',      type: 'text',   required: false },
    { name: 'reset_token',           type: 'text',   required: false },
    { name: 'reset_token_expires',   type: 'date',   required: false },
  ];

  try {
    const collection = await pb.collections.getOne('users');
    // Only non-system custom fields (exclude id, password, tokenKey, email, emailVisibility, verified, created, updated)
    const SYSTEM_FIELD_NAMES = new Set(['id', 'password', 'tokenKey', 'email', 'emailVisibility', 'verified', 'created', 'updated']);
    const existingFields = (collection.fields || collection.schema || []).filter(f => !f.system && !SYSTEM_FIELD_NAMES.has(f.name));
    const existingNames = existingFields.map(f => f.name);
    const toAdd = REQUIRED_FIELDS.filter(f => !existingNames.includes(f.name));

    if (toAdd.length === 0) {
      logger.info('users collection — custom fields already exist, skipping');
      return;
    }

    const updatedFields = [...existingFields, ...toAdd];
    await pb.collections.update('users', { fields: updatedFields });
    logger.info(`users collection — added fields: ${toAdd.map(f => f.name).join(', ')}`);
  } catch (err) {
    logger.error('Failed to update users collection schema:', err?.message || err);
  }
}

async function ensureSiteTeamInvites() {
  const COLLECTION = 'site_team_invites';
  const ROLE_VALUES = ['Supervisor', 'Warehouse Manager', 'Coordinator'];

  try {
    const existing = await pb.collections.getOne(COLLECTION);
    // Update role field values if they don't match
    const roleField = (existing.fields || existing.schema || []).find(f => f.name === 'role');
    const currentValues = roleField?.options?.values || [];
    const needsUpdate = ROLE_VALUES.some(v => !currentValues.includes(v));
    if (needsUpdate) {
      const updatedFields = (existing.fields || existing.schema || []).map(f => {
        if (f.name === 'role') return { ...f, options: { maxSelect: 1, values: ROLE_VALUES } };
        return f;
      });
      await pb.collections.update(COLLECTION, { fields: updatedFields });
      logger.info(`Collection '${COLLECTION}' — role values updated to: ${ROLE_VALUES.join(', ')}`);
    } else {
      logger.info(`Collection '${COLLECTION}' already exists — skipping`);
    }
    return;
  } catch {
    // 404 → create it
  }

  try {
    await pb.collections.create({
      name: COLLECTION,
      type: 'base',
      fields: [
        { name: 'projectId',         type: 'text',     required: true },
        { name: 'email',             type: 'email',    required: true },
        { name: 'role',              type: 'select',   required: true,
          options: { maxSelect: 1, values: ['Supervisor', 'Warehouse Manager', 'Coordinator'] } },
        { name: 'status',            type: 'select',   required: false,
          options: { maxSelect: 1, values: ['pending_invite', 'active', 'revoked'] } },
        { name: 'permissions',       type: 'json',     required: false },
        { name: 'inviteToken',       type: 'text',     required: false },
        { name: 'inviteTokenExpiry', type: 'date',     required: false },
        { name: 'createdBy',         type: 'text',     required: false },
        { name: 'userId',            type: 'text',     required: false },
        { name: 'joinedAt',          type: 'date',     required: false },
        { name: 'message',           type: 'text',     required: false },
      ],
      listRule:   '@request.auth.id != ""',
      viewRule:   '@request.auth.id != ""',
      createRule: '@request.auth.id != ""',
      updateRule: '@request.auth.id != ""',
      deleteRule: '@request.auth.id != ""',
    });
    logger.info(`Collection '${COLLECTION}' created successfully`);
  } catch (err) {
    logger.error(`Failed to create collection '${COLLECTION}':`, err?.message || err);
  }
}

async function ensureEmailVerifications() {
  const COLLECTION = 'email_verifications';
  try {
    await pb.collections.getOne(COLLECTION);
    logger.info(`Collection '${COLLECTION}' already exists — skipping`);
    return;
  } catch {
    // 404 → create it
  }

  try {
    await pb.collections.create({
      name: COLLECTION,
      type: 'base',
      fields: [
        { name: 'userId',    type: 'text',    required: true },
        { name: 'email',     type: 'email',   required: true },
        { name: 'token',     type: 'text',    required: true },
        { name: 'expires',   type: 'date',    required: true },
        { name: 'used',      type: 'bool',    required: false },
      ],
      listRule:   null,
      viewRule:   null,
      createRule: null,
      updateRule: null,
      deleteRule: null,
    });
    logger.info(`Collection '${COLLECTION}' created successfully`);
  } catch (err) {
    logger.error(`Failed to create collection '${COLLECTION}':`, err?.message || err);
  }
}
