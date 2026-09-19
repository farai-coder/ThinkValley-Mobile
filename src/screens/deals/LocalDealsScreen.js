import React from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const LocalDealsScreen = () => {
  const { colors } = useTheme();

  const deals = [
    {
      id: 1,
      title: '50% Off Paracetamol',
      description: 'Get 50% off on all paracetamol products',
      originalPrice: '$10.00',
      dealPrice: '$5.00',
      image: 'https://via.placeholder.com/150',
      expiry: 'Expires in 2 days',
    },
    {
      id: 2,
      title: 'Buy 1 Get 1 Free',
      description: 'Vitamin C supplements - buy one get one free',
      originalPrice: '$15.00',
      dealPrice: '$7.50',
      image: 'https://via.placeholder.com/150',
      expiry: 'Expires in 5 days',
    },
    {
      id: 3,
      title: 'Weekend Special',
      description: '20% off on all skincare products',
      originalPrice: '$25.00',
      dealPrice: '$20.00',
      image: 'https://via.placeholder.com/150',
      expiry: 'Expires in 1 day',
    },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.headerTitle}>Local Deals</Text>
        <Text style={styles.headerSubtitle}>Exclusive offers near you</Text>
      </View>

      <View style={styles.dealsContainer}>
        {deals.map((deal) => (
          <TouchableOpacity
            key={deal.id}
            style={[styles.dealCard, { backgroundColor: colors.cardBg }]}
          >
            <Image source={{ uri: deal.image }} style={styles.dealImage} />
            <View style={styles.dealInfo}>
              <Text style={[styles.dealTitle, { color: colors.text }]}>{deal.title}</Text>
              <Text style={[styles.dealDescription, { color: colors.textSecondary }]}>
                {deal.description}
              </Text>
              <View style={styles.priceContainer}>
                <Text style={[styles.originalPrice, { color: colors.textSecondary }]}>
                  {deal.originalPrice}
                </Text>
                <Text style={[styles.dealPrice, { color: colors.primary }]}>{deal.dealPrice}</Text>
              </View>
              <Text style={[styles.expiry, { color: colors.textSecondary }]}>{deal.expiry}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    marginTop: 5,
  },
  dealsContainer: {
    padding: 15,
  },
  dealCard: {
    flexDirection: 'row',
    borderRadius: 12,
    marginBottom: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dealImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
  },
  dealInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  dealTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  dealDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  originalPrice: {
    fontSize: 14,
    textDecorationLine: 'line-through',
    marginRight: 10,
  },
  dealPrice: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  expiry: {
    fontSize: 12,
    fontStyle: 'italic',
  },
});

export default LocalDealsScreen;
