import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const SkeletonProductCard = () => {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: colors.cardBg }]}>
      <View style={[styles.image, { backgroundColor: '#e0e0e0' }]} />
      <View style={styles.content}>
        <View style={[styles.text, { backgroundColor: '#e0e0e0' }]} />
        <View style={[styles.textShort, { backgroundColor: '#e0e0e0' }]} />
        <View style={[styles.price, { backgroundColor: '#e0e0e0' }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '48%',
    marginBottom: 12,
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  content: {
    padding: 12,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  text: {
    height: 16,
    borderRadius: 4,
    marginBottom: 8,
  },
  textShort: {
    height: 14,
    width: '60%',
    borderRadius: 4,
    marginBottom: 8,
  },
  price: {
    height: 20,
    width: '40%',
    borderRadius: 4,
  },
});

export default SkeletonProductCard;
