import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useHealthData } from '../../hooks/useHealthData';
import { useStepGoal } from '../../hooks/useStepGoal';

// ── Metric card ───────────────────────────────────────────────────────────────

interface MetricCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  highlight?: boolean;
}

function MetricCard({ label, value, subtitle, highlight }: MetricCardProps) {
  return (
    <View style={[styles.card, highlight && styles.cardHighlight]}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={[styles.cardValue, highlight && styles.cardValueHighlight]}>
        {typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
      </Text>
      {subtitle ? <Text style={styles.cardSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function DashboardScreen() {
  const { todaySteps, monthHistory, isMockData, isLoading, refresh } = useHealthData();
  const { dailyGoal } = useStepGoal();

  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dayOfMonth = now.getDate();
  const daysElapsed = Math.max(1, dayOfMonth);
  const daysRemaining = Math.max(1, daysInMonth - dayOfMonth);

  const monthlyGoal = dailyGoal * daysInMonth;
  const monthlyTotal = monthHistory.reduce((sum, d) => sum + d.steps, 0);
  const dailyAverage = Math.round(monthlyTotal / daysElapsed);
  const remainingSteps = Math.max(0, monthlyGoal - monthlyTotal);
  const requiredDailyAverage = Math.round(remainingSteps / daysRemaining);

  const goalReached = todaySteps >= dailyGoal;
  const progressPercent = Math.min(100, Math.round((todaySteps / dailyGoal) * 100));

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Chargement des données…</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <StatusBar style="dark" />

      {/* Mock data banner */}
      {isMockData && (
        <View style={styles.mockBanner}>
          <Text style={styles.mockBannerText}>
            Données simulées — autorisez l'accès Santé pour les vraies données
          </Text>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pas du jour</Text>
        <Text style={[styles.stepCount, goalReached ? styles.stepCountGreen : styles.stepCountOrange]}>
          {todaySteps.toLocaleString('fr-FR')}
        </Text>
        <View style={styles.progressRow}>
          {/* Progress bar */}
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${progressPercent}%` as `${number}%` },
                goalReached ? styles.progressFillGreen : styles.progressFillOrange,
              ]}
            />
          </View>
          <Text style={styles.progressLabel}>{progressPercent}%</Text>
        </View>
        <Text style={styles.goalLabel}>
          Objectif : {dailyGoal.toLocaleString('fr-FR')} pas
          {goalReached ? '  ✓' : ` — encore ${(dailyGoal - todaySteps).toLocaleString('fr-FR')} pas`}
        </Text>
      </View>

      {/* Metrics grid */}
      <View style={styles.grid}>
        <MetricCard
          label="Total du mois"
          value={monthlyTotal}
          subtitle="pas ce mois-ci"
        />
        <MetricCard
          label="Moyenne / jour"
          value={dailyAverage}
          subtitle={`sur ${daysElapsed} jour${daysElapsed > 1 ? 's' : ''}`}
        />
        <MetricCard
          label="Restants ce mois"
          value={remainingSteps}
          subtitle={`objectif : ${monthlyGoal.toLocaleString('fr-FR')}`}
          highlight={remainingSteps === 0}
        />
        <MetricCard
          label="Moyenne requise"
          value={requiredDailyAverage}
          subtitle={`sur ${daysRemaining} jour${daysRemaining > 1 ? 's' : ''} restants`}
          highlight={requiredDailyAverage <= dailyGoal}
        />
      </View>

      {/* Refresh button */}
      <TouchableOpacity style={styles.refreshButton} onPress={refresh}>
        <Text style={styles.refreshButtonText}>Actualiser</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const ORANGE = '#F97316';
const GREEN = '#16A34A';
const BLUE = '#2563EB';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    paddingBottom: 32,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    fontSize: 15,
    color: '#6B7280',
  },

  // Mock banner
  mockBanner: {
    backgroundColor: '#FEF3C7',
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  mockBannerText: {
    fontSize: 12,
    color: '#92400E',
    textAlign: 'center',
    lineHeight: 18,
  },

  // Header hero section
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 64,
    paddingBottom: 28,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  stepCount: {
    fontSize: 72,
    fontWeight: '700',
    letterSpacing: -2,
    lineHeight: 80,
  },
  stepCountGreen: { color: GREEN },
  stepCountOrange: { color: ORANGE },

  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
    marginBottom: 10,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressFillGreen: { backgroundColor: GREEN },
  progressFillOrange: { backgroundColor: ORANGE },
  progressLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    width: 38,
    textAlign: 'right',
  },
  goalLabel: {
    fontSize: 13,
    color: '#6B7280',
  },

  // Metrics grid (2 columns)
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 12,
  },
  card: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHighlight: {
    borderColor: '#BBF7D0',
    backgroundColor: '#F0FDF4',
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.5,
  },
  cardValueHighlight: {
    color: GREEN,
  },
  cardSubtitle: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
  },

  // Refresh button
  refreshButton: {
    marginHorizontal: 24,
    marginTop: 8,
    backgroundColor: BLUE,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
