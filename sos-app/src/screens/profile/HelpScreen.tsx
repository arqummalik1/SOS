import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeContainer } from '../../components/layout/SafeContainer';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

interface HelpScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

const faqs = [
  {
    question: 'How do I save outfits?',
    answer: 'Tap the heart icon on any outfit card to save it to your collection. You can view all saved outfits in your profile.',
  },
  {
    question: 'Can I change my style preferences?',
    answer: 'Yes! Go to Profile > Edit Profile > Style Preferences to update your preferences at any time.',
  },
  {
    question: 'How does the recommendation work?',
    answer: 'We use your style preferences, color choices, and browsing history to curate personalized outfit recommendations just for you.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Absolutely. We use industry-standard encryption and never share your personal information with third parties.',
  },
];

export const HelpScreen: React.FC<HelpScreenProps> = ({ navigation }) => {
  return (
    <SafeContainer style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          {faqs.map((faq, index) => (
            <View key={index} style={styles.faqItem}>
              <Text style={styles.question}>{faq.question}</Text>
              <Text style={styles.answer}>{faq.answer}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <TouchableOpacity style={styles.contactRow}>
            <View style={styles.contactIcon}>
              <Ionicons name="mail-outline" size={24} color="#BF5AF2" />
            </View>
            <View style={styles.contactText}>
              <Text style={styles.contactLabel}>Email Support</Text>
              <Text style={styles.contactValue}>support@sos-style.com</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactRow}>
            <View style={styles.contactIcon}>
              <Ionicons name="chatbubble-outline" size={24} color="#BF5AF2" />
            </View>
            <View style={styles.contactText}>
              <Text style={styles.contactLabel}>Live Chat</Text>
              <Text style={styles.contactValue}>Available 9AM - 6PM</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666666" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resources</Text>
          <TouchableOpacity style={styles.resourceRow}>
            <Text style={styles.resourceText}>Terms of Service</Text>
            <Ionicons name="open-outline" size={18} color="#666666" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.resourceRow}>
            <Text style={styles.resourceText}>Privacy Policy</Text>
            <Ionicons name="open-outline" size={18} color="#666666" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.resourceRow}>
            <Text style={styles.resourceText}>Style Guide</Text>
            <Ionicons name="open-outline" size={18} color="#666666" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    fontSize: typography.headline.fontSize,
    fontWeight: typography.headline.fontWeight,
    color: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    fontSize: typography.subheadline.fontSize,
    fontWeight: '600',
    color: '#666666',
    marginBottom: spacing.lg,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  faqItem: {
    backgroundColor: 'rgba(120,120,128,0.12)',
    borderRadius: 14,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  question: {
    fontSize: typography.subheadline.fontSize,
    fontWeight: '600',
    color: '#000000',
    marginBottom: spacing.sm,
  },
  answer: {
    fontSize: typography.footnote.fontSize,
    color: '#666666',
    lineHeight: 20,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(120,120,128,0.12)',
    borderRadius: 14,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  contactIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(191,90,242,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  contactText: {
    flex: 1,
  },
  contactLabel: {
    fontSize: typography.body.fontSize,
    fontWeight: '500',
    color: '#000000',
    marginBottom: spacing.xs,
  },
  contactValue: {
    fontSize: typography.caption1.fontSize,
    color: '#666666',
  },
  resourceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(120,120,128,0.12)',
    borderRadius: 14,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    marginBottom: spacing.md,
  },
  resourceText: {
    fontSize: typography.body.fontSize,
    color: '#000000',
  },
});
