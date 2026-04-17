import React from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { typography } from '../../../theme/typography';

type PlanKind = 'free' | 'premium';

export const SubscriptionHeader: React.FC<{
  title: string;
  subtitle: string;
  onBack: () => void;
}> = ({ title, subtitle, onBack }) => (
  <View style={styles.headerWrap}>
    <TouchableOpacity style={styles.backRow} onPress={onBack} activeOpacity={0.75}>
      <Ionicons name="chevron-back" size={16} color="#1A1A1A" />
      <Text style={styles.backText}>Back</Text>
    </TouchableOpacity>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.subtitle}>{subtitle}</Text>
  </View>
);

export const PlanSegment: React.FC<{
  selected: PlanKind;
  onChange: (plan: PlanKind) => void;
}> = ({ selected, onChange }) => (
  <View style={styles.segmentTrack}>
    <TouchableOpacity
      style={[styles.segmentBtn, selected === 'free' && styles.segmentBtnActive]}
      onPress={() => onChange('free')}
      activeOpacity={0.9}
    >
      <Text style={[styles.segmentText, selected === 'free' && styles.segmentTextActive]}>Free</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[styles.segmentBtn, selected === 'premium' && styles.segmentBtnActive]}
      onPress={() => onChange('premium')}
      activeOpacity={0.9}
    >
      <Text style={[styles.segmentText, selected === 'premium' && styles.segmentTextActive]}>Premium</Text>
    </TouchableOpacity>
  </View>
);

export const FeatureRow: React.FC<{
  label: string;
  included: boolean;
}> = ({ label, included }) => (
  <View style={styles.featureRow}>
    <View style={[styles.featureBadge, included ? styles.featureBadgePositive : styles.featureBadgeNegative]}>
      <Ionicons
        name={included ? 'checkmark' : 'close'}
        size={13}
        color={included ? '#4EA764' : '#B5565B'}
      />
    </View>
    <Text style={styles.featureLabel}>{label}</Text>
  </View>
);

export const PrimaryActionButton: React.FC<{
  label: string;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}> = ({ label, onPress, disabled, style }) => (
  <TouchableOpacity
    style={[styles.primaryBtn, style, disabled && styles.primaryBtnDisabled]}
    onPress={onPress}
    disabled={disabled}
    activeOpacity={0.88}
  >
    <Text style={styles.primaryBtnText}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  headerWrap: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 14,
    alignItems: 'center',
  },
  backRow: {
    position: 'absolute',
    left: 0,
    top: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backText: {
    ...typography.footnote,
    color: '#222222',
  },
  title: {
    ...typography.title2,
    color: '#121212',
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 2,
    ...typography.callout,
    color: '#444444',
  },
  segmentTrack: {
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: '#E2E2E2',
    borderRadius: 999,
    paddingHorizontal: 5,
    paddingVertical: 5,
    gap: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 1,
  },
  segmentBtn: {
    minWidth: 120,
    height: 38,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECECEC',
  },
  segmentBtnActive: {
    backgroundColor: '#7D7D7D',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentText: {
    ...typography.callout,
    color: '#2B2B2B',
    fontWeight: '500',
  },
  segmentTextActive: {
    color: '#FFFFFF',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  featureBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureBadgePositive: {
    backgroundColor: '#EFF8F1',
  },
  featureBadgeNegative: {
    backgroundColor: '#F9EFF0',
  },
  featureLabel: {
    ...typography.body,
    color: '#202020',
    flex: 1,
  },
  primaryBtn: {
    width: '100%',
    alignSelf: 'stretch',
    height: 50,
    borderRadius: 12,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnDisabled: {
    backgroundColor: '#9FA2AA',
  },
  primaryBtnText: {
    ...typography.callout,
    color: '#FFFFFF',
    fontWeight: '500',
  },
});
