import React, { useState, useEffect } from 'react';
import { X, ChevronRight, AlertTriangle, Clock, CheckCircle2, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import pb from '@/lib/pocketbaseClient';

const STORAGE_KEY = 'tms_briefing_date';

/**
 * Rule-based AI Morning Briefing.
 * Shows once per calendar day on the Dashboard.
 * Reads real data: overdue inspections, red tags, upcoming inspections.
 * Fully i18n — EN by default, DE when language is switched.
 */
const MorningBriefing = ({ projectId, projectName }) => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [briefing, setBriefing] = useState(null);

  useEffect(() => {
    if (!projectId) return;

    // Only show once per day (per project)
    const storageKey = `${STORAGE_KEY}_${projectId}`;
    const lastShown = localStorage.getItem(storageKey);
    const todayKey = new Date().toDateString();
    if (lastShown === todayKey) return;

    const generate = async () => {
      const today = new Date();
      const todayISO = today.toISOString();
      const in7daysISO = new Date(today.getTime() + 7 * 86400000).toISOString();

      try {
        const [overdue, redTags, upcoming] = await Promise.all([
          pb.collection('inspections').getFullList({
            filter: pb.filter('project_id = {:pid} && next_inspection_date != "" && next_inspection_date < {:d}', { pid: projectId, d: todayISO }),
            $autoCancel: false,
          }).catch(() => []),
          pb.collection('scaffold_tags').getFullList({
            filter: pb.filter('project_id = {:pid} && status = "red"', { pid: projectId }),
            $autoCancel: false,
          }).catch(() => []),
          pb.collection('inspections').getFullList({
            filter: pb.filter('project_id = {:pid} && next_inspection_date >= {:d1} && next_inspection_date <= {:d2}', { pid: projectId, d1: todayISO, d2: in7daysISO }),
            sort: 'next_inspection_date',
            $autoCancel: false,
          }).catch(() => []),
        ]);

        const userName =
          pb.authStore.record?.full_name ||
          pb.authStore.record?.name ||
          pb.authStore.model?.full_name ||
          pb.authStore.model?.name ||
          '';

        const firstName = userName.split(' ')[0];
        const hour = new Date().getHours();

        let greeting;
        if (firstName) {
          if (hour < 12) greeting = t('briefing.greeting_morning', { name: firstName });
          else if (hour < 18) greeting = t('briefing.greeting_afternoon', { name: firstName });
          else greeting = t('briefing.greeting_evening', { name: firstName });
        } else {
          if (hour < 12) greeting = t('briefing.greeting_morning_anon');
          else greeting = t('briefing.greeting_afternoon_anon');
        }

        // Build status lines
        const lines = [];
        const actions = [];
        const allClear = overdue.length === 0 && redTags.length === 0 && upcoming.length === 0;

        if (allClear) {
          lines.push({ text: t('briefing.all_clear_project', { name: projectName }), type: 'ok' });
          lines.push({ text: t('briefing.all_clear_detail'), type: 'ok' });
        } else {
          if (overdue.length > 0) {
            lines.push({
              text: t('briefing.overdue', { count: overdue.length }),
              type: 'critical',
            });
            actions.push({ label: t('briefing.action_schedule'), to: '/dashboard/inspections' });
          }
          if (redTags.length > 0) {
            lines.push({
              text: t('briefing.red_tag', { count: redTags.length }),
              type: 'critical',
            });
            actions.push({ label: t('briefing.action_view_tags'), to: '/scaffold-tags' });
          }
          if (upcoming.length > 0) {
            const nextDate = new Date(upcoming[0].next_inspection_date);
            const daysUntil = Math.ceil((nextDate - today) / 86400000);
            lines.push({
              text: t('briefing.upcoming', { count: upcoming.length, days: daysUntil }),
              type: 'warning',
            });
          }
        }

        setBriefing({ greeting, lines, actions, allClear });
        setVisible(true);
      } catch (err) {
        console.warn('[MorningBriefing]', err);
      }
    };

    generate();
  }, [projectId, projectName, t]);

  const dismiss = () => {
    const storageKey = `${STORAGE_KEY}_${projectId}`;
    localStorage.setItem(storageKey, new Date().toDateString());
    setVisible(false);
  };

  if (!visible || !briefing) return null;

  const borderColor = briefing.allClear
    ? 'border-l-green-400'
    : briefing.lines.some((l) => l.type === 'critical')
    ? 'border-l-red-400'
    : 'border-l-amber-400';

  return (
    <Card className={`border-l-4 ${borderColor} mb-1 shadow-sm`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Header row */}
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <p className="font-semibold text-sm">{briefing.greeting}</p>
            </div>

            {/* Status lines */}
            <div className="space-y-1">
              {briefing.lines.map((line, i) => {
                const lineColor =
                  line.type === 'critical'
                    ? 'text-red-600 dark:text-red-400'
                    : line.type === 'warning'
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-muted-foreground';
                const Icon =
                  line.type === 'critical'
                    ? AlertTriangle
                    : line.type === 'warning'
                    ? Clock
                    : CheckCircle2;

                return (
                  <div key={i} className={`flex items-start gap-2 text-sm ${lineColor}`}>
                    <Icon className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    <span
                      dangerouslySetInnerHTML={{
                        __html: line.text.replace(
                          /\*\*(.*?)\*\*/g,
                          '<strong class="font-semibold">$1</strong>'
                        ),
                      }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Action links */}
            {briefing.actions.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-3">
                {briefing.actions.map((a, i) => (
                  <Link
                    key={i}
                    to={a.to}
                    onClick={dismiss}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    {a.label}
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Dismiss */}
          <button
            onClick={dismiss}
            className="p-1 rounded-md hover:bg-muted transition-colors flex-shrink-0 mt-0.5"
            aria-label="Dismiss briefing"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MorningBriefing;
