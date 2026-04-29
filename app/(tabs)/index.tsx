import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Linking,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Polyline } from 'react-native-svg';
import { useHealthData } from '../../hooks/useHealthData';
import { useStepGoal } from '../../hooks/useStepGoal';

const ACCENT = '#FF5C2E';
const BG = '#0A0A0F';
const CARD_BG = '#1A1A22';

function fmtK(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return Math.round(n).toLocaleString('fr-FR');
}

// ── XP Hero ───────────────────────────────────────────────────────────────────

const SEGMENTS = 10;

function XPHero({ progress, steps, goal }: { progress: number; steps: number; goal: number }) {
  const pct = Math.min(1, progress);
  const filledSegs = Math.floor(pct * SEGMENTS);
  const partialFill = (pct * SEGMENTS) - filledSegs;
  const over = progress >= 1;

  return (
    <View style={styles.xpHero}>
      {/* Step count */}
      <View style={styles.xpCountRow}>
        <Text style={[styles.xpSteps, over && { color: ACCENT }]}>
          {Math.floor(steps).toLocaleString('fr-FR')}
        </Text>
        <Text style={styles.xpGoal}>/{goal >= 1000 ? `${(goal/1000).toFixed(0)}k` : goal}</Text>
      </View>
      <Text style={styles.xpLabel}>PAS AUJOURD'HUI</Text>

      {/* Segmented XP bar */}
      <View style={styles.xpBarWrap}>
        {Array.from({ length: SEGMENTS }).map((_, i) => {
          let fill = 0;
          if (i < filledSegs) fill = 1;
          else if (i === filledSegs) fill = partialFill;
          return (
            <View key={i} style={styles.xpSegTrack}>
              <View style={[
                styles.xpSegFill,
                { width: `${fill * 100}%` as `${number}%` },
                over && { backgroundColor: ACCENT },
              ]} />
            </View>
          );
        })}
      </View>

      {/* Percentage badge */}
      <View style={[styles.xpPctBadge, over && styles.xpPctBadgeOver]}>
        <Text style={[styles.xpPctText, over && { color: ACCENT }]}>
          {over ? '✓ OBJECTIF' : `${Math.round(pct * 100)}%`}
        </Text>
      </View>
    </View>
  );
}

// ── Metric card ───────────────────────────────────────────────────────────────

function MetricCard({ label, value, sub, glowing }: {
  label: string; value: string; sub?: string; glowing?: boolean;
}) {
  return (
    <View style={[styles.card, glowing && styles.cardGlowing]}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={[styles.cardValue, glowing && styles.cardValueGlowing]}>{value}</Text>
      {sub ? <Text style={styles.cardSub}>{sub}</Text> : null}
    </View>
  );
}

// ── Pace badge ────────────────────────────────────────────────────────────────

function PaceBadge({ avg, goal }: { avg: number; goal: number }) {
  const ahead = avg >= goal;
  const diff = Math.round(Math.abs(avg - goal)).toLocaleString('fr-FR');
  const color = ahead ? ACCENT : '#FF5C2E';
  return (
    <View style={[styles.pace, { borderColor: ahead ? `${ACCENT}40` : 'rgba(255,92,46,0.3)', backgroundColor: ahead ? `${ACCENT}18` : 'rgba(255,92,46,0.15)' }]}>
      <View style={[styles.paceDot, { backgroundColor: color, shadowColor: color }]} />
      <Text style={[styles.paceText, { color }]}>
        {ahead ? `+${diff} pas/j d'avance` : `${diff} pas/j de retard`}
      </Text>
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function DashboardScreen() {
  const { top } = useSafeAreaInsets();
  const { todaySteps, monthHistory, isMockData, isLoading, error, refresh } = useHealthData();
  const { dailyGoal } = useStepGoal();

  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dayOfMonth = now.getDate();
  const daysElapsed = Math.max(1, dayOfMonth);
  const daysRemaining = Math.max(1, daysInMonth - dayOfMonth + 1);

  const monthlyGoal = dailyGoal * daysInMonth;
  const todayKey = now.toISOString().split('T')[0];
  // Always use live todaySteps — getDailyStepCountSamples can lag or omit today entirely
  const historicalTotal = monthHistory
    .filter(d => d.date !== todayKey)
    .reduce((sum, d) => sum + d.steps, 0);
  const monthlyTotal = historicalTotal + todaySteps;
  const dailyAverage = Math.round(monthlyTotal / daysElapsed);
  const remainingSteps = Math.max(0, monthlyGoal - monthlyTotal);
  const requiredDailyAverage = Math.round(remainingSteps / daysRemaining);

  const goalReached = todaySteps >= dailyGoal;
  const progress = todaySteps / dailyGoal;
  const pct = Math.min(100, Math.round(progress * 100));

  const monthName = now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  if (isLoading) {
    return (
      <View style={[styles.center, { paddingTop: top }]}>
        <ActivityIndicator size="large" color={ACCENT} />
        <Text style={styles.loadingText}>Chargement…</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingTop: top }]}>
      <StatusBar style="light" />

      {/* Mock data banner */}
      {isMockData && (
        <View style={styles.mockBanner}>
          <Text style={styles.mockBannerText}>Données simulées — accès Santé requis</Text>
          {error ? <Text style={styles.mockBannerError} selectable>{error}</Text> : null}
          <TouchableOpacity style={styles.mockBannerButton} onPress={() => Linking.openURL('x-apple-health://').catch(() => Linking.openSettings())}>
            <Text style={styles.mockBannerButtonText}>Ouvrir Réglages Santé</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={refresh}>
            <Text style={styles.mockBannerRetry}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerMonth}>{monthName}</Text>
          <Text style={styles.headerTitle}>Tableau de bord</Text>
        </View>
        <View style={styles.headerIcon}>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke={ACCENT} strokeWidth="2.5" strokeLinecap="round" />
          </Svg>
        </View>
      </View>

      {/* XP Hero */}
      <View style={styles.hero}>
        <XPHero progress={progress} steps={todaySteps} goal={dailyGoal} />
        <PaceBadge avg={dailyAverage} goal={dailyGoal} />
      </View>

      {/* Metrics 2×2 */}
      <View style={styles.grid}>
        <View style={styles.gridRow}>
          <MetricCard label="TOTAL DU MOIS" value={fmtK(monthlyTotal)} sub="pas ce mois-ci" />
          <MetricCard label="MOYENNE / JOUR" value={dailyAverage.toLocaleString('fr-FR')} sub={`sur ${daysElapsed} jours`} glowing={dailyAverage >= dailyGoal} />
        </View>
        <View style={styles.gridRow}>
          <MetricCard label="RESTANTS CE MOIS" value={fmtK(remainingSteps)} sub={`/ ${fmtK(monthlyGoal)}`} glowing={remainingSteps === 0} />
          <MetricCard label="MOYENNE REQUISE" value={requiredDailyAverage.toLocaleString('fr-FR')} sub={`sur ${daysRemaining} jours (incluant aujourd'hui)`} glowing={requiredDailyAverage <= dailyGoal} />
        </View>
      </View>

      {/* Refresh */}
      <TouchableOpacity style={styles.refreshBtn} onPress={refresh} activeOpacity={0.8}>
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
          <Polyline points="23 4 23 10 17 10" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />
          <Polyline points="1 20 1 14 7 14" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />
          <Path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />
        </Svg>
        <Text style={styles.refreshBtnText}>ACTUALISER</Text>
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
  headerIcon: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: `${ACCENT}20`,
    borderWidth: 1, borderColor: `${ACCENT}40`,
    alignItems: 'center', justifyContent: 'center',
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
  xpBarWrap: {
    flexDirection: 'row', gap: 3, width: '100%', marginTop: 4,
  },
  xpSegTrack: {
    flex: 1, height: 10, borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  xpSegFill: {
    height: '100%', borderRadius: 3, backgroundColor: ACCENT,
  },
  xpPctBadge: {
    marginTop: 4,
    paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  xpPctBadgeOver: {
    backgroundColor: `${ACCENT}20`,
    borderColor: `${ACCENT}50`,
  },
  xpPctText: {
    fontSize: 13, fontWeight: '800', letterSpacing: 1,
    color: 'rgba(255,255,255,0.6)',
  },

  pace: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderRadius: 12, paddingVertical: 8, paddingHorizontal: 14,
    borderWidth: 1,
  },
  paceDot: {
    width: 8, height: 8, borderRadius: 4,
    shadowOffset: { width: 0, height: 0 }, shadowRadius: 6, shadowOpacity: 1, elevation: 4,
  },
  paceText: { fontSize: 12, fontWeight: '600' },

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
  cardSub: { fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 4 },

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
