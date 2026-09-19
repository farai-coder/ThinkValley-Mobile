import React, { memo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const PriceDisplay = memo(({ price, oldPrice, currency = '$' }) => {
  const { colors, spacing, borderRadius, typography } = useTheme();

  const discount = oldPrice && price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;

  return (
    <View style={styles.container}>
      <View style={styles.priceRow}>
        <Text style={[styles.currentPrice, { color: colors.primary, ...typography.h5 }]}>
          {currency}{Number(price)?.toFixed(2)}
        </Text>
        {oldPrice && oldPrice > price && (
          <Text style={[styles.oldPrice, { color: colors.textMuted, ...typography.bodySmall }]}>
            {currency}{Number(oldPrice)?.toFixed(2)}
          </Text>
        )}
      </View>
      {discount > 0 && (
        <View style={[
          styles.discountBadge,
          { 
            backgroundColor: colors.error,
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.xs,
            borderRadius: borderRadius.sm,
          }
        ]}>
          <Text style={[styles.discountText, { color: colors.onPrimary, ...typography.overline }]}>
            -{discount}%
          </Text>
        </View>
      )}
    </View>
  );
});

PriceDisplay.displayName = 'PriceDisplay';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  currentPrice: {
    fontWeight: '700',
  },
  oldPrice: {
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    alignSelf: 'flex-start',
  },
  discountText: {
    fontWeight: '700',
  },
});

export default PriceDisplay;
