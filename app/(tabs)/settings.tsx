import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useStepGoal } from '../../hooks/useStepGoal';

const ACCENT = '#FF5C2E';
const BG = '#0A0A0F';
const CARD_BG = '#1A1A22';

const PRESETS = [5000, 7500, 10000, 12500, 15000];

export default function SettingsScreen() {
  const { dailyGoal, saveGoal, isLoading } = useStepGoal();
  const [inputValue, setInputValue] = useState('');
  const [saved, setSaved] = useState(false);

  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const displayGoal = inputValue !== '' ? parseInt(inputValue, 10) || 0 : dailyGoal;
  const monthlyProjection = displayGoal * daysInMonth;

  const handleSave = async () => {
    const parsed = parseInt(inputValue, 10);
    if (isNaN(parsed) || parsed <= 0) {
      Alert.alert('Valeur invalide', 'Entrez un objectif supérieur à 0.');
      return;
    }
    if (parsed > 100_000) {
      Alert.alert('Valeur trop élevée', "L'objectif ne peut pas dépasser 100\u202f000 pas.");
      return;
    }
    await saveGoal(parsed);
    setInputValue('');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handlePreset = async (p: number) => {
    await saveGoal(p);
    setSaved(false);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerSub}>Configuration</Text>
          <Text style={styles.headerTitle}>Paramètres</Text>
        </View>

        {/* Current goal */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>OBJECTIF ACTUEL</Text>
          <View style={styles.currentGoalBox}>
            {isLoading ? (
              <Text style={styles.currentGoalNum}>…</Text>
            ) : (
              <>
                <Text style={styles.currentGoalNum}>{dailyGoal.toLocaleString('fr-FR')}</Text>
                <Text style={styles.currentGoalUnit}>pas / jour</Text>
              </>
            )}
          </View>
        </View>

        {/* Presets */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>OBJECTIFS RAPIDES</Text>
          <View style={styles.presets}>
            {PRESETS.map(p => {
              const active = dailyGoal === p;
              return (
                <TouchableOpacity
                  key={p}
                  style={[styles.presetBtn, active && styles.presetBtnActive]}
                  onPress={() => handlePreset(p)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.presetText, active && styles.presetTextActive]}>
                    {p >= 1000 ? `${p / 1000}K` : p}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Custom input */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>OBJECTIF PERSONNALISÉ</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              value={inputValue}
              onChangeText={setInputValue}
              placeholder={String(dailyGoal)}
              placeholderTextColor="rgba(255,255,255,0.2)"
              keyboardType="number-pad"
              maxLength={6}
              returnKeyType="done"
              onSubmitEditing={handleSave}
            />
            <Text style={styles.inputUnit}>pas/j</Text>
          </View>
          <Text style={styles.hint}>
            Projection mensuelle :{' '}
            <Text style={styles.hintBold}>{monthlyProjection.toLocaleString('fr-FR')} pas</Text>
            {' '}({daysInMonth} jours)
          </Text>
        </View>

        {/* Save button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[
              styles.saveBtn,
              saved && styles.saveBtnSuccess,
              inputValue === '' && styles.saveBtnDisabled,
            ]}
            onPress={handleSave}
            disabled={inputValue === ''}
            activeOpacity={0.8}
          >
            <Text style={[styles.saveBtnText, inputValue === '' && !saved && styles.saveBtnTextDisabled]}>
              {saved ? '✓ ENREGISTRÉ' : 'ENREGISTRER'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>COMMENT ÇA MARCHE</Text>
          <Text style={styles.infoText}>
            L'objectif mensuel est calculé automatiquement :{' '}
            <Text style={styles.infoTextBold}>objectif quotidien × jours du mois</Text>.{' '}
            La moyenne requise est mise à jour chaque jour pour vous garder sur la bonne trajectoire.
          </Text>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  content: { paddingBottom: 48 },

  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 4 },
  headerSub: {
    fontSize: 13, fontWeight: '700', letterSpacing: 2,
    textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 2,
  },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },

  section: { marginHorizontal: 16, marginTop: 20 },
  sectionLabel: {
    fontSize: 10, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.3)', marginBottom: 10,
  },

  currentGoalBox: {
    backgroundColor: `${ACCENT}10`,
    borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: `${ACCENT}30`,
    flexDirection: 'row', alignItems: 'baseline', gap: 8,
  },
  currentGoalNum: { fontSize: 48, fontWeight: '900', color: ACCENT, letterSpacing: -1, lineHeight: 52 },
  currentGoalUnit: { fontSize: 16, color: 'rgba(255,255,255,0.4)', fontWeight: '600' },

  presets: { flexDirection: 'row', gap: 6 },
  presetBtn: {
    flex: 1, height: 42, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  presetBtnActive: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
  },
  presetText: { fontSize: 13, fontWeight: '800', color: 'rgba(255,255,255,0.6)' },
  presetTextActive: { color: '#000' },

  inputBox: {
    backgroundColor: CARD_BG,
    borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  input: {
    flex: 1, paddingVertical: 14,
    fontSize: 24, fontWeight: '700', color: '#fff',
    backgroundColor: 'transparent',
  },
  inputUnit: { fontSize: 12, color: 'rgba(255,255,255,0.3)' },
  hint: { fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 8, marginLeft: 4 },
  hintBold: { color: 'rgba(255,255,255,0.5)', fontWeight: '600' },

  saveBtn: {
    height: 52, borderRadius: 14, backgroundColor: ACCENT,
    alignItems: 'center', justifyContent: 'center',
  },
  saveBtnSuccess: { backgroundColor: '#00C96A' },
  saveBtnDisabled: { backgroundColor: 'rgba(255,255,255,0.06)' },
  saveBtnText: { fontSize: 16, fontWeight: '800', letterSpacing: 1.5, color: '#000' },
  saveBtnTextDisabled: { color: 'rgba(255,255,255,0.2)' },

  infoCard: {
    marginHorizontal: 16, marginTop: 28,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
  },
  infoTitle: {
    fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.25)', marginBottom: 8,
  },
  infoText: { fontSize: 12, color: 'rgba(255,255,255,0.35)', lineHeight: 20 },
  infoTextBold: { color: 'rgba(255,255,255,0.5)', fontWeight: '600' },
});
