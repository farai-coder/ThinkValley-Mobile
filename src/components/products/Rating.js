import React, { memo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import Icon from 'react-native-vector-icons/Ionicons';

const Rating = memo(({ rating = 0, reviewCount = 0, size = 14 }) => {
  const { colors, spacing, typography } = useTheme();

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Icon
          key={`full-${i}`}
          name="star"
          size={size}
          color={colors.accent}
        />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Icon
          key="half"
          name="star-half"
          size={size}
          color={colors.accent}
        />
      );
    }

    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Icon
          key={`empty-${i}`}
          name="star-outline"
          size={size}
          color={colors.textHint}
        />
      );
    }

    return stars;
  };

  return (
    <View style={styles.container}>
      <View style={styles.stars}>
        {renderStars()}
      </View>
      {reviewCount > 0 && (
        <Text style={[styles.reviewCount, { color: colors.textMuted, ...typography.small }]}>
          ({reviewCount})
        </Text>
      )}
    </View>
  );
});

Rating.displayName = 'Rating';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stars: {
    flexDirection: 'row',
    gap: 1,
  },
  reviewCount: {
    fontWeight: '500',
  },
});

export default Rating;
