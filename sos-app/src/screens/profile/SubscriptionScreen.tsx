import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { Asset } from 'expo-asset';
import { SvgUri } from 'react-native-svg';
import { SafeContainer } from '../../components/layout/SafeContainer';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { FeatureRow, PlanSegment, PrimaryActionButton, SubscriptionHeader } from './components/SubscriptionFlowComponents';

interface SubscriptionScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

type PlanKind = 'free' | 'premium';
type BillingCycle = 'annual' | 'monthly';

const FREE_FEATURE_ROWS: Array<{ label: string; freeIncluded: boolean }> = [
  { label: 'Add up to 10 wardrobe items', freeIncluded: true },
  { label: 'Manual weekly planning', freeIncluded: true },
  { label: 'Limited outfit suggestions', freeIncluded: true },
  { label: 'Advanced AI recommendations', freeIncluded: false },
  { label: 'Weekly outfit planner', freeIncluded: false },
  { label: 'Auto-plan your week in seconds', freeIncluded: false },
  { label: 'Unlimited wardrobe items', freeIncluded: false },
  { label: 'Ad-free experience', freeIncluded: false },
];

const PREMIUM_FEATURE_ROWS = [
  'Everything in free plan included',
  'Manual weekly planning',
  'Limited outfit suggestions',
  'Advanced AI recommendations',
  'Weekly outfit planner',
  'Auto-plan your week in seconds',
  'Unlimited wardrobe items',
  'Ad-free experience',
];

export const SubscriptionScreen: React.FC<SubscriptionScreenProps> = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const tabBarHeight = useBottomTabBarHeight();
  const contentWidth = Math.min(382, width - 28);
  const heroHeight = Math.round(contentWidth * (185 / 437));
  const [selectedPlan, setSelectedPlan] = useState<PlanKind>('free');
  const [selectedCycle, setSelectedCycle] = useState<BillingCycle>('annual');

  const renderPricingCard = (cycle: BillingCycle) => {
    const isSelected = selectedCycle === cycle;
    const title = cycle === 'annual' ? 'Annual' : 'Monthly';
    const strike = cycle === 'annual' ? '₹999' : '₹99';
    const value = cycle === 'annual' ? '₹599' : '₹59';

    const cardBody = (
      <>
        <Text style={styles.priceTitle}>{title}</Text>
        <Text style={styles.priceStrike}>{strike}</Text>
        <Text style={[styles.priceValue, isSelected ? styles.priceValueSelected : styles.priceValueUnselected]}>{value}</Text>
        <Text style={styles.priceMeta}>per year after 7 days trial</Text>
      </>
    );

    return (
      <TouchableOpacity
        key={cycle}
        style={[styles.priceCard, isSelected && styles.priceCardSelected]}
        activeOpacity={0.9}
        onPress={() => setSelectedCycle(cycle)}
      >
        {isSelected ? (
          <LinearGradient
            colors={['#E8DDEA', '#D2B9DC']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.priceCardGradient}
          >
            {cardBody}
          </LinearGradient>
        ) : (
          <View style={styles.priceCardPlain}>{cardBody}</View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeContainer style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarHeight + 110 }]}
      >
        <View style={{ width: contentWidth }}>
          <SubscriptionHeader
            title="Subscription"
            subtitle="Manage your subscription"
            onBack={() => navigation.goBack()}
          />

          <View style={[styles.heroCard, { height: heroHeight }]}>
            <SvgUri
              width={contentWidth}
              height={heroHeight}
              uri={Asset.fromModule(require('../../../assets/Susbcription/UnlockPremiumFeatures.svg')).uri}
            />
          </View>

          <Text style={styles.planTitle}>You’re on the {selectedPlan === 'free' ? 'Free' : 'Premium'} Plan</Text>
          <Text style={styles.planSubtitle}>Unlock premium styling features for a smarter wardrobe experience.</Text>

          <PlanSegment selected={selectedPlan} onChange={setSelectedPlan} />

          <View style={styles.featuresWrap}>
            {selectedPlan === 'free'
              ? FREE_FEATURE_ROWS.map((feature) => (
                  <FeatureRow key={feature.label} label={feature.label} included={feature.freeIncluded} />
                ))
              : PREMIUM_FEATURE_ROWS.map((label) => <FeatureRow key={label} label={label} included />)}
          </View>

          {selectedPlan === 'free' ? (
            <PrimaryActionButton
              label="Try Premium for 7 Days for free"
              onPress={() =>
                navigation.navigate('SubscriptionSecureCheckout', {
                  plan: 'free',
                })
              }
            />
          ) : (
            <>
              <View style={styles.pricingRow}>
                {renderPricingCard('annual')}
                {renderPricingCard('monthly')}
              </View>

              <PrimaryActionButton
                label={selectedCycle === 'annual' ? 'Upgrade To Annual' : 'Upgrade To Monthly'}
                style={styles.upgradeCta}
                onPress={() =>
                  navigation.navigate('SubscriptionSecureCheckout', {
                    plan: 'premium',
                    cycle: selectedCycle,
                  })
                }
              />
            </>
          )}
        </View>
      </ScrollView>
    </SafeContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F2',
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 26,
    paddingTop: 4,
  },
  heroCard: {
    marginTop: 6,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  planTitle: {
    marginTop: 16,
    ...typography.title2,
    color: '#141414',
    textAlign: 'center',
    fontWeight: '700',
  },
  planSubtitle: {
    marginTop: 4,
    marginBottom: 16,
    ...typography.body,
    color: '#2F2F2F',
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  featuresWrap: {
    marginTop: 20,
    marginBottom: 8,
  },
  pricingRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
    marginBottom: 18,
  },
  priceCard: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  priceCardGradient: {
    paddingHorizontal: 12,
    paddingVertical: 14,
    minHeight: 152,
  },
  priceCardPlain: {
    paddingHorizontal: 12,
    paddingVertical: 14,
    minHeight: 152,
    backgroundColor: '#FFFFFF',
  },
  priceCardSelected: {
    transform: [{ scale: 1.02 }],
  },
  priceTitle: {
    ...typography.headline,
    color: '#1C1C1E',
    textAlign: 'center',
  },
  priceStrike: {
    marginTop: 5,
    ...typography.footnote,
    color: '#7A7A80',
    textDecorationLine: 'line-through',
    textAlign: 'center',
  },
  priceValue: {
    marginTop: 4,
    ...typography.title1,
    color: '#18181A',
    textAlign: 'center',
    fontWeight: '700',
    letterSpacing: 0,
  },
  priceValueSelected: {
    color: '#FFFFFF',
  },
  priceValueUnselected: {
    color: '#D2A7D9',
  },
  priceMeta: {
    marginTop: 4,
    ...typography.callout,
    color: '#2B2B2F',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 25,
  },
  upgradeCta: {
    width: '50%',
    alignSelf: 'center',
  },
});
