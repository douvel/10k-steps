import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Linking, Switch,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Polyline } from 'react-native-svg';
import { useHealthData } from '../../hooks/useHealthData';
import { useStepGoal } from '../../hooks/useStepGoal';
import { useState } from 'react';
import { useLocale } from '../../i18n';
import type { Translations } from '../../i18n/locales/en';

const ACCENT = '#FF5C2E';
const BG = '#0A0A0F';
const CARD_BG = '#1A1A22';

function fmtK(n: number, localeTag: string): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return Math.round(n).toLocaleString(localeTag);
}

// ── Pace state ────────────────────────────────────────────────────────────────

type PaceState = { color: string; emoji: string; label: string; totalLabel: string };

function getPaceState(t: Translations, localeTag: string, diff: number, goal: number, cumulativeDelta: number, monthDone: boolean): PaceState {
  const absDiff = Math.round(Math.abs(diff)).toLocaleString(localeTag);
  const plusDiff = Math.round(diff).toLocaleString(localeTag);
  const absTotal = Math.round(Math.abs(cumulativeDelta)).toLocaleString(localeTag);
  const plusTotal = Math.round(cumulativeDelta).toLocaleString(localeTag);
  if (monthDone)        return { color: '#F59E0B', emoji: '👏', label: t.dashboard.paceGoalReached, totalLabel: t.dashboard.paceGoalReached };
  const ratio = diff / goal;
  if (ratio < -0.10)   return { color: '#DC2626', emoji: '😰', label: t.dashboard.paceBehindPerDay(absDiff), totalLabel: t.dashboard.paceBehindTotal(absTotal) };
  if (ratio < -0.04)   return { color: '#EF4444', emoji: '😥', label: t.dashboard.paceBehindPerDay(absDiff), totalLabel: t.dashboard.paceBehindTotal(absTotal) };
  if (ratio < -0.01)   return { color: '#3B82F6', emoji: '😯', label: t.dashboard.paceBehindPerDay(absDiff), totalLabel: t.dashboard.paceBehindTotal(absTotal) };
  if (ratio <=  0.01)  return { color: '#3B82F6', emoji: '🫡', label: t.dashboard.paceOnTrack, totalLabel: t.dashboard.paceOnTrack };
  if (ratio <=  0.04)  return { color: '#3B82F6', emoji: '👍', label: t.dashboard.paceAheadPerDay(plusDiff), totalLabel: t.dashboard.paceAheadTotal(plusTotal) };
  if (ratio <=  0.10)  return { color: '#4ADE80', emoji: '💪', label: t.dashboard.paceAheadPerDay(plusDiff), totalLabel: t.dashboard.paceAheadTotal(plusTotal) };
  return                      { color: '#16A34A', emoji: '🤩', label: t.dashboard.paceAheadPerDay(plusDiff), totalLabel: t.dashboard.paceAheadTotal(plusTotal) };
}

// ── XP Hero ───────────────────────────────────────────────────────────────────

function XPHero({ progress, steps, goal }: { progress: number; steps: number; goal: number }) {
  const { t, localeTag } = useLocale();
  const over = progress >= 1;

  return (
    <View style={styles.xpHero}>
      {/* Step count */}
      <View style={styles.xpCountRow}>
        <Text style={[styles.xpSteps, over && { color: ACCENT }]}>
          {Math.floor(steps).toLocaleString(localeTag)}
        </Text>
        <Text style={styles.xpGoal}>/{goal >= 1000 ? `${(goal/1000).toFixed(0)}k` : goal}</Text>
      </View>
      <Text style={styles.xpLabel}>{t.dashboard.stepsToday}</Text>
    </View>
  );
}

// ── Metric card ───────────────────────────────────────────────────────────────

function MetricCard({ label, value, sub, glowing, topRight }: {
  label: string; value: string; sub?: string; glowing?: boolean; topRight?: React.ReactNode;
}) {
  return (
    <View style={[styles.card, glowing && styles.cardGlowing]}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={[styles.cardValue, glowing && styles.cardValueGlowing]}>{value}</Text>
      {(sub || topRight) ? (
        <View style={styles.cardFooter}>
          {sub ? <Text style={styles.cardSub}>{sub}</Text> : null}
          {topRight ?? null}
        </View>
      ) : null}
    </View>
  );
}

// ── Monthly progress bar ──────────────────────────────────────────────────────

function MonthlyProgressBar({ total, goal, dayOfMonth, daysInMonth, state }: {
  total: number; goal: number; dayOfMonth: number; daysInMonth: number; state: PaceState;
}) {
  const { t, localeTag } = useLocale();
  const { color, emoji, label, totalLabel } = state;
  const [showPerDay, setShowPerDay] = useState(false);
  const fillPct = Math.min(1, total / goal);
  const idealPct = Math.min(1, dayOfMonth / daysInMonth);
  const displayPct = Math.round(fillPct * 100);

  return (
    <View style={styles.monthBar}>
      <Text style={styles.monthBarSectionLabel}>{t.dashboard.monthlyProgressTitle}</Text>
      <View style={styles.monthBarCard}>
        <View style={styles.monthBarLabels}>
          <Text style={styles.monthBarTotal}>{fmtK(total, localeTag)}</Text>
          <Text style={[styles.monthBarPct, { color }]}>{displayPct}%</Text>
          <Text style={styles.monthBarGoal}>{fmtK(goal, localeTag)}</Text>
        </View>
        <View style={styles.monthBarOuter}>
          <View style={styles.monthBarTrack}>
            <View style={[styles.monthBarFill, { width: `${fillPct * 100}%` as any, backgroundColor: color }]} />
          </View>
          <View style={[styles.monthBarTick, { left: `${idealPct * 100}%` as any }]} />
        </View>
        <View style={styles.monthBarHints}>
          <TouchableOpacity onPress={() => setShowPerDay(s => !s)} activeOpacity={0.7}>
            <Text style={[styles.monthBarHintRight, { color }]}>{emoji}  {showPerDay ? label : totalLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ── Pace badge ────────────────────────────────────────────────────────────────

function PaceBadge({ state }: { state: PaceState }) {
  const { color, emoji, label } = state;
  return (
    <View style={[styles.pace, { borderColor: `${color}50`, backgroundColor: `${color}18` }]}>
      <Text style={styles.paceEmoji}>{emoji}</Text>
      <Text style={[styles.paceText, { color }]}>{label}</Text>
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function DashboardScreen() {
  const { top } = useSafeAreaInsets();
  const { t, localeTag } = useLocale();
  const { todaySteps, monthHistory, isMockData, isLoading, error, refresh } = useHealthData();
  const { dailyGoal } = useStepGoal();
  const [excludeToday, setExcludeToday] = useState(false);

  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dayOfMonth = now.getDate();
  const daysElapsed = Math.max(1, dayOfMonth);
  const daysRemaining = Math.max(1, daysInMonth - dayOfMonth + 1);

  const monthlyGoal = dailyGoal * daysInMonth;
  // Use local date — toISOString() is UTC and shifts dates near midnight in UTC+N zones
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  // Always use live todaySteps — getDailyStepCountSamples can lag or omit today entirely
  const historicalTotal = monthHistory
    .filter(d => d.date !== todayKey)
    .reduce((sum, d) => sum + d.steps, 0);
  const monthlyTotal = historicalTotal + todaySteps;
  const dailyAverage = Math.round(monthlyTotal / daysElapsed);
  const remainingSteps = Math.max(0, monthlyGoal - monthlyTotal);
  const daysForAverage = excludeToday ? Math.max(1, daysRemaining - 1) : daysRemaining;
  const requiredDailyAverage = Math.round(remainingSteps / daysForAverage);

  const monthDone = monthlyTotal >= monthlyGoal;
  const cumulativeDelta = monthlyTotal - dailyGoal * daysElapsed;
  const paceState = getPaceState(t, localeTag, dailyAverage - dailyGoal, dailyGoal, cumulativeDelta, monthDone);

  const goalReached = todaySteps >= dailyGoal;
  const progress = todaySteps / dailyGoal;
  const pct = Math.min(100, Math.round(progress * 100));

  const monthName = now.toLocaleDateString(localeTag, { month: 'long', year: 'numeric' });

  if (isLoading) {
    return (
      <View style={[styles.center, { paddingTop: top }]}>
        <ActivityIndicator size="large" color={ACCENT} />
        <Text style={styles.loadingText}>{t.common.loading}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingTop: top }]}>
      <StatusBar style="light" />

      {/* Mock data banner */}
      {isMockData && (
        <View style={styles.mockBanner}>
          <Text style={styles.mockBannerText}>{t.dashboard.mockBannerText}</Text>
          {error ? <Text style={styles.mockBannerError} selectable>{error}</Text> : null}
          <TouchableOpacity style={styles.mockBannerButton} onPress={() => Linking.openURL('x-apple-health://').catch(() => Linking.openSettings())}>
            <Text style={styles.mockBannerButtonText}>{t.dashboard.openHealthSettings}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={refresh}>
            <Text style={styles.mockBannerRetry}>{t.common.retry}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerMonth}>{monthName}</Text>
          <Text style={styles.headerTitle}>{t.tabs.dashboardTitle}</Text>
        </View>
      </View>

      {/* XP Hero */}
      <View style={styles.hero}>
        <XPHero progress={progress} steps={todaySteps} goal={dailyGoal} />
      </View>

      {/* Monthly progress */}
      <MonthlyProgressBar
        total={monthlyTotal}
        goal={monthlyGoal}
        dayOfMonth={dayOfMonth}
        daysInMonth={daysInMonth}
        state={paceState}
      />

      {/* Metrics 2×2 */}
      <View style={styles.grid}>
        <View style={styles.gridRow}>
          <MetricCard label={t.dashboard.totalMonth} value={fmtK(monthlyTotal, localeTag)} sub={t.dashboard.stepsThisMonth} />
          <MetricCard label={t.dashboard.averagePerDay} value={dailyAverage.toLocaleString(localeTag)} sub={t.common.overDays(daysElapsed)} glowing={dailyAverage >= dailyGoal} />
        </View>
        <View style={styles.gridRow}>
          <MetricCard label={t.dashboard.remainingThisMonth} value={fmtK(remainingSteps, localeTag)} sub={`/ ${fmtK(monthlyGoal, localeTag)}`} glowing={remainingSteps === 0} />
          <MetricCard
            label={t.dashboard.requiredAverage}
            value={requiredDailyAverage.toLocaleString(localeTag)}
            sub={excludeToday
              ? t.dashboard.overDaysFromTomorrow(daysForAverage)
              : t.dashboard.overDaysIncludingToday(daysForAverage)}
            glowing={requiredDailyAverage <= dailyGoal}
            topRight={daysRemaining > 1 ? (
              <Switch
                value={excludeToday}
                onValueChange={setExcludeToday}
                trackColor={{ false: 'rgba(255,255,255,0.1)', true: `${ACCENT}60` }}
                thumbColor={excludeToday ? ACCENT : 'rgba(255,255,255,0.4)'}
                ios_backgroundColor="rgba(255,255,255,0.1)"
                style={{ transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }] }}
              />
            ) : undefined}
          />
        </View>
      </View>

      {/* Refresh */}
      <TouchableOpacity style={styles.refreshBtn} onPress={refresh} activeOpacity={0.8}>
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
          <Polyline points="23 4 23 10 17 10" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />
          <Polyline points="1 20 1 14 7 14" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />
          <Path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />
        </Svg>
        <Text style={styles.refreshBtnText}>{t.common.refresh}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  content: { paddingBottom: 32 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: BG },
  loadingText: { fontSize: 15, color: 'rgba(255,255,255,0.4)' },

  mockBanner: {
    backgroundColor: 'rgba(254,243,199,0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(254,243,199,0.15)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    alignItems: 'center',
  },
  mockBannerText: { fontSize: 13, fontWeight: '600', color: '#FDE68A', textAlign: 'center' },
  mockBannerError: { fontSize: 11, color: '#FCA5A5', textAlign: 'center', fontFamily: 'Courier', padding: 6, borderRadius: 6, width: '100%' },
  mockBannerButton: { backgroundColor: ACCENT, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 },
  mockBannerButtonText: { color: '#000', fontSize: 13, fontWeight: '700' },
  mockBannerRetry: { fontSize: 12, color: 'rgba(255,255,255,0.4)', textDecorationLine: 'underline' },

  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerMonth: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.35)',
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.5,
  },
  hero: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 16,
    gap: 20,
  },

  xpHero: { width: '100%', alignItems: 'center', gap: 8 },
  xpCountRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  xpSteps: {
    fontSize: 64, fontWeight: '900', color: '#fff',
    letterSpacing: -2, lineHeight: 68,
  },
  xpGoal: {
    fontSize: 20, fontWeight: '700',
    color: 'rgba(255,255,255,0.3)',
    marginBottom: 8,
  },
  xpLabel: {
    fontSize: 11, fontWeight: '700', letterSpacing: 2,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.35)',
  },

  pace: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderRadius: 12, paddingVertical: 8, paddingHorizontal: 14,
    borderWidth: 1,
  },
  paceEmoji: { fontSize: 14 },
  paceText: { fontSize: 12, fontWeight: '600' },

  monthBar: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  monthBarSectionLabel: {
    fontSize: 10, fontWeight: '700', letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.35)',
    marginBottom: 8,
  },
  monthBarCard: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  monthBarLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  monthBarTotal: {
    fontSize: 13, fontWeight: '700', color: '#fff',
  },
  monthBarPct: {
    fontSize: 22, fontWeight: '900', color: 'rgba(255,255,255,0.25)',
    letterSpacing: -0.5,
  },

  monthBarGoal: {
    fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.3)',
  },
  monthBarOuter: {
    position: 'relative',
    height: 18,
    justifyContent: 'center',
  },
  monthBarTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  monthBarFill: {
    height: '100%',
    backgroundColor: ACCENT,
    borderRadius: 5,
  },
  monthBarTick: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: 'rgba(255,255,255,0.45)',
    borderRadius: 1,
    transform: [{ translateX: -1 }],
  },
  monthBarHints: {
    marginTop: 8,
    alignItems: 'center',
  },
  monthBarHintRight: {
    fontSize: 15, fontWeight: '700',
  },


  grid: { paddingHorizontal: 16, gap: 8 },
  gridRow: { flexDirection: 'row', gap: 8 },
  card: {
    flex: 1,
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  cardGlowing: {
    backgroundColor: `${ACCENT}12`,
    borderColor: `${ACCENT}40`,
  },
  cardLabel: {
    fontSize: 10, fontWeight: '700', letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.35)',
    marginBottom: 6,
  },
  cardValue: {
    fontSize: 26, fontWeight: '800', color: '#fff',
    letterSpacing: -0.5, lineHeight: 28,
  },
  cardValueGlowing: { color: ACCENT },
  cardSub: { fontSize: 10, color: 'rgba(255,255,255,0.3)', flex: 1 },

  refreshBtn: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: ACCENT,
    borderRadius: 14,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  refreshBtnText: {
    fontSize: 15, fontWeight: '800', letterSpacing: 1.5, color: '#000',
  },
});
