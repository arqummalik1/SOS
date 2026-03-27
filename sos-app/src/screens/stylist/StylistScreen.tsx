import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeContainer } from '../../components/layout/SafeContainer';
import { GradientBackground } from '../../components/layout/GradientBackground';
import { GlassView } from '../../components/ui/GlassView';
import { GlassButton } from '../../components/ui/GlassButton';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { StaggeredItem } from '../../components/animations/StaggeredItem';

interface StylistScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

const stylists = [
  {
    id: '1',
    name: 'Priya Sharma',
    specialty: 'Ethnic & Fusion Wear',
    rating: 4.9,
    reviews: 128,
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    price: '₹2,500/session',
    availability: 'Available Today',
  },
  {
    id: '2',
    name: 'Rahul Verma',
    specialty: 'Contemporary & Western',
    rating: 4.8,
    reviews: 96,
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    price: '₹3,000/session',
    availability: 'Available Tomorrow',
  },
  {
    id: '3',
    name: 'Ananya Gupta',
    specialty: 'Bridal & Occasion Wear',
    rating: 5.0,
    reviews: 215,
    imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    price: '₹5,000/session',
    availability: 'Available Today',
  },
];

const timeSlots = ['10:00 AM', '12:00 PM', '2:00 PM', '4:00 PM', '6:00 PM'];

export const StylistScreen: React.FC<StylistScreenProps> = ({ navigation }) => {
  const [selectedStylist, setSelectedStylist] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [step, setStep] = useState(1);

  const renderStylistCard = (stylist: typeof stylists[0], index: number) => (
    <StaggeredItem key={stylist.id} index={index}>
      <TouchableOpacity
        style={[
          styles.stylistCard,
          selectedStylist === stylist.id && styles.stylistCardSelected,
        ]}
        onPress={() => setSelectedStylist(stylist.id)}
      >
        <Image source={{ uri: stylist.imageUrl }} style={styles.stylistImage} />
        <View style={styles.stylistInfo}>
          <View style={styles.stylistHeader}>
            <Text style={styles.stylistName}>{stylist.name}</Text>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={12} color="#FFD60A" />
              <Text style={styles.ratingText}>{stylist.rating}</Text>
            </View>
          </View>
          <Text style={styles.stylistSpecialty}>{stylist.specialty}</Text>
          <View style={styles.stylistMeta}>
            <Text style={styles.stylistPrice}>{stylist.price}</Text>
            <Text style={styles.availabilityText}>{stylist.availability}</Text>
          </View>
        </View>
        {selectedStylist === stylist.id && (
          <View style={styles.selectedIndicator}>
            <Ionicons name="checkmark-circle" size={24} color="#32D74B" />
          </View>
        )}
      </TouchableOpacity>
    </StaggeredItem>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Choose Your Stylist</Text>
      <Text style={styles.stepSubtitle}>Select a professional stylist for personalized fashion advice</Text>
      <ScrollView style={styles.stylistList} showsVerticalScrollIndicator={false}>
        {stylists.map((stylist, index) => renderStylistCard(stylist, index))}
      </ScrollView>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Select Date & Time</Text>
      <Text style={styles.stepSubtitle}>When would you like to schedule your session?</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Date</Text>
        <View style={styles.dateContainer}>
          {['Today', 'Tomorrow', 'Wed, Mar 28', 'Thu, Mar 29'].map((date) => (
            <TouchableOpacity
              key={date}
              style={[
                styles.dateChip,
                selectedDate === date && styles.dateChipSelected,
              ]}
              onPress={() => setSelectedDate(date)}
            >
              <Text
                style={[
                  styles.dateChipText,
                  selectedDate === date && styles.dateChipTextSelected,
                ]}
              >
                {date}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Time</Text>
        <View style={styles.timeGrid}>
          {timeSlots.map((time) => (
            <TouchableOpacity
              key={time}
              style={[
                styles.timeChip,
                selectedTime === time && styles.timeChipSelected,
              ]}
              onPress={() => setSelectedTime(time)}
            >
              <Text
                style={[
                  styles.timeChipText,
                  selectedTime === time && styles.timeChipTextSelected,
                ]}
              >
                {time}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notes for Stylist (Optional)</Text>
        <View style={styles.notesInput}>
          <TextInput
            style={styles.notesText}
            multiline
            numberOfLines={4}
            placeholder="Tell us about your style preferences or any specific requirements..."
            placeholderTextColor="#666666"
            value={notes}
            onChangeText={setNotes}
          />
        </View>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <View style={styles.confirmationCard}>
        <View style={styles.confirmIcon}>
          <Ionicons name="checkmark-circle" size={64} color="#32D74B" />
        </View>
        <Text style={styles.confirmTitle}>Booking Confirmed!</Text>
        <Text style={styles.confirmSubtitle}>
          Your styling session has been scheduled successfully
        </Text>
        
        <View style={styles.bookingDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="person-outline" size={20} color="#666666" />
            <Text style={styles.detailLabel}>Stylist</Text>
            <Text style={styles.detailValue}>
              {stylists.find(s => s.id === selectedStylist)?.name}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={20} color="#666666" />
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>{selectedDate}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={20} color="#666666" />
            <Text style={styles.detailLabel}>Time</Text>
            <Text style={styles.detailValue}>{selectedTime}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const canProceed = () => {
    if (step === 1) return selectedStylist !== null;
    if (step === 2) return selectedDate !== null && selectedTime !== null;
    return true;
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      navigation.goBack();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigation.goBack();
    }
  };

  return (
    <GradientBackground>
      <SafeContainer style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack}>
            <GlassView intensity="thin" borderRadius={12} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </GlassView>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {step === 3 ? 'Confirmation' : 'Book Stylist'}
          </Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </ScrollView>

        {step !== 3 && (
          <View style={styles.bottomBar}>
            <GlassButton
              title={step === 2 ? 'Confirm Booking' : 'Continue'}
              onPress={handleNext}
              variant="solid"
              disabled={!canProceed()}
            />
          </View>
        )}

        {step === 3 && (
          <View style={styles.bottomBar}>
            <GlassButton
              title="Done"
              onPress={handleNext}
              variant="solid"
            />
          </View>
        )}
      </SafeContainer>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.title2.fontSize,
    fontWeight: typography.title2.fontWeight,
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  stepContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  stepTitle: {
    fontSize: typography.title2.fontSize,
    fontWeight: typography.title2.fontWeight,
    color: '#FFFFFF',
    marginBottom: spacing.sm,
  },
  stepSubtitle: {
    fontSize: typography.subheadline.fontSize,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: spacing.xl,
  },
  stylistList: {
    flex: 1,
  },
  stylistCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  stylistCardSelected: {
    borderColor: '#BF5AF2',
    backgroundColor: 'rgba(191,90,242,0.15)',
  },
  stylistImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: spacing.md,
  },
  stylistInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  stylistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  stylistName: {
    fontSize: typography.headline.fontSize,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,214,10,0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 100,
    gap: 4,
  },
  ratingText: {
    fontSize: typography.caption1.fontSize,
    fontWeight: '600',
    color: '#FFD60A',
  },
  stylistSpecialty: {
    fontSize: typography.subheadline.fontSize,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: spacing.sm,
  },
  stylistMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stylistPrice: {
    fontSize: typography.subheadline.fontSize,
    fontWeight: '600',
    color: '#BF5AF2',
  },
  availabilityText: {
    fontSize: typography.caption1.fontSize,
    color: '#32D74B',
  },
  selectedIndicator: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.headline.fontSize,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: spacing.md,
  },
  dateContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  dateChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  dateChipSelected: {
    backgroundColor: 'rgba(191,90,242,0.3)',
    borderColor: '#BF5AF2',
  },
  dateChipText: {
    fontSize: typography.subheadline.fontSize,
    color: 'rgba(255,255,255,0.8)',
  },
  dateChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  timeChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  timeChipSelected: {
    backgroundColor: 'rgba(191,90,242,0.3)',
    borderColor: '#BF5AF2',
  },
  timeChipText: {
    fontSize: typography.subheadline.fontSize,
    color: 'rgba(255,255,255,0.8)',
  },
  timeChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  notesInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: spacing.md,
    minHeight: 100,
  },
  notesText: {
    fontSize: typography.body.fontSize,
    color: '#FFFFFF',
    textAlignVertical: 'top',
  },
  confirmationCard: {
    alignItems: 'center',
    padding: spacing.xxl,
  },
  confirmIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(50,215,75,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  confirmTitle: {
    fontSize: typography.title1.fontSize,
    fontWeight: typography.title1.fontWeight,
    color: '#FFFFFF',
    marginBottom: spacing.sm,
  },
  confirmSubtitle: {
    fontSize: typography.subheadline.fontSize,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  bookingDetails: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: spacing.lg,
    gap: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  detailLabel: {
    fontSize: typography.subheadline.fontSize,
    color: '#666666',
    width: 60,
  },
  detailValue: {
    fontSize: typography.subheadline.fontSize,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  bottomBar: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
});
