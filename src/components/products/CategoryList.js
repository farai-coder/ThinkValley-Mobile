import React, { memo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import Icon from 'react-native-vector-icons/Ionicons';

const CategoryChip = memo(({ category, isSelected, onPress, index }) => {
  const { colors, spacing, borderRadius, typography, animation, touchTarget } = useTheme();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      duration: animation.duration.fast,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      duration: animation.duration.fast,
    }).start();
  };

  const getIconForCategory = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('electronic')) return 'laptop-outline';
    if (lowerName.includes('phone')) return 'phone-portrait-outline';
    if (lowerName.includes('fashion') || lowerName.includes('cloth')) return 'shirt-outline';
    if (lowerName.includes('home') || lowerName.includes('furnitur')) return 'home-outline';
    if (lowerName.includes('sport')) return 'football-outline';
    if (lowerName.includes('beauty') || lowerName.includes('health')) return 'sparkles-outline';
    if (lowerName.includes('food') || lowerName.includes('grocer')) return 'restaurant-outline';
    if (lowerName.includes('book')) return 'book-outline';
    if (lowerName.includes('toy') || lowerName.includes('kid')) return 'game-controller-outline';
    if (lowerName.includes('auto') || lowerName.includes('car')) return 'car-outline';
    return 'pricetag-outline';
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={() => {
          handlePressIn();
          onPress();
          setTimeout(handlePressOut, 100);
        }}
        style={[
          styles.chip,
          {
            backgroundColor: isSelected ? colors.primary : colors.cardBg,
            borderColor: isSelected ? colors.primary : colors.borderColor,
            borderRadius: borderRadius.full,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            borderWidth: 1.5,
            minHeight: touchTarget.minimum,
          }
        ]}
        accessibilityRole="button"
        accessibilityLabel={`Filter by ${category.name}`}
        accessibilityState={{ selected: isSelected }}
      >
        <View style={styles.chipContent}>
          <Icon 
            name={getIconForCategory(category.name)} 
            size={16} 
            color={isSelected ? colors.onPrimary : colors.textSecondary}
            style={styles.chipIcon}
          />
          <Animated.Text
            style={[
              styles.chipText,
              {
                color: isSelected ? colors.onPrimary : colors.textPrimary,
                ...typography.label,
              }
            ]}
          >
            {category.name}
          </Animated.Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

CategoryChip.displayName = 'CategoryChip';

const CategoryList = memo(({ categories, selectedCategory, onSelectCategory }) => {
  const { spacing } = useTheme();

  const allCategories = [{ id: null, name: 'All' }, ...categories];

  return (
    <View style={[styles.container, { paddingHorizontal: spacing.lg }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        snapToInterval={100}
      >
        {allCategories.map((category, index) => (
          <CategoryChip
            key={category.id || 'all'}
            category={category}
            isSelected={selectedCategory === category.id}
            onPress={() => onSelectCategory(category.id)}
            index={index}
          />
        ))}
      </ScrollView>
    </View>
  );
});

CategoryList.displayName = 'CategoryList';

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
  },
  scrollContent: {
    gap: 8,
  },
  chip: {
    marginRight: 8,
  },
  chipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chipIcon: {
    marginLeft: -4,
  },
  chipText: {
    fontWeight: '600',
  },
});

export default CategoryList;
