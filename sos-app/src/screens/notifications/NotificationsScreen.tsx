import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GradientBackground } from '../../components/layout/GradientBackground';
import { GlassView } from '../../components/ui/GlassView';
import { SafeContainer } from '../../components/layout/SafeContainer';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

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
    <GradientBackground>
      <SafeContainer>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <GlassView intensity="thin" borderRadius={20} style={styles.iconButton}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </GlassView>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <TouchableOpacity>
            <Text style={styles.markAll}>Mark all</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {notifications.map((notification) => (
            <TouchableOpacity key={notification.id}>
              <GlassView
                intensity={notification.read ? 'thin' : 'regular'}
                borderRadius={16}
                style={styles.notificationCard}
              >
                <View style={styles.iconContainer}>
                  <Ionicons
                    name={notification.icon as any}
                    size={24}
                    color="#FFFFFF"
                  />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.title}>{notification.title}</Text>
                  <Text style={styles.message}>{notification.message}</Text>
                  <Text style={styles.time}>{notification.time}</Text>
                </View>
                {!notification.read && <View style={styles.unreadDot} />}
              </GlassView>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeContainer>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    fontSize: typography.title2.fontSize,
    fontWeight: typography.title2.fontWeight,
    color: '#FFFFFF',
  },
  markAll: {
    fontSize: typography.subheadline.fontSize,
    color: 'rgba(255,255,255,0.8)',
  },
  iconButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxxl,
    gap: spacing.md,
  },
  notificationCard: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: typography.subheadline.fontSize,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  message: {
    fontSize: typography.footnote.fontSize,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: spacing.xs,
  },
  time: {
    fontSize: typography.caption2.fontSize,
    color: 'rgba(255,255,255,0.5)',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#BF5AF2',
    alignSelf: 'center',
  },
});
