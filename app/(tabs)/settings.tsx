import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useStepGoal } from '../../hooks/useStepGoal';

export default function SettingsScreen() {
  const { dailyGoal, saveGoal, isLoading } = useStepGoal();
  const [inputValue, setInputValue] = useState('');
  const [saved, setSaved] = useState(false);

  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const displayGoal = inputValue !== '' ? parseInt(inputValue, 10) || 0 : dailyGoal;
  const monthlyGoal = displayGoal * daysInMonth;

  const handleSave = async () => {
    const parsed = parseInt(inputValue, 10);
    if (isNaN(parsed) || parsed <= 0) {
      Alert.alert('Valeur invalide', 'Entrez un objectif supérieur à 0.');
      return;
    }
    if (parsed > 100_000) {
      Alert.alert('Valeur trop élevée', "L\u2019objectif ne peut pas dépasser 100\u202f000 pas.");
      return;
    }
    await saveGoal(parsed);
    setInputValue('');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Paramètres</Text>
          <Text style={styles.headerSubtitle}>Configurez votre objectif de pas</Text>
        </View>

        {/* Current goal display */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Objectif actuel</Text>
          <View style={styles.currentGoalBox}>
            {isLoading ? (
              <Text style={styles.currentGoalText}>…</Text>
            ) : (
              <>
                <Text style={styles.currentGoalText}>
                  {dailyGoal.toLocaleString('fr-FR')}
                </Text>
                <Text style={styles.currentGoalUnit}>pas / jour</Text>
              </>
            )}
          </View>
        </View>

        {/* Edit goal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Modifier l'objectif quotidien</Text>
          <TextInput
            style={styles.input}
            value={inputValue}
            onChangeText={setInputValue}
            placeholder={String(dailyGoal)}
            placeholderTextColor="#9CA3AF"
            keyboardType="number-pad"
            maxLength={6}
            returnKeyType="done"
            onSubmitEditing={handleSave}
          />
          <Text style={styles.hint}>
            Objectif mensuel calculé :{' '}
            <Text style={styles.hintBold}>
              {monthlyGoal.toLocaleString('fr-FR')} pas
            </Text>
            {' '}({daysInMonth} jours)
          </Text>
        </View>

        {/* Save button */}
        <TouchableOpacity
          style={[styles.saveButton, saved && styles.saveButtonSuccess]}
          onPress={handleSave}
          disabled={inputValue === ''}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>
            {saved ? '✓ Enregistré' : 'Enregistrer'}
          </Text>
        </TouchableOpacity>

        {/* Info box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Comment ça marche ?</Text>
          <Text style={styles.infoText}>
            L'objectif mensuel est calculé automatiquement : objectif quotidien × nombre de jours dans le mois.{'\n\n'}
            Les métriques du tableau de bord se mettent à jour en temps réel dès que vous modifiez votre objectif.
          </Text>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const BLUE = '#2563EB';
const GREEN = '#16A34A';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    paddingBottom: 48,
  },

  // Header
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 64,
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },

  // Sections
  section: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 10,
  },

  // Current goal
  currentGoalBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  currentGoalText: {
    fontSize: 40,
    fontWeight: '700',
    color: BLUE,
    letterSpacing: -1,
  },
  currentGoalUnit: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },

  // Input
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  hint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
    marginLeft: 4,
  },
  hintBold: {
    color: '#374151',
    fontWeight: '600',
  },

  // Save button
  saveButton: {
    marginHorizontal: 16,
    marginTop: 24,
    backgroundColor: BLUE,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonSuccess: {
    backgroundColor: GREEN,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Info box
  infoBox: {
    marginHorizontal: 16,
    marginTop: 28,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#3B82F6',
    lineHeight: 20,
  },
});
