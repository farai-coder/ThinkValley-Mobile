import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useCart } from '../../context/CartContext';
import { productService } from '../../services/productService';
import Icon from 'react-native-vector-icons/Ionicons';
import responsive from '../../utils/responsive';

const ProductDetailScreen = () => {
  const { colors, spacing, borderRadius, typography } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { productId } = route.params;
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      const data = await productService.getProduct(productId);
      setProduct(data);
    } catch (error) {
      console.error('Failed to load product:', error);
      Alert.alert('Error', 'Failed to load product details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      Alert.alert(
        'Added to Cart',
        `${product.name} has been added to your cart`,
        [
          { text: 'Continue Shopping', onPress: () => navigation.goBack() },
          { text: 'View Cart', onPress: () => navigation.navigate('CartStack') },
        ]
      );
    }
  };

  const handleBuyNow = () => {
    if (product) {
      addToCart(product, quantity);
      navigation.navigate('Checkout');
    }
  };

  if (isLoading || !product) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.textSecondary }}>Loading...</Text>
      </View>
    );
  }

  const images = product.gallery_images || [{ display_url: product.display_image || product.image }];
  const imageUrls = images.map(img => img.display_url || img.image_url || img);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.imageGallery}>
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
          {imageUrls.map((img, index) => (
            <View key={index} style={styles.imageContainer}>
              <Image
                source={{ uri: img }}
                style={[styles.mainImage, { height: responsive.getResponsiveDimension(250, 300, 350) }]}
                resizeMode="contain"
              />
            </View>
          ))}
        </ScrollView>
        <View style={styles.thumbnailGallery}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {imageUrls.map((img, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.thumbnail,
                  selectedImage === index && styles.thumbnailActive,
                  { 
                    borderColor: selectedImage === index ? colors.primary : colors.borderColor,
                    width: responsive.getResponsiveDimension(50, 60, 70),
                    height: responsive.getResponsiveDimension(50, 60, 70)
                  }
                ]}
                onPress={() => setSelectedImage(index)}
              >
                <Image source={{ uri: img }} style={styles.thumbnailImage} resizeMode="cover" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        {(product.is_new || product.on_sale) && (
          <View style={[styles.badge, { 
            backgroundColor: product.on_sale ? colors.error : colors.primary,
            paddingHorizontal: responsive.padding.sm,
            paddingVertical: responsive.padding.xs
          }]}>
            <Text style={[styles.badgeText, { fontSize: responsive.fontSize.xs }]}>{product.on_sale ? 'SALE' : 'NEW'}</Text>
          </View>
        )}
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={responsive.icon.md} color="#fff" />
        </TouchableOpacity>
      </View>
      <View style={[styles.productInfo, { padding: responsive.padding.lg }]}>
        <View style={styles.sellerInfo}>
          <Icon name="storefront-outline" size={responsive.icon.xs} color={colors.primary} />
          <Text style={[styles.sellerText, { color: colors.primary, fontSize: responsive.fontSize.sm }]}>ThinkValley</Text>
        </View>
        <Text style={[styles.productName, { color: colors.textPrimary, fontSize: responsive.fontSize.xl }]} numberOfLines={responsive.lines.medium}>
          {product.name}
        </Text>
        <View style={styles.rating}>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Icon
                key={star}
                name={star <= (product.rating || 4) ? 'star' : 'star-outline'}
                size={responsive.icon.xs}
                color={colors.accent}
              />
            ))}
          </View>
          <Text style={[styles.ratingText, { color: colors.textMuted, fontSize: responsive.fontSize.xs }]}>
            ({product.review_count || 0} reviews)
          </Text>
        </View>
        <View style={[styles.priceBlock, { backgroundColor: colors.secondary, padding: responsive.padding.md }]}>
          <Text style={[styles.currentPrice, { color: colors.textPrimary, fontSize: responsive.fontSize.xl }]}>
            ${Number(product.sale_price && product.sale_price < product.price ? product.sale_price : product.price)?.toFixed(2)}
          </Text>
          {product.sale_price && product.sale_price < product.price && (
            <>
              <Text style={[styles.oldPrice, { color: colors.textMuted, fontSize: responsive.fontSize.sm }]}>
                ${Number(product.price)?.toFixed(2)}
              </Text>
              {product.discount && (
                <View style={[styles.saveBadge, { backgroundColor: colors.error, paddingHorizontal: responsive.padding.xs, paddingVertical: responsive.padding.xs }]}>
                  <Text style={[styles.saveBadgeText, { fontSize: responsive.fontSize.xs }]}>SAVE {product.discount}%</Text>
                </View>
              )}
            </>
          )}
        </View>
        <View style={styles.metaInfo}>
          <View style={styles.metaItem}>
            <Icon name="checkmark-circle" size={responsive.icon.sm} color={colors.success} />
            <Text style={[styles.metaText, { color: colors.textSecondary, fontSize: responsive.fontSize.xs }]}>In Stock</Text>
          </View>
          <View style={styles.metaItem}>
            <Icon name="shield-checkmark" size={responsive.icon.sm} color={colors.success} />
            <Text style={[styles.metaText, { color: colors.textSecondary, fontSize: responsive.fontSize.xs }]}>Buyer Protection</Text>
          </View>
          <View style={styles.metaItem}>
            <Icon name="return-up-back" size={responsive.icon.sm} color={colors.success} />
            <Text style={[styles.metaText, { color: colors.textSecondary, fontSize: responsive.fontSize.xs }]}>Easy Returns</Text>
          </View>
        </View>
        <View style={styles.quantitySection}>
          <Text style={[styles.quantityLabel, { color: colors.textPrimary, fontSize: responsive.fontSize.sm }]}>Quantity</Text>
          <View style={[styles.quantitySelector, { borderColor: colors.borderColor }]}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Text style={[styles.quantityButtonText, { color: colors.textPrimary, fontSize: responsive.fontSize.md }]}>−</Text>
            </TouchableOpacity>
            <Text style={[styles.quantityValue, { color: colors.textPrimary, fontSize: responsive.fontSize.sm }]}>{quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity(quantity + 1)}
            >
              <Text style={[styles.quantityButtonText, { color: colors.textPrimary, fontSize: responsive.fontSize.md }]}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
        {product.description && (
          <View style={[styles.descriptionSection, { borderColor: colors.borderColor }]}>
            <TouchableOpacity
              style={[styles.descriptionToggle, { backgroundColor: colors.secondary, padding: responsive.padding.md }]}
              onPress={() => {}}
            >
              <Text style={[styles.descriptionToggleText, { color: colors.textPrimary, fontSize: responsive.fontSize.sm }]}>Description</Text>
              <Icon name="chevron-down" size={responsive.icon.sm} color={colors.textPrimary} />
            </TouchableOpacity>
            <View style={styles.descriptionContent}>
              <Text style={[styles.descriptionText, { color: colors.textSecondary, fontSize: responsive.fontSize.sm }]}>
                {product.description}
              </Text>
            </View>
          </View>
        )}
        {product.specifications && (
          <View style={[styles.specsSection, { borderColor: colors.borderColor }]}>
            <TouchableOpacity
              style={[styles.specsToggle, { backgroundColor: colors.secondary, padding: responsive.padding.md }]}
              onPress={() => {}}
            >
              <Text style={[styles.specsToggleText, { color: colors.textPrimary, fontSize: responsive.fontSize.sm }]}>Specifications</Text>
              <Icon name="chevron-down" size={responsive.icon.sm} color={colors.textPrimary} />
            </TouchableOpacity>
            <View style={styles.specsContent}>
              {Object.entries(product.specifications).map(([key, value]) => (
                <View key={key} style={styles.specItem}>
                  <Text style={[styles.specKey, { color: colors.textSecondary, fontSize: responsive.fontSize.xs }]}>{key}:</Text>
                  <Text style={[styles.specValue, { color: colors.textPrimary, fontSize: responsive.fontSize.xs }]}>{value}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
      <View style={[styles.actionBar, { 
        padding: responsive.padding.lg, 
        backgroundColor: colors.cardBg, 
        borderTopWidth: 1, 
        borderTopColor: colors.borderColor 
      }]}>
        <TouchableOpacity
          style={[styles.buyNowButton, { 
            backgroundColor: colors.primary, 
            borderRadius: borderRadius.full,
            padding: responsive.padding.md
          }]}
          onPress={handleBuyNow}
        >
          <Text style={[styles.buyNowText, { fontSize: responsive.fontSize.sm }]}>Buy Now</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.addToCartButton, { 
            borderColor: colors.textPrimary, 
            borderRadius: borderRadius.full,
            padding: responsive.padding.md
          }]}
          onPress={handleAddToCart}
        >
          <Icon name="cart-outline" size={responsive.icon.sm} color={colors.textPrimary} />
          <Text style={[styles.addToCartText, { color: colors.textPrimary, fontSize: responsive.fontSize.sm }]}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageGallery: {
    height: Dimensions.get('window').width * 0.8,
    backgroundColor: '#fff',
    position: 'relative',
  },
  imageContainer: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').width * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainImage: {
    width: '100%',
    height: '100%',
    maxWidth: Dimensions.get('window').width,
    maxHeight: Dimensions.get('window').width * 0.8,
  },
  thumbnailGallery: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 2,
    overflow: 'hidden',
  },
  thumbnailActive: {
    borderWidth: 3,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 20,
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 10,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  sellerText: {
    fontSize: 14,
    fontWeight: '600',
  },
  productName: {
    fontSize: Dimensions.get('window').width > 400 ? 28 : 22,
    fontWeight: '700',
    marginBottom: 8,
    lineHeight: Dimensions.get('window').width > 400 ? 36 : 28,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  stars: {
    flexDirection: 'row',
  },
  ratingText: {
    fontSize: 14,
  },
  priceBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  currentPrice: {
    fontSize: Dimensions.get('window').width > 400 ? 36 : 28,
    fontWeight: '800',
  },
  oldPrice: {
    fontSize: 16,
    marginLeft: 12,
    textDecorationLine: 'line-through',
  },
  saveBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginLeft: 12,
  },
  saveBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  metaInfo: {
    gap: 12,
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  metaText: {
    fontSize: 15,
  },
  quantitySection: {
    marginBottom: 20,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 25,
    overflow: 'hidden',
    width: 140,
    height: 40,
  },
  quantityButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 20,
    fontWeight: '600',
  },
  quantityValue: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  descriptionSection: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  descriptionToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  descriptionToggleText: {
    fontSize: 15,
    fontWeight: '600',
  },
  descriptionContent: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e4e7ec',
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
  },
  specsSection: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  specsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  specsToggleText: {
    fontSize: 15,
    fontWeight: '600',
  },
  specsContent: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e4e7ec',
  },
  specItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  specKey: {
    fontSize: 14,
    fontWeight: '600',
    width: 120,
  },
  specValue: {
    fontSize: 14,
    flex: 1,
  },
  actionBar: {
    flexDirection: 'row',
    gap: 12,
  },
  buyNowButton: {
    flex: 1,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buyNowText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  addToCartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderWidth: 2,
    gap: 8,
  },
  addToCartText: {
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ProductDetailScreen;
