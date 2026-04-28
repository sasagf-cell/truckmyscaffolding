import { useState, useEffect, useCallback } from 'react';
import i18next from 'i18next';
import pb from '../../../lib/pocketbaseClient';

/**
 * Computes real-time in-app notifications from PocketBase data.
 * No separate collection — derives alerts from:
 *   1. inspections collection (overdue + upcoming 7 days)
 *   2. scaffold_tags (red status = failed)
 *   3. scaffold_tags.next_inspection_due (overdue + due ≤3 days) — Task #13
 *
 * Sprint 3D: fully i18n via i18next.
 * Task #13: extended to cover scaffold_tags inspection due dates.
 */
export const useNotifications = (projectId) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState(i18next.language);

  useEffect(() => {
    const handler = (lng) => setLang(lng);
    i18next.on('languageChanged', handler);
    return () => i18next.off('languageChanged', handler);
  }, []);

  const refresh = useCallback(async () => {
    if (!projectId) { setNotifications([]); return; }

    const t = i18next.t.bind(i18next);

    setLoading(true);
    const items = [];
    const today = new Date();
    const todayISO = today.toISOString();
    // Use local calendar date — toISOString() returns UTC which can be ±1 day off
    // in UTC+2 (Germany/EPC sites). Critical for safety-relevant inspection dates.
    const localDateStr = (d) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const todayStr = localDateStr(today); // YYYY-MM-DD in local TZ

    const in7days = new Date(today);
    in7days.setDate(in7days.getDate() + 7);
    const in7daysISO = in7days.toISOString();

    const in3days = new Date(today);
    in3days.setDate(in3days.getDate() + 3);
    const in3daysStr = localDateStr(in3days);

    try {
      // ── 1. Overdue inspections (inspections collection, datetime field) ─────
      const overdueInspections = await pb.collection('inspections').getFullList({
        filter: pb.filter('project_id = {:pid} && next_inspection_date != "" && next_inspection_date < {:d}', { pid: projectId, d: todayISO }),
        sort: 'next_inspection_date',
        expand: 'scaffold_log_id',
        $autoCancel: false,
      }).catch(() => []);

      overdueInspections.forEach((insp) => {
        const scaffoldNum =
          insp.expand?.scaffold_log_id?.scaffold_number ||
          (insp.scaffold_log_id ? `LOG-${insp.scaffold_log_id.slice(-4).toUpperCase()}` : 'Unknown');
        const daysOverdue = Math.floor((today - new Date(insp.next_inspection_date)) / 86400000);
        items.push({
          id: `overdue-${insp.id}`,
          type: 'overdue',
          severity: 'high',
          title: t('notifications.overdue_inspection'),
          message: `${scaffoldNum} — ${t('notifications.days_overdue', { count: daysOverdue })}`,
          date: insp.next_inspection_date,
          link: '/dashboard/inspections',
        });
      });

      // ── 2. Red scaffold tags (failed inspection — DO NOT USE) ──────────────
      const redTags = await pb.collection('scaffold_tags').getFullList({
        filter: pb.filter('project_id = {:pid} && status = "red"', { pid: projectId }),
        expand: 'scaffold_log_id',
        $autoCancel: false,
      }).catch(() => []);

      redTags.forEach((tag) => {
        const scaffoldNum =
          tag.scaffold_number ||
          tag.expand?.scaffold_log_id?.scaffold_number ||
          `TAG-${tag.id.slice(-4).toUpperCase()}`;
        items.push({
          id: `red-${tag.id}`,
          type: 'red_tag',
          severity: 'high',
          title: t('notifications.do_not_use'),
          message: `${scaffoldNum} — ${t('notifications.failed_last')}`,
          date: tag.updated,
          link: '/scaffold-tags',
        });
      });

      // ── 3. Upcoming inspections within 7 days (inspections collection) ──────
      const upcoming = await pb.collection('inspections').getFullList({
        filter: pb.filter('project_id = {:pid} && next_inspection_date >= {:d1} && next_inspection_date <= {:d2}', { pid: projectId, d1: todayISO, d2: in7daysISO }),
        sort: 'next_inspection_date',
        expand: 'scaffold_log_id',
        $autoCancel: false,
      }).catch(() => []);

      upcoming.forEach((insp) => {
        const scaffoldNum =
          insp.expand?.scaffold_log_id?.scaffold_number ||
          (insp.scaffold_log_id ? `LOG-${insp.scaffold_log_id.slice(-4).toUpperCase()}` : 'Unknown');
        const daysUntil = Math.ceil((new Date(insp.next_inspection_date) - today) / 86400000);
        items.push({
          id: `upcoming-${insp.id}`,
          type: 'upcoming',
          severity: daysUntil <= 2 ? 'medium' : 'low',
          title: t('notifications.due_soon'),
          message: `${scaffoldNum} — ${t('notifications.in_days', { count: daysUntil })}`,
          date: insp.next_inspection_date,
          link: '/dashboard/inspections',
        });
      });

      // ── 4. Scaffold tags — overdue next_inspection_due ────────────────────
      // next_inspection_due is a date-only field (YYYY-MM-DD)
      const overdueTagInspections = await pb.collection('scaffold_tags').getFullList({
        filter: pb.filter('project_id = {:pid} && status != "inactive" && next_inspection_due != "" && next_inspection_due < {:d}', { pid: projectId, d: todayStr }),
        sort: 'next_inspection_due',
        $autoCancel: false,
      }).catch(() => []);

      // Build set of scaffold numbers already represented by inspections-collection overdue alerts
      // to avoid showing the same scaffold twice (duplicate notification bug)
      const overdueScaffoldNums = new Set(
        items
          .filter((i) => i.type === 'overdue')
          .map((i) => i.message.split(' — ')[0])
      );

      overdueTagInspections.forEach((tag) => {
        // Skip if already covered by red_tag entry (same tag)
        if (items.find((i) => i.id === `red-${tag.id}`)) return;

        const scaffoldNum = tag.scaffold_number || `TAG-${tag.id.slice(-4).toUpperCase()}`;
        // Skip if inspections collection already has an overdue alert for the same scaffold
        if (overdueScaffoldNums.has(scaffoldNum)) return;

        const daysOverdue = Math.floor(
          (today - new Date(tag.next_inspection_due)) / 86400000
        );
        items.push({
          id: `tag-overdue-${tag.id}`,
          type: 'overdue',
          severity: 'high',
          title: t('notifications.overdue_inspection'),
          message: `${scaffoldNum} — ${t('notifications.days_overdue', { count: daysOverdue })}`,
          date: tag.next_inspection_due,
          link: '/scaffold-tags',
        });
      });

      // ── 5. Scaffold tags — due within 3 days ─────────────────────────────
      const dueSoonTags = await pb.collection('scaffold_tags').getFullList({
        filter: pb.filter('project_id = {:pid} && status != "inactive" && next_inspection_due != "" && next_inspection_due >= {:d1} && next_inspection_due <= {:d2}', { pid: projectId, d1: todayStr, d2: in3daysStr }),
        sort: 'next_inspection_due',
        $autoCancel: false,
      }).catch(() => []);

      // Same dedup logic for upcoming alerts
      const upcomingScaffoldNums = new Set(
        items
          .filter((i) => i.type === 'upcoming')
          .map((i) => i.message.split(' — ')[0])
      );

      dueSoonTags.forEach((tag) => {
        const scaffoldNum = tag.scaffold_number || `TAG-${tag.id.slice(-4).toUpperCase()}`;
        // Skip if inspections collection already has an upcoming alert for the same scaffold
        if (upcomingScaffoldNums.has(scaffoldNum)) return;

        const daysLeft = Math.ceil(
          (new Date(tag.next_inspection_due) - today) / 86400000
        );
        items.push({
          id: `tag-soon-${tag.id}`,
          type: 'upcoming',
          severity: daysLeft <= 1 ? 'medium' : 'low',
          title: t('notifications.due_soon'),
          message: daysLeft === 0
            ? `${scaffoldNum} — Today!`
            : `${scaffoldNum} — ${t('notifications.in_days', { count: daysLeft })}`,
          date: tag.next_inspection_due,
          link: '/scaffold-tags',
        });
      });

    } catch (err) {
      console.error('[useNotifications]', err);
    } finally {
      setLoading(false);
    }

    // Sort: high → medium → low, then by date ascending
    const order = { high: 0, medium: 1, low: 2 };
    items.sort((a, b) => {
      const sev = order[a.severity] - order[b.severity];
      if (sev !== 0) return sev;
      return new Date(a.date) - new Date(b.date);
    });

    setNotifications(items);
  }, [projectId, lang]);

  useEffect(() => { refresh(); }, [refresh]);

  // Poll every 5 minutes to catch newly overdue items
  useEffect(() => {
    if (!projectId) return;
    const interval = setInterval(refresh, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [projectId, refresh]);

  const criticalCount = notifications.filter((n) => n.severity === 'high').length;

  return { notifications, loading, refresh, criticalCount };
};
