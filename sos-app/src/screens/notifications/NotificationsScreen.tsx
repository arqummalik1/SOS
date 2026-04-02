import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing } from '../../theme/spacing';
import { fontNames } from '../../theme/fonts';
import { typography } from '../../theme/typography';
import { colors } from '../../theme';
import { LinearGradient } from 'expo-linear-gradient';

interface NotificationsScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

const notifications = [
  {
    id: '1',
    title: 'New Collection Available',
    message: 'Check out the latest summer styles curated just for you!',
    time: '2 hours ago',
    read: false,
    icon: 'shirt-outline',
  },
  {
    id: '2',
    title: 'Style Saved',
    message: 'You saved "Elegant Evening Wear" to your collection.',
    time: '5 hours ago',
    read: true,
    icon: 'heart',
  },
  {
    id: '3',
    title: 'Weekly Style Report',
    message: 'Your personalized style recommendations are ready.',
    time: '1 day ago',
    read: true,
    icon: 'bar-chart-outline',
  },
  {
    id: '4',
    title: 'Profile Updated',
    message: 'Your style preferences have been updated successfully.',
    time: '2 days ago',
    read: true,
    icon: 'person-outline',
  },
];

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
  navigation,
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.gray[100]} />
      
      {/* Pink/Purple Gradient Header Background */}
      <LinearGradient
        colors={['#E8D5E8', '#F3E8F3', colors.gray[100]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.4 }}
        style={styles.gradientHeader}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity activeOpacity={0.7}>
          <Text style={styles.markAll}>Mark all</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {notifications.map((notification) => (
          <TouchableOpacity 
            key={notification.id}
            style={[
              styles.notificationCard,
              !notification.read && styles.notificationCardUnread,
            ]}
            activeOpacity={0.85}
          >
            {/* Icon Container */}
            <View style={styles.iconContainer}>
              <Ionicons
                name={notification.icon as any}
                size={22}
                color="#9B7BA0"
              />
            </View>

            {/* Text Content */}
            <View style={styles.textContainer}>
              <Text style={[
                styles.title,
                !notification.read && styles.titleUnread,
              ]}>
                {notification.title}
              </Text>
              <Text style={styles.message}>{notification.message}</Text>
              <Text style={styles.time}>{notification.time}</Text>
            </View>

            {/* Unread Indicator */}
            {!notification.read && (
              <View style={styles.unreadIndicator}>
                <View style={styles.unreadDot} />
              </View>
            )}
          </TouchableOpacity>
        ))}
        
        {/* Bottom padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[100],
  },
  gradientHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 180,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: 'transparent',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    ...typography.title3,
    color: '#111111',
  },
  markAll: {
    ...typography.subheadline,
    color: '#9B7BA0',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 12,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  notificationCardUnread: {
    backgroundColor: '#FAF7FA',
    borderColor: '#D4B8D9',
    shadowOpacity: 0.06,
    elevation: 3,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F6F0F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    ...typography.subheadline,
    color: '#374151',
    marginBottom: 4,
  },
  titleUnread: {
    color: '#111111',
    fontWeight: '700',
  },
  message: {
    ...typography.footnote,
    color: '#6B7280',
    marginBottom: 6,
    lineHeight: 18,
  },
  time: {
    ...typography.caption1,
    color: '#9B7BA0',
  },
  unreadIndicator: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#BF5AF2',
  },
  bottomPadding: {
    height: 24,
  },
});
