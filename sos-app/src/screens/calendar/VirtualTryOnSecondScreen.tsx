import React, { useState } from 'react';
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontNames } from '../../theme';
import { typography } from '../../theme/typography';

const CLOTHING_ITEMS = [
  { id: '1', image: require('../../../assets/VirtualTryOnSecond/image1.png'), name: 'Red Coat' },
  { id: '2', image: require('../../../assets/VirtualTryOnSecond/image2.png'), name: 'Black Dress' },
  { id: '3', image: require('../../../assets/VirtualTryOnSecond/image3.png'), name: 'Turtleneck' },
  { id: '4', image: require('../../../assets/VirtualTryOnSecond/image4.png'), name: 'Boots' },
];

const ITEM_CARDS = [
  { id: '1', name: 'Red Wool Coat', brand: 'Zara', price: '$129', rating: 4.8 },
  { id: '2', name: 'Black Midi Dress', brand: 'H&M', price: '$59', rating: 4.5 },
  { id: '3', name: 'Cashmere Turtleneck', brand: 'Uniqlo', price: '$79', rating: 4.9 },
];

const SCORE_CATEGORIES = [
  { label: 'Color Harmony', score: 92 },
  { label: 'Style Match', score: 88 },
  { label: 'Occasion Fit', score: 95 },
];

type VirtualTryOnSecondScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

export const FirstScreen: React.FC<VirtualTryOnSecondScreenProps> = ({ navigation }) => {
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [starred, setStarred] = useState(false);

  const onSaveOutfit = () => {
    navigation.navigate('OutfitComplete');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.gray[100]} />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <TouchableOpacity style={styles.backRow} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={18} color="#1A1A1A" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          <Text style={styles.heading}>Virtual Try-On</Text>

          <View style={styles.bigImageContainer}>
            <Image 
              source={require('../../../assets/VirtualTryOnSecond/BigImage.png')} 
              style={styles.bigImage} 
              resizeMode="cover"
            />
          </View>

          <View style={styles.clothingScroll}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {CLOTHING_ITEMS.map((item) => (
                <View key={item.id} style={styles.clothingItem}>
                  <Image source={item.image} style={styles.clothingImage} resizeMode="cover" />
                </View>
              ))}
            </ScrollView>
          </View>

          <View style={styles.actionIconsRow}>
            <View style={styles.leftIcons}>
              <TouchableOpacity 
                style={[styles.iconBtn, liked && styles.iconBtnActive]} 
                onPress={() => setLiked(!liked)}
                activeOpacity={0.85}
              >
                <Ionicons name={liked ? "heart" : "heart-outline"} size={24} color={liked ? "#FF4B4B" : "#333"} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.iconBtn, disliked && styles.iconBtnActive]} 
                onPress={() => setDisliked(!disliked)}
                activeOpacity={0.85}
              >
                <Ionicons name="thumbs-down-outline" size={24} color={disliked ? "#666" : "#333"} />
              </TouchableOpacity>
            </View>

            <View style={styles.rightIcons}>
              <TouchableOpacity 
                style={[styles.iconBtn, saved && styles.iconBtnActive]} 
                onPress={() => setSaved(!saved)}
                activeOpacity={0.85}
              >
                <Ionicons name={saved ? "bookmark" : "bookmark-outline"} size={24} color={saved ? "#B79CBC" : "#333"} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.iconBtn, starred && styles.iconBtnActive]} 
                onPress={() => setStarred(!starred)}
                activeOpacity={0.85}
              >
                <Ionicons name={starred ? "star" : "star-outline"} size={24} color={starred ? "#FFD700" : "#333"} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} activeOpacity={0.85}>
                <Ionicons name="calendar-outline" size={24} color="#333" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.itemCardsSection}>
            <Text style={styles.sectionTitle}>Items in this Look</Text>
            {ITEM_CARDS.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemBrand}>{item.brand}</Text>
                  <View style={styles.itemRating}>
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <Text style={styles.ratingText}>{item.rating}</Text>
                  </View>
                </View>
                <Text style={styles.itemPrice}>{item.price}</Text>
              </View>
            ))}
          </View>

          <View style={styles.outfitScoreSection}>
            <Text style={styles.sectionTitle}>Outfit Score</Text>
            <View style={styles.scoreCards}>
              {SCORE_CATEGORIES.map((cat) => (
                <View key={cat.label} style={styles.scoreCard}>
                  <Text style={styles.scoreLabel}>{cat.label}</Text>
                  <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBar, { width: `${cat.score}%` }]} />
                  </View>
                  <Text style={styles.scoreValue}>{cat.score}</Text>
                </View>
              ))}
            </View>
          </View>

          <TouchableOpacity style={styles.saveOutfitBtn} onPress={onSaveOutfit} activeOpacity={0.9}>
            <Text style={styles.saveOutfitText}>Save Outfit</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export const VirtualTryOnSecondScreen = FirstScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[100],
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 100,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 6,
    marginLeft: -4,
  },
  backText: {
    marginLeft: 4,
    ...typography.body,
    color: '#1F1F1F',
  },
  heading: {
    marginTop: 16,
    textAlign: 'center',
    ...typography.title1,
    color: '#111111',
  },
  bigImageContainer: {
    marginTop: 24,
    width: '100%',
    height: 570,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  bigImage: {
    width: '100%',
    height: '100%',
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  clothingScroll: {
    marginTop: 20,
  },
  clothingItem: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  clothingImage: {
    width: '100%',
    height: '100%',
  },
  actionIconsRow: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  rightIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnActive: {
    backgroundColor: '#F0F0F0',
  },
  itemCardsSection: {
    marginTop: 28,
  },
  sectionTitle: {
    ...typography.title3,
    color: '#111111',
    marginBottom: 16,
  },
  itemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    ...typography.subheadline,
    color: '#111111',
  },
  itemBrand: {
    ...typography.footnote,
    color: '#666666',
    marginTop: 2,
  },
  itemRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  ratingText: {
    ...typography.footnote,
    color: '#666666',
  },
  itemPrice: {
    ...typography.headline,
    color: '#111111',
  },
  outfitScoreSection: {
    marginTop: 28,
  },
  scoreCards: {
    gap: 12,
  },
  scoreCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  scoreLabel: {
    ...typography.footnote,
    color: '#333333',
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E8E8E8',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#B79CBC',
    borderRadius: 4,
  },
  scoreValue: {
    ...typography.headline,
    color: '#111111',
    textAlign: 'right',
  },
  saveOutfitBtn: {
    marginTop: 32,
    marginHorizontal: 40,
    height: 52,
    borderRadius: 28,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveOutfitText: {
    ...typography.body,
    color: '#FFFFFF',
  },
});
