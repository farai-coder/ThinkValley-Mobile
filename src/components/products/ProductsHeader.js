import React, { memo } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Image } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import Icon from 'react-native-vector-icons/Ionicons';
import logo from '../../../assets/logo.png';

const ProductsHeader = memo(({ 
  onBack, 
  onSearch, 
  onCart, 
  cartCount, 
  scrollY 
}) => {
  const { colors, spacing, borderRadius, shadows, touchTarget } = useTheme();

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [72, 56],
    extrapolate: 'clamp',
  });

  const logoScale = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [1, 0.85],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View style={[
      styles.container,
      { 
        backgroundColor: colors.cardBg,
        borderBottomColor: colors.borderColor,
        height: headerHeight,
        ...shadows.sm,
      }
    ]}>
      <View style={styles.content}>
        <TouchableOpacity
          onPress={onBack}
          style={[
            styles.iconButton,
            { 
              backgroundColor: colors.surface,
              width: touchTarget.minimum,
              height: touchTarget.minimum,
              borderRadius: borderRadius.full,
            }
          ]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Icon name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>

        <Animated.View style={{ transform: [{ scale: logoScale }] }}>
          <Image 
            source={logo} 
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        <View style={styles.actions}>
          <TouchableOpacity
            onPress={onSearch}
            style={[
              styles.iconButton,
              { 
                backgroundColor: colors.surface,
                width: touchTarget.minimum,
                height: touchTarget.minimum,
                borderRadius: borderRadius.full,
              }
            ]}
            accessibilityRole="button"
            accessibilityLabel="Search products"
          >
            <Icon name="search" size={24} color={colors.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onCart}
            style={[
              styles.iconButton,
              { 
                backgroundColor: colors.surface,
                width: touchTarget.minimum,
                height: touchTarget.minimum,
                borderRadius: borderRadius.full,
              }
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Shopping cart, ${cartCount} items`}
            accessibilityHint="View your shopping cart"
          >
            <Icon name="cart-outline" size={24} color={colors.textPrimary} />
            {cartCount > 0 && (
              <View style={[
                styles.badge,
                { 
                  backgroundColor: colors.primary,
                  minWidth: 20,
                  height: 20,
                  borderRadius: borderRadius.full,
                }
              ]}>
                <Animated.Text style={[
                  styles.badgeText,
                  { color: colors.onPrimary }
                ]}>
                  {cartCount > 99 ? '99+' : cartCount}
                </Animated.Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
});

ProductsHeader.displayName = 'ProductsHeader';

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    zIndex: 100,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 32,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 12,
  },
});

export default ProductsHeader;
