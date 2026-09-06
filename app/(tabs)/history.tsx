import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Svg, { Rect, Line, Text as SvgText } from 'react-native-svg';
import { useHealthData } from '../../hooks/useHealthData';
import { useHealthHistory } from '../../hooks/useHealthHistory';
import { useStepGoal } from '../../hooks/useStepGoal';
import { useLocale } from '../../i18n';

const ACCENT = '#FF5C2E';
const BG = '#0A0A0F';
const CARD_BG = '#1A1A22';

function fmtK(n: number, localeTag: string): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 10000) return `${(n / 1000).toFixed(1)}k`;
  return Math.round(n).toLocaleString(localeTag);
}

// ── Generic bar chart ─────────────────────────────────────────────────────────

function BarChart({
  bars, goal, labelFirst, labelMid, labelLast,
}: {
  bars: { value: number; highlight?: boolean; label?: string }[];
  goal?: number;
  labelFirst?: string;
  labelMid?: string;
  labelLast?: string;
}) {
  const chartW = 320;
  const chartH = 120;
  const maxVal = Math.max(...bars.map(b => b.value), goal ?? 0, 1);
  const totalGap = (bars.length - 1) * 2;
  const barW = Math.max(2, (chartW - totalGap) / bars.length);
  const goalY = goal ? (1 - goal / maxVal) * chartH : undefined;

  return (
    <Svg width={chartW} height={chartH + 20} style={{ overflow: 'visible' }}>
      {goalY !== undefined && (
        <>
          <Line x1={0} y1={goalY} x2={chartW} y2={goalY}
            stroke={`${ACCENT}50`} strokeWidth={1} strokeDasharray="4 3" />
          <SvgText x={chartW - 2} y={goalY - 3} fontSize={8} fill={ACCENT} fontWeight="700" textAnchor="end">
            10K
          </SvgText>
        </>
      )}

      {bars.map((b, i) => {
        const h = (b.value / maxVal) * chartH;
        const x = i * (barW + 2);
        const y = chartH - h;
        const fill = b.highlight ? ACCENT : b.value >= (goal ?? Infinity) ? `${ACCENT}60` : 'rgba(255,255,255,0.12)';
        return <Rect key={i} x={x} y={y} width={barW} height={h} fill={fill} rx={2} />;
      })}

      {labelFirst !== undefined && (
        <SvgText x={0} y={chartH + 14} fontSize={9} fill="rgba(255,255,255,0.2)" fontWeight="600">{labelFirst}</SvgText>
      )}
      {labelMid !== undefined && (
        <SvgText x={chartW / 2} y={chartH + 14} fontSize={9} fill="rgba(255,255,255,0.2)" fontWeight="600" textAnchor="middle">{labelMid}</SvgText>
      )}
      {labelLast !== undefined && (
        <SvgText x={chartW} y={chartH + 14} fontSize={9} fill="rgba(255,255,255,0.2)" fontWeight="600" textAnchor="end">{labelLast}</SvgText>
      )}
    </Svg>
  );
}

// ── Calendar heatmap ──────────────────────────────────────────────────────────

function CalendarHeatmap({ history, goal }: { history: { date: string; steps: number }[]; goal: number }) {
  const { t } = useLocale();
  const now = new Date();
  const today = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = (new Date(now.getFullYear(), now.getMonth(), 1).getDay() + 6) % 7;

  const stepsByDay = new Map(history.map(d => [parseInt(d.date.split('-')[2], 10), d.steps]));

  const cells: { day: number; steps: number; future: boolean }[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push({ day: 0, steps: 0, future: false });
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, steps: stepsByDay.get(d) ?? 0, future: d > today });
  }

  const rows: typeof cells[] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

  return (
    <View>
      <View style={hm.header}>
        {t.history.dayNamesShort.map((d, i) => (
          <Text key={i} style={hm.dayName}>{d}</Text>
        ))}
      </View>
      {rows.map((row, ri) => (
        <View key={ri} style={hm.row}>
          {Array.from({ length: 7 }).map((_, ci) => {
            const cell = row[ci];
            if (!cell || cell.day === 0) return <View key={ci} style={hm.cell} />;
            if (cell.future) return (
              <View key={ci} style={[hm.cell, hm.cellFuture]}>
                <Text style={hm.daynumFuture}>{cell.day}</Text>
              </View>
            );
            const ratio = cell.steps / goal;
            const isToday = cell.day === today;
            const bg = ratio >= 1 ? (isToday ? ACCENT : `${ACCENT}80`) : ratio >= 0.7 ? `${ACCENT}30` : 'rgba(255,255,255,0.07)';
            const numColor = ratio >= 1 ? (isToday ? '#000' : 'rgba(0,0,0,0.7)') : 'rgba(255,255,255,0.4)';
            return (
              <View key={ci} style={[hm.cell, { backgroundColor: bg, borderWidth: isToday ? 1.5 : 0, borderColor: isToday ? ACCENT : 'transparent' }]}>
                <Text style={[hm.daynum, { color: numColor }]}>{cell.day}</Text>
              </View>
            );
          })}
        </View>
      ))}
      <View style={hm.legend}>
        {[{ bg: 'rgba(255,255,255,0.07)', label: t.history.legendBelow }, { bg: `${ACCENT}30`, label: t.history.legendMid }, { bg: `${ACCENT}80`, label: t.history.legendGoal }].map(item => (
          <View key={item.label} style={hm.legendItem}>
            <View style={[hm.legendDot, { backgroundColor: item.bg }]} />
            <Text style={hm.legendText}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const hm = StyleSheet.create({
  header: { flexDirection: 'row', marginBottom: 4 },
  dayName: { flex: 1, textAlign: 'center', fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.2)' },
  row: { flexDirection: 'row', gap: 4, marginBottom: 4 },
  cell: { flex: 1, aspectRatio: 1, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  cellFuture: { backgroundColor: 'rgba(255,255,255,0.03)' },
  daynum: { fontSize: 9, fontWeight: '700' },
  daynumFuture: { fontSize: 9, fontWeight: '600', color: 'rgba(255,255,255,0.15)' },
  legend: { flexDirection: 'row', gap: 12, marginTop: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 10, height: 10, borderRadius: 3 },
  legendText: { fontSize: 9, fontWeight: '600', color: 'rgba(255,255,255,0.3)' },
});

// ── Sub-tab selector ──────────────────────────────────────────────────────────

type Tab = 'jours' | 'mois' | 'annees';

function TabSelector({ active, onChange }: { active: Tab; onChange: (tab: Tab) => void }) {
  const { t } = useLocale();
  const tabs: { id: Tab; label: string }[] = [
    { id: 'jours', label: t.history.tabDays },
    { id: 'mois', label: t.history.tabMonths },
    { id: 'annees', label: t.history.tabYears },
  ];
  return (
    <View style={ts.wrap}>
      {tabs.map(tab => (
        <TouchableOpacity key={tab.id} style={[ts.btn, active === tab.id && ts.btnActive]} onPress={() => onChange(tab.id)} activeOpacity={0.75}>
          <Text style={[ts.label, active === tab.id && ts.labelActive]}>{tab.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const ts = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 3,
    marginHorizontal: 16,
    marginTop: 16,
  },
  btn: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  btnActive: { backgroundColor: ACCENT },
  label: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.35)' },
  labelActive: { color: '#000' },
});

// ── Vue Jours ─────────────────────────────────────────────────────────────────

function JoursView({ dailyGoal }: { dailyGoal: number }) {
  const { t, localeTag } = useLocale();
  const { monthHistory, isLoading } = useHealthData();

  const now = new Date();
  const today = now.getDate();
  const historyByDay = monthHistory.map(d => ({
    day: parseInt(d.date.split('-')[2], 10),
    steps: d.steps,
    date: d.date,
  }));
  const totalDays = historyByDay.length;
  const daysAbove = historyByDay.filter(d => d.steps >= dailyGoal).length;
  const totalSteps = historyByDay.reduce((s, d) => s + d.steps, 0);
  const avgSteps = totalDays > 0 ? Math.round(totalSteps / totalDays) : 0;

  if (isLoading) return <Loader />;

  return (
    <>
      <View style={styles.pills}>
        {[
          { label: t.history.daysAboveGoal(fmtK(dailyGoal, localeTag)), val: `${daysAbove}/${today}` },
          { label: t.common.average, val: fmtK(avgSteps, localeTag) },
          { label: t.common.total, val: fmtK(totalSteps, localeTag) },
        ].map(item => (
          <View key={item.label} style={styles.pill}>
            <Text style={styles.pillVal}>{item.val}</Text>
            <Text style={styles.pillLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t.history.stepsPerDay}</Text>
        <View style={{ alignItems: 'center', paddingTop: 4 }}>
          <BarChart
            bars={historyByDay.map(d => ({ value: d.steps, highlight: d.day === today }))}
            goal={dailyGoal}
            labelFirst="1"
            labelMid={String(Math.ceil(totalDays / 2))}
            labelLast={String(totalDays)}
          />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t.history.monthCalendar}</Text>
        <CalendarHeatmap history={monthHistory} goal={dailyGoal} />
      </View>
    </>
  );
}

// ── Vue Mois ──────────────────────────────────────────────────────────────────

function MoisView({ dailyGoal }: { dailyGoal: number }) {
  const { t, localeTag } = useLocale();
  const MONTH_NAMES_SHORT = t.history.monthNamesShort;
  const { monthlyTotals, isLoading } = useHealthHistory();

  const now = new Date();
  const daysInYear = 365;
  const yearlyGoal = dailyGoal * daysInYear;
  const totalSteps = monthlyTotals.reduce((s, m) => s + m.steps, 0);
  const bestMonth = monthlyTotals.reduce((best, m) => m.steps > best.steps ? m : best, monthlyTotals[0] ?? { steps: 0, month: -1, year: 0 });
  const monthsAbove = monthlyTotals.filter(m => {
    const daysInMonth = new Date(m.year, m.month + 1, 0).getDate();
    return m.steps >= dailyGoal * daysInMonth;
  }).length;

  if (isLoading) return <Loader />;

  return (
    <>
      <View style={styles.pills}>
        {[
          { label: t.history.monthsAboveGoal, val: `${monthsAbove}/${monthlyTotals.length}` },
          { label: t.history.best, val: bestMonth.month >= 0 ? MONTH_NAMES_SHORT[bestMonth.month] : '—' },
          { label: t.common.total, val: fmtK(totalSteps, localeTag) },
        ].map(item => (
          <View key={item.label} style={styles.pill}>
            <Text style={styles.pillVal}>{item.val}</Text>
            <Text style={styles.pillLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t.history.stepsPerMonth(now.getFullYear())}</Text>
        <View style={{ alignItems: 'center', paddingTop: 4 }}>
          <BarChart
            bars={monthlyTotals.map(m => {
              const daysInMonth = new Date(m.year, m.month + 1, 0).getDate();
              return { value: m.steps, highlight: m.month === now.getMonth() };
            })}
            labelFirst={MONTH_NAMES_SHORT[monthlyTotals[0]?.month ?? 0]}
            labelMid={MONTH_NAMES_SHORT[monthlyTotals[Math.floor(monthlyTotals.length / 2)]?.month ?? 5]}
            labelLast={MONTH_NAMES_SHORT[monthlyTotals[monthlyTotals.length - 1]?.month ?? now.getMonth()]}
          />
        </View>
        {/* Month labels row */}
        <View style={styles.monthLabels}>
          {monthlyTotals.map(m => (
            <Text key={m.month} style={[styles.monthLabel, m.month === now.getMonth() && { color: ACCENT }]}>
              {MONTH_NAMES_SHORT[m.month]}
            </Text>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t.history.monthDetail}</Text>
        {monthlyTotals.map(m => {
          const daysInMonth = new Date(m.year, m.month + 1, 0).getDate();
          const monthGoal = dailyGoal * daysInMonth;
          const ratio = monthGoal > 0 ? Math.min(1, m.steps / monthGoal) : 0;
          const isCurrentMonth = m.month === now.getMonth();
          return (
            <View key={m.month} style={styles.monthRow}>
              <Text style={[styles.monthRowLabel, isCurrentMonth && { color: ACCENT }]}>
                {MONTH_NAMES_SHORT[m.month]}
              </Text>
              <View style={styles.monthBarTrack}>
                <View style={[styles.monthBarFill, { width: `${Math.round(ratio * 100)}%` as `${number}%`, backgroundColor: ratio >= 1 ? ACCENT : `${ACCENT}70` }]} />
              </View>
              <Text style={[styles.monthRowVal, isCurrentMonth && { color: ACCENT }]}>
                {fmtK(m.steps, localeTag)}
              </Text>
            </View>
          );
        })}
      </View>
    </>
  );
}

// ── Vue Années ────────────────────────────────────────────────────────────────

function AnneesView({ dailyGoal }: { dailyGoal: number }) {
  const { t, localeTag } = useLocale();
  const { yearlyTotals, isLoading } = useHealthHistory();

  const now = new Date();
  const currentYear = now.getFullYear();
  const totalSteps = yearlyTotals.reduce((s, y) => s + y.steps, 0);
  const bestYear = yearlyTotals.reduce((best, y) => y.steps > best.steps ? y : best, yearlyTotals[0] ?? { year: currentYear, steps: 0 });
  const yearGoal = dailyGoal * 365;

  if (isLoading) return <Loader />;

  return (
    <>
      <View style={styles.pills}>
        {[
          { label: t.history.bestYear, val: String(bestYear.year) },
          { label: t.history.goalPerYear, val: fmtK(yearGoal, localeTag) },
          { label: t.common.total, val: fmtK(totalSteps, localeTag) },
        ].map(item => (
          <View key={item.label} style={styles.pill}>
            <Text style={styles.pillVal}>{item.val}</Text>
            <Text style={styles.pillLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t.history.stepsPerYear}</Text>
        <View style={{ alignItems: 'center', paddingTop: 4 }}>
          <BarChart
            bars={yearlyTotals.map(y => ({ value: y.steps, highlight: y.year === currentYear }))}
            labelFirst={String(yearlyTotals[0]?.year ?? '')}
            labelLast={String(currentYear)}
          />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t.history.yearDetail}</Text>
        {yearlyTotals.map(y => {
          const ratio = yearGoal > 0 ? Math.min(1, y.steps / yearGoal) : 0;
          const isCurrent = y.year === currentYear;
          return (
            <View key={y.year} style={styles.monthRow}>
              <Text style={[styles.monthRowLabel, isCurrent && { color: ACCENT }]}>{y.year}</Text>
              <View style={styles.monthBarTrack}>
                <View style={[styles.monthBarFill, { width: `${Math.round(ratio * 100)}%` as `${number}%`, backgroundColor: ratio >= 1 ? ACCENT : `${ACCENT}70` }]} />
              </View>
              <Text style={[styles.monthRowVal, isCurrent && { color: ACCENT }]}>{fmtK(y.steps, localeTag)}</Text>
            </View>
          );
        })}
      </View>
    </>
  );
}

// ── Loader ────────────────────────────────────────────────────────────────────

function Loader() {
  return (
    <View style={{ alignItems: 'center', paddingTop: 48 }}>
      <ActivityIndicator size="large" color={ACCENT} />
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function HistoryScreen() {
  const { t, localeTag } = useLocale();
  const [activeTab, setActiveTab] = useState<Tab>('jours');
  const { dailyGoal } = useStepGoal();

  const now = new Date();
  const monthName = now.toLocaleDateString(localeTag, { month: 'long', year: 'numeric' });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <Text style={styles.headerMonth}>{monthName}</Text>
        <Text style={styles.headerTitle}>{t.tabs.historyTitle}</Text>
      </View>

      <TabSelector active={activeTab} onChange={setActiveTab} />

      {activeTab === 'jours' && <JoursView dailyGoal={dailyGoal} />}
      {activeTab === 'mois' && <MoisView dailyGoal={dailyGoal} />}
      {activeTab === 'annees' && <AnneesView dailyGoal={dailyGoal} />}
    </ScrollView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  content: { paddingBottom: 32 },

  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 4 },
  headerMonth: { fontSize: 13, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 2 },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },

  pills: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingTop: 16 },
  pill: { flex: 1, backgroundColor: CARD_BG, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', alignItems: 'center' },
  pillVal: { fontSize: 20, fontWeight: '800', color: ACCENT, lineHeight: 22 },
  pillLabel: { fontSize: 9, fontWeight: '600', letterSpacing: 0.8, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginTop: 3, textAlign: 'center' },

  card: { marginHorizontal: 16, marginTop: 16, backgroundColor: CARD_BG, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  cardTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 12 },

  monthLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, paddingHorizontal: 2 },
  monthLabel: { fontSize: 8, fontWeight: '600', color: 'rgba(255,255,255,0.2)' },

  monthRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  monthRowLabel: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.4)', width: 32 },
  monthBarTrack: { flex: 1, height: 6, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 3, overflow: 'hidden' },
  monthBarFill: { height: '100%', borderRadius: 3 },
  monthRowVal: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.5)', width: 48, textAlign: 'right' },
});
