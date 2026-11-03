import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';

import { PageHeader } from '@/components/PageHeader';
import { Button, Card, Input, Screen, Text } from '@/components/ui';
import { theme } from '@/constants/theme';
import { useData } from '@/data/store';
import { formatPercent } from '@/lib/money';

export default function GroupSettings() {
  const d = useData();
  const [groupName, setGroupName] = useState(d.settings.groupName);
  const [multiplier, setMultiplier] = useState(String(d.settings.loanMultiplier));
  const [reserve, setReserve] = useState(String(Math.round(d.settings.reserveRatio * 100)));
  const [rate, setRate] = useState(String(Math.round(d.settings.defaultInterestRate * 100)));
  const [saved, setSaved] = useState(false);

  const onSave = () => {
    d.updateSettings({
      groupName: groupName.trim() || d.settings.groupName,
      loanMultiplier: Math.max(0, parseFloat(multiplier) || d.settings.loanMultiplier),
      reserveRatio: Math.min(1, Math.max(0, (parseFloat(reserve) || 0) / 100)),
      defaultInterestRate: Math.max(0, (parseFloat(rate) || 0) / 100),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen footer={<Button title={saved ? 'Saved ✓' : 'Save settings'} icon={saved ? undefined : 'save-outline'} onPress={onSave} />}>
        <PageHeader title="Group settings" subtitle="ADMIN" back />

        <Card style={styles.card}>
          <Input label="Group name" value={groupName} onChangeText={setGroupName} icon="people-outline" />
        </Card>

        <Text variant="label" color="textSecondary" style={styles.label}>
          LOAN RULES
        </Text>
        <Card style={styles.card}>
          <Input
            label="Loan multiplier"
            keyboardType="numeric"
            value={multiplier}
            onChangeText={setMultiplier}
            hint={`A member can borrow up to ${multiplier || '1.5'}× their own savings.`}
          />
          <Input
            label="Fund reserve (%)"
            keyboardType="numeric"
            value={reserve}
            onChangeText={setReserve}
            hint={`The fund always keeps at least ${reserve || '50'}% in reserve after a loan.`}
          />
          <Input
            label="Default interest / month (%)"
            keyboardType="numeric"
            value={rate}
            onChangeText={setRate}
            hint="Pre-filled when you set terms on a new loan (you can still change it per loan)."
          />
        </Card>

        <View style={styles.infoRow}>
          <Ionicons name="information-circle-outline" size={16} color={theme.colors.textMuted} />
          <Text variant="small" color="textMuted" style={styles.flex}>
            Current effective rate preview: {formatPercent((parseFloat(rate) || 0) / 100, 1)} per month, compounded.
          </Text>
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { marginBottom: theme.spacing.md, gap: theme.spacing.md },
  label: { marginBottom: theme.spacing.sm },
  infoRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', marginTop: theme.spacing.xs },
});
