import React from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { fontNames } from '../../theme/fonts';
import { typography } from '../../theme/typography';

interface MyItemsScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

type ItemCard = {
  id: string;
  title: string;
  category: string;
  color: string;
  season: string;
  size: string;
  image: any;
};

const ITEMS: ItemCard[] = [
  {
    id: '1',
    title: 'Denim ripped jeans',
    category: 'Pants',
    color: 'Denim blue',
    season: 'Summer',
    size: '36',
    image: require('../../../assets/MyItems/Image (1).png'),
  },
  {
    id: '2',
    title: 'Green blue checked\nshirt, half sleeve',
    category: 'Shirt',
    color: 'Green',
    season: 'Summer',
    size: '32',
    image: require('../../../assets/MyItems/Frame 1000006701.png'),
  },
  {
    id: '3',
    title: 'Black T-shirt with\nguitar print',
    category: 'Top',
    color: 'Dark blue',
    season: 'Summer',
    size: '32',
    image: require('../../../assets/MyItems/Frame 1000006701 (1).png'),
  },
  {
    id: '4',
    title: 'Red Overcoat',
    category: 'Coat',
    color: 'Red',
    season: 'Winter',
    size: 'M',
    image: require('../../../assets/MyItems/Frame 1000006701 (2).png'),
  },
];

export const MyItemsScreen: React.FC<MyItemsScreenProps> = ({ navigation }) => {
  const onEditDetails = () => {
    navigation.navigate('EditItemDetails');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#EEEEEE" />

      <View style={styles.headerTopPad} />

      <View style={styles.backRow}>
        <TouchableOpacity style={styles.backHit} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={styles.backArrow}>‹</Text>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.titleWrap}>
        <Text style={styles.title}>My Items</Text>
        <Text style={styles.subtitle}>Make your wardrobe even smarter!</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {ITEMS.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.imageColumn}>
              <Image source={item.image} style={styles.itemImage} resizeMode="contain" />
              {item.id === '4' ? (
                <Image
                  source={require('../../../assets/MyItems/Frame 1000006728.png')}
                  style={styles.optionalAltImage}
                  resizeMode="contain"
                />
              ) : null}
            </View>

            <View style={styles.detailsColumn}>
              <Text style={styles.itemTitle}>{item.title}</Text>

              <View style={styles.specBox}>
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>Category:</Text>
                  <Text style={styles.specValue}>{item.category}</Text>
                </View>
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>Color:</Text>
                  <Text style={styles.specValue}>{item.color}</Text>
                </View>
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>Season:</Text>
                  <Text style={styles.specValue}>{item.season}</Text>
                </View>
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>Size:</Text>
                  <Text style={styles.specValue}>{item.size}</Text>
                </View>
                <View style={styles.specPurpleAccent} />
              </View>

              <TouchableOpacity
                style={styles.editButton}
                onPress={onEditDetails}
                activeOpacity={0.85}
              >
                <Text style={styles.editButtonText}>Edit details</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <View style={styles.bottomGap} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEEEEE',
  },
  headerTopPad: {
    height: 8,
  },
  backRow: {
    paddingHorizontal: 22,
    paddingTop: 8,
  },
  backHit: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingVertical: 4,
  },
  backArrow: {
    ...typography.title2,
    color: '#1F1F1F',
    marginTop: -1,
  },
  backText: {
    ...typography.small,
    color: '#3A3A3A',
  },
  titleWrap: {
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  title: {
    ...typography.largeTitle,
    color: '#222222',
  },
  subtitle: {
    marginTop: 4,
    ...typography.medium,
    color: '#333333',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#F5F5F5',
    borderRadius: 24,
    minHeight: 270,
    marginBottom: 14,
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  imageColumn: {
    width: '51%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  itemImage: {
    width: '96%',
    height: 238,
  },
  optionalAltImage: {
    position: 'absolute',
    bottom: -8,
    right: -26,
    width: 76,
    height: 76,
    opacity: 0.01,
  },
  detailsColumn: {
    width: '49%',
    paddingTop: 2,
  },
  itemTitle: {
    ...typography.largeTitle,
    color: '#000000',
    marginBottom: 8,
    fontSize:18,
  },
  specBox: {
    backgroundColor: '#F1F1F1',
    borderRadius: 8,
    paddingLeft: 12,
    paddingRight: 8,
    paddingVertical: 10,
    marginBottom: 12,
    position: 'relative',
    minHeight: 112,
  },
  specRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 7,
  },
  specLabel: {
    width: 73,
    ...typography.small,
    color: '#3C3C3C',
  },
  specValue: {
    ...typography.small,
    color: '#3C3C3C',
  },
  specPurpleAccent: {
    position: 'absolute',
    top: 2,
    right: 0,
    width: 2,
    height: 38,
    backgroundColor: '#B884BA',
    borderRadius: 2,
  },
  editButton: {
    alignSelf: 'flex-start',
    minWidth: 102,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#C8B0CA',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  editButtonText: {
    ...typography.small,
    color: '#3A2F3A',
  },
  bottomGap: {
    height: 102,
  },
});
