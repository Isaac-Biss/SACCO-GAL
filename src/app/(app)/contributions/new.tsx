import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';

import { PageHeader } from '@/components/PageHeader';
import { Button, Card, Input, Screen, Text } from '@/components/ui';
import { theme } from '@/constants/theme';
import { useAuth } from '@/auth/AuthContext';
import { useData } from '@/data/store';
import { currentPeriod, formatPeriodShort, periodMinus } from '@/lib/date';
import { formatMoney, parseAmount } from '@/lib/money';

export default function NewContribution() {
  const router = useRouter();
  const { user } = useAuth();
  const d = useData();
  const [amountText, setAmountText] = useState('');
  const [period, setPeriod] = useState(currentPeriod());
  const [note, setNote] = useState('');
  const [receiptUri, setReceiptUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  if (!user) return null;

  const periods = [0, 1, 2, 3].map((n) => periodMinus(currentPeriod(), n));
  const amount = parseAmount(amountText);

  const pickImage = async (source: 'library' | 'camera') => {
    try {
      if (source === 'camera') {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) return Alert.alert('Camera access needed', 'Please allow camera access to take a photo.');
        const res = await ImagePicker.launchCameraAsync({ quality: 0.6 });
        if (!res.canceled) setReceiptUri(res.assets[0].uri);
      } else {
        const res = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: 'images',
          quality: 0.6,
        });
        if (!res.canceled) setReceiptUri(res.assets[0].uri);
      }
    } catch {
      Alert.alert('Could not open picker', 'Something went wrong selecting the image.');
    }
  };

  const onSubmit = () => {
    setError(null);
    if (amount <= 0) return setError('Enter the amount you deposited.');
    if (!receiptUri) return setError('Attach a photo of your receipt or transaction.');
    setSubmitting(true);
    d.addContribution({
      memberId: user.id,
      period,
      submittedAmount: amount,
      receiptUri,
      note: note.trim() || undefined,
    });
    setSubmitting(false);
    if (router.canGoBack()) router.back();
    else router.replace('/(app)/contributions');
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen
        footer={<Button title="Submit for verification" icon="paper-plane-outline" loading={submitting} onPress={onSubmit} />}>
        <PageHeader title="Add contribution" subtitle="NEW DEPOSIT" back />

        <Card style={styles.card}>
          <Text variant="label" color="textSecondary">
            WHICH MONTH?
          </Text>
          <View style={styles.chips}>
            {periods.map((p) => {
              const active = p === period;
              return (
                <Pressable
                  key={p}
                  onPress={() => setPeriod(p)}
                  style={[styles.chip, active && styles.chipActive]}>
                  <Text variant="label" color={active ? 'textOnPrimary' : 'textSecondary'}>
                    {formatPeriodShort(p)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.field}>
            <Input
              label="Amount deposited"
              keyboardType="numeric"
              placeholder="0"
              value={amountText}
              onChangeText={setAmountText}
              hint={amount > 0 ? formatMoney(amount) : 'Enter the exact amount you sent to the group account.'}
              prefix={
                <Text variant="bodyStrong" color="textSecondary" style={styles.prefix}>
                  USh
                </Text>
              }
            />
          </View>
        </Card>

        <Card style={styles.card}>
          <Text variant="label" color="textSecondary">
            RECEIPT / PROOF OF PAYMENT
          </Text>
          {receiptUri ? (
            <View style={styles.receiptWrap}>
              <Image source={{ uri: receiptUri }} style={styles.receipt} contentFit="cover" />
              <Pressable style={styles.removeBtn} onPress={() => setReceiptUri(null)} hitSlop={8}>
                <Ionicons name="close-circle" size={26} color="#fff" />
              </Pressable>
            </View>
          ) : (
            <Pressable style={styles.dropzone} onPress={() => pickImage('library')}>
              <Ionicons name="cloud-upload-outline" size={28} color={theme.colors.primary} />
              <Text variant="bodyStrong" color="primary">
                Upload a screenshot
              </Text>
              <Text variant="small" color="textMuted" center>
                A screenshot of the mobile-money message or a photo of the bank receipt.
              </Text>
            </Pressable>
          )}
          <View style={styles.pickRow}>
            <Button title="Gallery" variant="outline" size="sm" icon="images-outline" style={styles.flexBtn} onPress={() => pickImage('library')} />
            <Button title="Camera" variant="outline" size="sm" icon="camera-outline" style={styles.flexBtn} onPress={() => pickImage('camera')} />
          </View>
        </Card>

        <Card style={styles.card}>
          <Input
            label="Note (optional)"
            placeholder="e.g. Sent via MTN mobile money"
            value={note}
            onChangeText={setNote}
            multiline
            style={styles.note}
          />
        </Card>

        {error ? (
          <View style={styles.errorRow}>
            <Ionicons name="alert-circle" size={16} color={theme.colors.danger} />
            <Text variant="small" color="danger">
              {error}
            </Text>
          </View>
        ) : null}

        <View style={styles.infoRow}>
          <Ionicons name="information-circle-outline" size={16} color={theme.colors.textMuted} />
          <Text variant="small" color="textMuted" style={styles.flex}>
            The admin will confirm the money reached the group account, then approve the amount shown
            on everyone’s dashboard.
          </Text>
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { marginBottom: theme.spacing.md, gap: theme.spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surfaceSunken,
  },
  chipActive: { backgroundColor: theme.colors.primary },
  field: { marginTop: theme.spacing.sm },
  prefix: { marginRight: 8 },
  receiptWrap: { position: 'relative', borderRadius: theme.radius.md, overflow: 'hidden' },
  receipt: { width: '100%', height: 220, borderRadius: theme.radius.md },
  removeBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 14,
  },
  dropzone: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primarySurface,
  },
  pickRow: { flexDirection: 'row', gap: theme.spacing.sm },
  flexBtn: { flex: 1 },
  note: { minHeight: 60, textAlignVertical: 'top' },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: theme.spacing.sm },
  infoRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', marginTop: theme.spacing.xs },
});
