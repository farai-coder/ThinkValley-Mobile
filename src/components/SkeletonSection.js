import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import SkeletonCard from './SkeletonCard';

const SkeletonSection = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.title} />
        <View style={styles.seeAll} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.row}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    width: 150,
    height: 24,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  seeAll: {
    width: 60,
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  row: {
    flexDirection: 'row',
    paddingRight: 8,
  },
});

export default SkeletonSection;
