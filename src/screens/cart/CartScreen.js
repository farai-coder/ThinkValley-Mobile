import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../../context/CartContext';
import Icon from 'react-native-vector-icons/Ionicons';
import logoImage from '../../../assets/logo.png';
import responsive from '../../utils/responsive';

const CartScreen = () => {
  const { colors, spacing, borderRadius, typography } = useTheme();
  const navigation = useNavigation();
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();

  const handleRemoveItem = (productId, productName) => {
    Alert.alert(
      'Remove Item',
      `Are you sure you want to remove ${productName} from cart?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', onPress: () => removeFromCart(productId), style: 'destructive' },
      ]
    );
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Your cart is empty');
      return;
    }
    navigation.navigate('Checkout');
  };

  const CartItem = ({ item }) => {
    const imageUrl = item.display_image || item.image_url || item.image;
    return (
      <View style={[styles.cartItem, { 
        backgroundColor: colors.cardBg, 
        borderBottomColor: colors.borderColor,
        padding: responsive.padding.md
      }]}>
        <Image
          source={{ uri: imageUrl }}
          style={[styles.itemImage, { width: responsive.getResponsiveDimension(60, 70, 80), height: responsive.getResponsiveDimension(60, 70, 80) }]}
          resizeMode="contain"
        />
        <View style={styles.itemDetails}>
          <Text style={[styles.itemName, { color: colors.textPrimary, fontSize: responsive.fontSize.sm }]} numberOfLines={responsive.lines.short}>
            {item.name}
          </Text>
          <View style={styles.itemMeta}>
            <Text style={[styles.metaText, { color: colors.textSecondary, fontSize: responsive.fontSize.xs }]}>
              <Icon name="storefront-outline" size={responsive.icon.xs} /> ThinkValley
            </Text>
            <Text style={[styles.metaText, { color: colors.success, fontSize: responsive.fontSize.xs }]}>
              <Icon name="checkmark-circle" size={responsive.icon.xs} /> In Stock
            </Text>
          </View>
          <View style={styles.itemControls}>
            <View style={[styles.qtyStepper, { borderColor: colors.borderColor }]}>
              <TouchableOpacity
                style={styles.qtyButton}
                onPress={() => updateQuantity(item.id, item.quantity - 1)}
              >
                <Text style={[styles.qtyButtonText, { color: colors.textSecondary, fontSize: responsive.fontSize.md }]}>−</Text>
              </TouchableOpacity>
              <Text style={[styles.qtyValue, { color: colors.textPrimary, fontSize: responsive.fontSize.sm }]}>{item.quantity}</Text>
              <TouchableOpacity
                style={styles.qtyButton}
                onPress={() => updateQuantity(item.id, item.quantity + 1)}
              >
                <Text style={[styles.qtyButtonText, { color: colors.textSecondary, fontSize: responsive.fontSize.md }]}>+</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => handleRemoveItem(item.id, item.name)}>
              <Text style={[styles.removeLink, { color: colors.error, fontSize: responsive.fontSize.xs }]}>Remove</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.itemPriceSection}>
          <Text style={[styles.itemPrice, { color: colors.textPrimary, fontSize: responsive.fontSize.md }]}>
            ${Number(item.price)?.toFixed(2)}
          </Text>
        </View>
      </View>
    );
  };

  if (cartItems.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingHorizontal: responsive.padding.lg, paddingTop: responsive.padding.lg, paddingBottom: responsive.padding.md }]}>
          <Text style={[styles.title, { color: colors.textPrimary, fontSize: responsive.fontSize.xl }]}>
            Shopping Cart
          </Text>
        </View>
        <View style={styles.emptyContainer}>
          <Icon name="cart-outline" size={responsive.getResponsiveDimension(60, 80, 100)} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.textPrimary, fontSize: responsive.fontSize.md }]}>Your cart is empty</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary, fontSize: responsive.fontSize.sm }]}>
            Add items to get started
          </Text>
          <TouchableOpacity
            style={[styles.shopButton, { backgroundColor: colors.primary, borderRadius: borderRadius.full, padding: responsive.padding.md }]}
            onPress={() => navigation.navigate('StoreStack')}
          >
            <Text style={[styles.shopButtonText, { fontSize: responsive.fontSize.sm }]}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const subtotal = getCartTotal();
  const shipping = 0; // Free shipping
  const total = subtotal + shipping;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { 
        paddingHorizontal: responsive.padding.lg, 
        paddingTop: responsive.padding.lg, 
        paddingBottom: responsive.padding.md, 
        borderBottomWidth: 1, 
        borderBottomColor: colors.borderColor 
      }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={responsive.icon.md} color={colors.textPrimary} />
        </TouchableOpacity>
        <Image source={logoImage} style={[styles.headerLogo, { height: responsive.getResponsiveDimension(30, 35, 40) }]} resizeMode="contain" />
        <Text style={[styles.title, { color: colors.textPrimary, fontSize: responsive.fontSize.xl }]}>
          Shopping Cart ({cartItems.length})
        </Text>
      </View>
      <ScrollView style={[styles.cartList, { paddingHorizontal: responsive.padding.lg }]}>
        <View style={[styles.cartBox, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}>
          <View style={[styles.cartBoxHead, { borderBottomColor: colors.borderColor, padding: responsive.padding.md }]}>
            <View style={styles.cartBoxHeadLeft}>
              <Icon name="cart" size={responsive.icon.sm} color={colors.primary} />
              <Text style={[styles.cartBoxHeadTitle, { color: colors.textPrimary, fontSize: responsive.fontSize.sm }]}>Cart Items</Text>
            </View>
            <TouchableOpacity onPress={() => clearCart()}>
              <Text style={[styles.clearText, { color: colors.primary, fontSize: responsive.fontSize.xs }]}>Clear All</Text>
            </TouchableOpacity>
          </View>
          {cartItems.map((item) => (
            <CartItem key={item.id} item={item} />
          ))}
        </View>
      </ScrollView>
      <View style={[styles.summaryContainer, { 
        backgroundColor: colors.cardBg, 
        borderTopWidth: 1, 
        borderTopColor: colors.borderColor, 
        padding: responsive.padding.lg 
      }]}>
        <Text style={[styles.summaryTitle, { 
          color: colors.textPrimary, 
          borderBottomColor: colors.borderColor, 
          fontSize: responsive.fontSize.md 
        }]}>Order Summary</Text>
        <View style={styles.summaryRow}>
          <View>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary, fontSize: responsive.fontSize.sm }]}>Subtotal</Text>
            <Text style={[styles.labelInfo, { color: colors.textMuted, fontSize: responsive.fontSize.xs }]}>({cartItems.length} items)</Text>
          </View>
          <Text style={[styles.summaryValue, { color: colors.textPrimary, fontSize: responsive.fontSize.sm }]}>${subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary, fontSize: responsive.fontSize.sm }]}>Shipping</Text>
          <Text style={[styles.summaryValue, { color: shipping === 0 ? colors.success : colors.textPrimary, fontSize: responsive.fontSize.sm }]}>
            {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
          </Text>
        </View>
        <View style={[styles.divider, { borderBottomWidth: 1.5, borderBottomColor: colors.borderColor, marginVertical: responsive.padding.md }]} />
        <View style={styles.summaryRow}>
          <Text style={[styles.totalLabel, { color: colors.textPrimary, fontSize: responsive.fontSize.md }]}>Total</Text>
          <Text style={[styles.totalValue, { color: colors.primary, fontSize: responsive.fontSize.lg }]}>${total.toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          style={[styles.checkoutButton, { 
            backgroundColor: colors.primary, 
            borderRadius: borderRadius.full, 
            padding: responsive.padding.md 
          }]}
          onPress={handleCheckout}
        >
          <Icon name="cart-outline" size={responsive.icon.sm} color="#fff" />
          <Text style={[styles.checkoutButtonText, { fontSize: responsive.fontSize.sm }]}>Proceed to Checkout</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('StoreStack')}>
          <Text style={[styles.continueLink, { color: colors.primary, fontSize: responsive.fontSize.sm }]}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    padding: 8,
  },
  headerLogo: {
    width: 80,
    height: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  clearText: {
    fontSize: 14,
    fontWeight: '600',
  },
  cartList: {
    flex: 1,
    paddingVertical: 16,
  },
  cartBox: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cartBoxHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  cartBoxHeadLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cartBoxHeadTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  cartItem: {
    flexDirection: 'row',
    padding: 18,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  itemImage: {
    width: 110,
    height: 110,
    borderRadius: 8,
    backgroundColor: '#f8f9fc',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 18,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    lineHeight: 22,
  },
  itemMeta: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  metaText: {
    fontSize: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  itemControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  qtyStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 25,
    overflow: 'hidden',
  },
  qtyButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  qtyValue: {
    minWidth: 32,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
  removeLink: {
    fontSize: 13,
    fontWeight: '500',
  },
  itemPriceSection: {
    alignItems: 'flex-end',
  },
  itemPrice: {
    fontSize: 20,
    fontWeight: '800',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
  },
  shopButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  summaryContainer: {
    paddingBottom: 24,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
  },
  labelInfo: {
    fontSize: 11,
    marginTop: 2,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    width: '100%',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '800',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    marginTop: 14,
    gap: 8,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  continueLink: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 13,
    fontWeight: '500',
  },
  trustSection: {
    marginTop: 18,
    gap: 8,
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trustText: {
    fontSize: 11,
  },
});

export default CartScreen;
