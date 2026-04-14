import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeContainer } from '../../components/layout/SafeContainer';
import { Asset } from 'expo-asset';
import { SvgUri } from 'react-native-svg';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

interface SubscriptionScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

const PAYMENT_OPTIONS = [
  { icon: 'card-outline' as const, label: 'Credit / Debit cards' },
  { icon: 'business-outline' as const, label: 'Net Banking' },
  { icon: 'wallet-outline' as const, label: 'Wallets' },
];

const PAYMENT_APPS = [
  { id: 'phonepe', source: require('../../../assets/icons-svg/payment/phonepe.svg') },
  { id: 'paytm', source: require('../../../assets/icons-svg/payment/paytm.svg') },
  { id: 'googlepay', source: require('../../../assets/icons-svg/payment/googlePay.svg') },
  { id: 'amazonpay', source: require('../../../assets/icons-svg/payment/amazonpay.svg') },
];

export const SubscriptionScreen: React.FC<SubscriptionScreenProps> = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const cardWidth = width - 32;

  return (
    <SafeContainer style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment type</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        {PAYMENT_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.label}
            style={[styles.optionRow, { width: cardWidth }]}
            activeOpacity={0.82}
          >
            <View style={styles.optionLeft}>
              <Ionicons name={option.icon} size={28} color="#111111" />
              <Text style={styles.optionLabel}>{option.label}</Text>
            </View>
            <Ionicons name="chevron-down" size={20} color="#111111" />
          </TouchableOpacity>
        ))}

        <View style={[styles.payTypeCard, { width: cardWidth }]}>
          <Text style={styles.payTypeTitle}>Pay by any UPI app</Text>

          <View style={styles.appsRow}>
            {PAYMENT_APPS.map((app) => (
              <TouchableOpacity key={app.id} style={styles.appTile} activeOpacity={0.86}>
                <SvgUri
                  width={52}
                  height={52}
                  uri={Asset.fromModule(app.source).uri}
                />
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.payRow}>
            <TouchableOpacity style={styles.inputBtn} activeOpacity={0.9}>
              <Text style={styles.inputText}>Enter UPI ID</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.payBtn} activeOpacity={0.88}>
              <Text style={styles.payBtnText}>Pay</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: spacing.lg,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    ...typography.headline,
    color: '#111111',
  },
  headerSpacer: {
    width: 28,
  },
  content: {
    paddingTop: 54,
    alignItems: 'center',
    paddingBottom: 26,
    gap: 8,
  },
  optionRow: {
    height: 64,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  optionLabel: {
    ...typography.body,
    color: '#111111',
  },
  payTypeCard: {
    marginTop: 8,
    height: 300,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C5C6CC',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 22,
  },
  payTypeTitle: {
    ...typography.medium,
    color: '#111111',
  },
  appsRow: {
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  appTile: {
    width: 51,
    height: 51,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  payRow: {
    marginTop: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputBtn: {
    width: 205,
    height: 48,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#111111',
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  inputText: {
    ...typography.subheadline,
    color: '#444444',
  },
  payBtn: {
    width: 80,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  payBtnText: {
    ...typography.subheadline,
    color: '#FFFFFF',
  },
});
