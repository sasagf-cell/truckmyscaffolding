import pb from '../../../../lib/pocketbaseClient';

/**
 * Service for managing scaffold inspections.
 * Sprint 3C: Added scaffold_log_id linking + auto scaffold_tag update.
 */
export const inspectionService = {
  /**
   * Get all inspections for a project (project-level history view).
   * @param {string} projectId
   */
  async getByProjectId(projectId) {
    if (!projectId) throw new Error('projectId is required.');
    try {
      return await pb.collection('inspections').getFullList({
        filter: pb.filter('project_id = {:pid}', { pid: projectId }),
        sort: '-created',
        expand: 'scaffold_log_id',
        $autoCancel: false,
      });
    } catch (error) {
      // Backward compat: if project_id field doesn't exist yet, fall back to scaffold_id
      if (error.status === 400) {
        try {
          return await pb.collection('inspections').getFullList({
            filter: pb.filter('scaffold_id = {:pid}', { pid: projectId }),
            sort: '-created',
            $autoCancel: false,
          });
        } catch {
          return [];
        }
      }
      console.error('[inspectionService] Failed to fetch inspections:', error);
      throw new Error('Could not load inspection history. Check your connection.');
    }
  },

  /**
   * Get inspections for a specific scaffold log.
   * @param {string} scaffoldLogId
   */
  async getByScaffoldLogId(scaffoldLogId) {
    if (!scaffoldLogId) return [];
    try {
      return await pb.collection('inspections').getFullList({
        filter: pb.filter('scaffold_log_id = {:lid}', { lid: scaffoldLogId }),
        sort: '-created',
        $autoCancel: false,
      });
    } catch (error) {
      console.error('[inspectionService] Failed to fetch scaffold-specific inspections:', error);
      return [];
    }
  },

  /**
   * Create a new inspection and auto-update the scaffold tag.
   * @param {Object} data - Inspection data
   * @param {string} data.status - 'pass' | 'fail'
   * @param {string} data.notes
   * @param {Object} data.checklist
   * @param {string} data.scaffold_log_id - ID of the scaffold log being inspected
   * @param {string} data.project_id
   * @param {number} intervalDays - Project inspection interval (for next_due calc)
   */
  async create(data, intervalDays = 28) {
    if (!data.status) throw new Error('Missing required field: status.');

    const nextDue = new Date();
    nextDue.setDate(nextDue.getDate() + intervalDays);

    const payload = {
      status: data.status,
      notes: data.notes || '',
      checklist: data.checklist || {},
      next_inspection_date: nextDue.toISOString(),
      inspector_id: pb.authStore.record?.id || pb.authStore.model?.id,
      // Scaffold linking
      scaffold_log_id: data.scaffold_log_id || null,
      project_id: data.project_id || null,
      // Backward compat: keep scaffold_id = project_id
      scaffold_id: data.project_id || data.scaffold_id || null,
    };

    try {
      const record = await pb.collection('inspections').create(payload, { $autoCancel: false });

      // Auto-update scaffold tag if scaffold_log_id provided
      if (data.scaffold_log_id) {
        await this.updateScaffoldTagAfterInspection(
          data.scaffold_log_id,
          data.status,
          intervalDays,
          nextDue
        );
      }

      return record;
    } catch (error) {
      console.error('[inspectionService] Failed to create inspection:', error);
      const message = error.data?.message || 'Failed to save inspection.';
      throw new Error(message);
    }
  },

  /**
   * After an inspection, find the scaffold_tag linked to scaffold_log_id
   * and update its status + next_inspection_due.
   * pass → green, fail → red
   * @param {string} scaffoldLogId
   * @param {string} inspectionStatus - 'pass' | 'fail'
   * @param {number} intervalDays
   * @param {Date} nextDueDate
   */
  async updateScaffoldTagAfterInspection(scaffoldLogId, inspectionStatus, intervalDays, nextDueDate) {
    try {
      const tagStatus = inspectionStatus === 'pass' ? 'green' : 'red';

      // Find the tag linked to this scaffold log
      const tags = await pb.collection('scaffold_tags').getFullList({
        filter: pb.filter('scaffold_log_id = {:lid}', { lid: scaffoldLogId }),
        $autoCancel: false,
      });

      if (!tags.length) {
        console.warn('[inspectionService] No scaffold_tag found for scaffold_log_id:', scaffoldLogId);
        return;
      }

      const tag = tags[0];
      await pb.collection('scaffold_tags').update(tag.id, {
        status: tagStatus,
        next_inspection_due: nextDueDate.toISOString(),
        notes: `Last inspection: ${inspectionStatus.toUpperCase()} on ${new Date().toLocaleDateString('de-DE')}`,
      }, { $autoCancel: false });

      console.log(`[inspectionService] Scaffold tag ${tag.id} updated → ${tagStatus}`);
    } catch (error) {
      // Non-fatal: tag update failing shouldn't block the inspection record
      console.warn('[inspectionService] Could not update scaffold_tag (non-fatal):', error.message);
    }
  },
};
