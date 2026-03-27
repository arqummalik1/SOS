import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Dimensions,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeContainer } from '../../components/layout/SafeContainer';

const { width } = Dimensions.get('window');

interface ProfileSetupScreenProps {
  navigation: NativeStackNavigationProp<any>;
  route: any;
}

const heightOptions = ['150 cm', '155 cm', '160 cm', '165 cm', '170 cm', '175 cm', '180 cm'];
const weightOptions = ['50 kg', '55 kg', '60 kg', '65 kg', '70 kg', '75 kg', '80 kg'];
const dayOptions = Array.from({ length: 31 }, (_, i) => String(i + 1));
const monthOptions = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const yearOptions = Array.from({ length: 30 }, (_, i) => String(1990 + i));

export const ProfileSetupScreen: React.FC<ProfileSetupScreenProps> = ({ navigation, route }) => {
  const [name, setName] = useState('');
  const [height, setHeight] = useState('160 cm');
  const [weight, setWeight] = useState('60 kg');
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [showPicker, setShowPicker] = useState<string | null>(null);

  const profileImage = route.params?.profileImage;

  const canProceed = name.trim().length > 0 && day && month && year;

  const handleNext = () => {
    if (canProceed) {
      navigation.navigate('FullBodyPhoto');
    }
  };

  const renderProgressBars = () => (
    <View style={styles.progressContainer}>
      {[1, 2, 3, 4].map((_, index) => (
        <View
          key={index}
          style={[
            styles.progressBar,
            index === 0 ? styles.progressBarActive : styles.progressBarInactive,
          ]}
        />
      ))}
    </View>
  );

  const renderPicker = () => {
    if (!showPicker) return null;
    
    let options: string[] = [];
    let onSelect: (value: string) => void = () => {};
    
    switch (showPicker) {
      case 'height':
        options = heightOptions;
        onSelect = setHeight;
        break;
      case 'weight':
        options = weightOptions;
        onSelect = setWeight;
        break;
      case 'day':
        options = dayOptions;
        onSelect = setDay;
        break;
      case 'month':
        options = monthOptions;
        onSelect = setMonth;
        break;
      case 'year':
        options = yearOptions;
        onSelect = setYear;
        break;
    }

    return (
      <View style={styles.pickerOverlay}>
        <View style={styles.pickerContainer}>
          <View style={styles.pickerHeader}>
            <TouchableOpacity onPress={() => setShowPicker(null)}>
              <Text style={styles.pickerDone}>Done</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.pickerScroll}>
            {options.map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.pickerItem}
                onPress={() => {
                  onSelect(option);
                  setShowPicker(null);
                }}
              >
                <Text style={styles.pickerItemText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  };

  return (
    <SafeContainer style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {renderProgressBars()}

        <Text style={styles.title}>Profile setup</Text>
        <Text style={styles.subtitle}>
          This information helps us deliver a better, more personalized experience for you.
        </Text>

        {/* Profile Photo */}
        <View style={styles.photoContainer}>
          <View style={styles.photoWrapper}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profilePhoto} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Ionicons name="person" size={40} color="#999999" />
              </View>
            )}
            <TouchableOpacity style={styles.editButton}>
              <View style={styles.editButtonInner}>
                <Ionicons name="pencil" size={16} color="#666666" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Name Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Your name:</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Jane"
              placeholderTextColor="#999999"
            />
          </View>
        </View>

        {/* Height and Weight Row */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Height</Text>
            <TouchableOpacity 
              style={styles.dropdown}
              onPress={() => setShowPicker('height')}
            >
              <Text style={styles.dropdownText}>{height}</Text>
              <Ionicons name="chevron-down" size={20} color="#666666" />
            </TouchableOpacity>
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Weight</Text>
            <TouchableOpacity 
              style={styles.dropdown}
              onPress={() => setShowPicker('weight')}
            >
              <Text style={styles.dropdownText}>{weight}</Text>
              <Ionicons name="chevron-down" size={20} color="#666666" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Date of Birth */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date of Birth</Text>
          <View style={styles.dobContainer}>
            <TouchableOpacity 
              style={styles.dobField}
              onPress={() => setShowPicker('day')}
            >
              <Text style={[styles.dobText, day && styles.dobTextFilled]}>
                {day || 'Day'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.dobField}
              onPress={() => setShowPicker('month')}
            >
              <Text style={[styles.dobText, month && styles.dobTextFilled]}>
                {month || 'Month'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.dobField}
              onPress={() => setShowPicker('year')}
            >
              <Text style={[styles.dobText, year && styles.dobTextFilled]}>
                {year || 'Year'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Spacer for bottom button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Next Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            canProceed ? styles.nextButtonActive : styles.nextButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={!canProceed}
        >
          <Text style={[
            styles.nextButtonText,
            canProceed ? styles.nextButtonTextActive : styles.nextButtonTextDisabled,
          ]}>
            Next
          </Text>
        </TouchableOpacity>
      </View>

      {renderPicker()}
    </SafeContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingTop: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32,
    marginTop: 8,
  },
  progressBar: {
    width: 60,
    height: 4,
    borderRadius: 2,
  },
  progressBarActive: {
    backgroundColor: '#000000',
  },
  progressBarInactive: {
    backgroundColor: '#E5E5EA',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 32,
    lineHeight: 22,
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  photoWrapper: {
    position: 'relative',
  },
  profilePhoto: {
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  photoPlaceholder: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  editButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 8,
    fontWeight: '400',
  },
  inputContainer: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  input: {
    fontSize: 18,
    color: '#000000',
    fontWeight: '400',
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  dropdown: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  dropdownText: {
    fontSize: 18,
    color: '#000000',
  },
  dobContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  dobField: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dobText: {
    fontSize: 18,
    color: '#999999',
  },
  dobTextFilled: {
    color: '#000000',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 40,
    backgroundColor: '#FFFFFF',
  },
  nextButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#8E8E93',
  },
  nextButtonActive: {
    backgroundColor: '#000000',
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  nextButtonTextDisabled: {
    color: '#FFFFFF',
  },
  nextButtonTextActive: {
    color: '#FFFFFF',
  },
  pickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: 400,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  pickerDone: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  pickerScroll: {
    maxHeight: 300,
  },
  pickerItem: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  pickerItemText: {
    fontSize: 18,
    color: '#000000',
  },
});
