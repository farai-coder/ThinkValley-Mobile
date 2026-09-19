import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const SkeletonCard = memo(() => {
  const { colors, spacing, borderRadius } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.cardBg, borderRadius: borderRadius.md, margin: spacing.sm }]}>
      <View style={[styles.skeletonImage, { backgroundColor: colors.surfaceVariant, borderTopLeftRadius: borderRadius.md, borderTopRightRadius: borderRadius.md }]} />
      <View style={[styles.content, { padding: spacing.sm }]}>
        <View style={[styles.skeletonCategory, { backgroundColor: colors.surfaceVariant, borderRadius: borderRadius.xs, marginBottom: spacing.xs }]} />
        <View style={[styles.skeletonName, { backgroundColor: colors.surfaceVariant, borderRadius: borderRadius.xs, marginBottom: spacing.xs }]} />
        <View style={[styles.skeletonName, { backgroundColor: colors.surfaceVariant, borderRadius: borderRadius.xs, marginBottom: spacing.sm }]} />
        <View style={styles.skeletonRating} />
        <View style={styles.skeletonFooter}>
          <View style={[styles.skeletonPrice, { backgroundColor: colors.surfaceVariant, borderRadius: borderRadius.xs }]} />
          <View style={[styles.skeletonButton, { backgroundColor: colors.surfaceVariant, borderRadius: borderRadius.full }]} />
        </View>
      </View>
    </View>
  );
});

SkeletonCard.displayName = 'SkeletonCard';

const LoadingGrid = memo(({ columns = 2, rows = 4 }) => {
  const { spacing } = useTheme();
  const cards = Array(columns * rows).fill(null);

  return (
    <View style={[styles.container, { paddingHorizontal: spacing.lg, paddingVertical: spacing.md }]}>
      {cards.map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </View>
  );
});

LoadingGrid.displayName = 'LoadingGrid';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    overflow: 'hidden',
  },
  skeletonImage: {
    width: '100%',
    aspectRatio: 0.72,
  },
  content: {
    gap: 4,
  },
  skeletonCategory: {
    width: '60%',
    height: 12,
  },
  skeletonName: {
    width: '100%',
    height: 16,
  },
  skeletonRating: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 8,
  },
  skeletonStar: {
    width: 12,
    height: 12,
    borderRadius: 2,
    backgroundColor: '#e0e0e0',
  },
  skeletonFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  skeletonPrice: {
    width: 80,
    height: 20,
  },
  skeletonButton: {
    width: 44,
    height: 44,
  },
});

export default LoadingGrid;
