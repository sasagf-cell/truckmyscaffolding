import pb from './pocketbaseClient.js';
import logger from './logger.js';

/**
 * Ensure required PocketBase collections exist.
 * Safe to run on every startup — skips if collection already exists.
 */
export async function runMigrations() {
  await ensureSiteTeamInvites();
}

async function ensureSiteTeamInvites() {
  const COLLECTION = 'site_team_invites';
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
        { name: 'projectId',         type: 'text',     required: true },
        { name: 'email',             type: 'email',    required: true },
        { name: 'role',              type: 'select',   required: true,
          options: { maxSelect: 1, values: ['Foreman', 'Scaffolder', 'Helper', 'Warehouse Manager'] } },
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
