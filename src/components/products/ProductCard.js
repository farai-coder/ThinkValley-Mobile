import React, { memo, useState, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Alert } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useCart } from '../../context/CartContext';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import ProductImage from './ProductImage';
import PriceDisplay from './PriceDisplay';
import Rating from './Rating';

const ProductCard = memo(({ product }) => {
  const { colors, spacing, borderRadius, shadows, typography, animation, touchTarget } = useTheme();
  const { addToCart } = useCart();
  const navigation = useNavigation();
  const [isFavorite, setIsFavorite] = useState(false);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const imageUrl = product.display_image || product.image_url || product.image;
  const oldPrice = product.sale_price && product.sale_price < product.price ? product.price : null;
  const currentPrice = product.sale_price && product.sale_price < product.price ? product.sale_price : product.price;
  const isOnSale = product.on_sale || (product.sale_price && product.sale_price < product.price);
  const isInStock = product.stock > 0;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      duration: animation.duration.fast,
    }).start();
  }, [scaleAnim, animation.duration.fast]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      duration: animation.duration.fast,
    }).start();
  }, [scaleAnim, animation.duration.fast]);

  const handleCardPress = useCallback(() => {
    navigation.navigate('ProductDetail', { productId: product.id });
  }, [navigation, product.id]);

  const handleFavoritePress = useCallback(() => {
    setIsFavorite(prev => !prev);
  }, []);

  const handleAddToCart = useCallback(() => {
    if (!isInStock) {
      Alert.alert('Out of Stock', 'This product is currently unavailable.');
      return;
    }
    addToCart(product, 1);
    Alert.alert('Added to Cart', `${product.name} has been added to your cart.`);
  }, [addToCart, product, isInStock]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={handleCardPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={[
          styles.card,
          {
            backgroundColor: colors.cardBg,
            borderRadius: borderRadius.md,
            margin: spacing.sm,
            ...shadows.sm,
          }
        ]}
        accessibilityRole="button"
        accessibilityLabel={`View ${product.name}, ${currentPrice}`}
        accessibilityHint="Double tap to view product details"
      >
        <View style={styles.imageContainer}>
          <ProductImage imageUrl={imageUrl} aspectRatio={0.72} />
          
          {isOnSale && (
            <View style={[
              styles.badge,
              { 
                backgroundColor: colors.error,
                paddingHorizontal: spacing.sm,
                paddingVertical: spacing.xs,
                borderRadius: borderRadius.sm,
              }
            ]}>
              <Text style={[styles.badgeText, { color: colors.onPrimary, ...typography.overline }]}>
                SALE
              </Text>
            </View>
          )}

          <TouchableOpacity
            onPress={handleFavoritePress}
            style={[
              styles.favoriteButton,
              { 
                width: touchTarget.minimum,
                height: touchTarget.minimum,
                borderRadius: borderRadius.full,
              }
            ]}
            accessibilityRole="button"
            accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            accessibilityState={{ selected: isFavorite }}
          >
            <Icon 
              name={isFavorite ? 'heart' : 'heart-outline'} 
              size={20} 
              color={isFavorite ? colors.error : colors.cardBg} 
            />
          </TouchableOpacity>

          {!isInStock && (
            <View style={[
              styles.stockBadge,
              { 
                backgroundColor: colors.overlay,
                paddingHorizontal: spacing.sm,
                paddingVertical: spacing.xs,
                borderRadius: borderRadius.sm,
              }
            ]}>
              <Text style={[styles.stockText, { color: colors.onPrimary, ...typography.overline }]}>
                OUT OF STOCK
              </Text>
            </View>
          )}
        </View>

        <View style={[styles.content, { padding: spacing.sm }]}>
          <Text 
            style={[styles.category, { color: colors.textSecondary, ...typography.small }]} 
            numberOfLines={1}
          >
            {product.category_name || 'Category'}
          </Text>

          <Text 
            style={[styles.name, { color: colors.textPrimary, ...typography.h6 }]} 
            numberOfLines={2}
          >
            {product.name}
          </Text>

          <Rating rating={product.rating || 0} reviewCount={product.review_count || 0} size={12} />

          <View style={styles.footer}>
            <PriceDisplay 
              price={currentPrice} 
              oldPrice={oldPrice} 
              currency={product.currency || '$'} 
            />
            
            {isInStock && (
              <TouchableOpacity
                onPress={handleAddToCart}
                style={[
                  styles.addButton,
                  { 
                    backgroundColor: colors.primary,
                    width: touchTarget.minimum,
                    height: touchTarget.minimum,
                    borderRadius: borderRadius.full,
                  }
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Add ${product.name} to cart`}
              >
                <Icon name="add" size={20} color={colors.onPrimary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

ProductCard.displayName = 'ProductCard';

const styles = StyleSheet.create({
  card: {
    flex: 1,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 2,
  },
  badgeText: {
    fontWeight: '700',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  stockBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    alignSelf: 'center',
    zIndex: 2,
  },
  stockText: {
    fontWeight: '700',
    textAlign: 'center',
  },
  content: {
    gap: 4,
  },
  category: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  name: {
    fontWeight: '600',
    minHeight: 40,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  addButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProductCard;
