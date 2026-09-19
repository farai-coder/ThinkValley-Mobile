import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services/orderService';
import { paymentService } from '../../services/paymentService';
import Icon from 'react-native-vector-icons/Ionicons';
import logoImage from '../../../assets/logo.png';
import responsive from '../../utils/responsive';

// Mirrors the web checkout (frontend/checkout.html): standard shipping is free
// over $100, otherwise $9.99; express $14.99; tax 5%.
const SHIP_OPTIONS = {
  standard: { name: 'Standard Shipping', desc: '5–7 business days', price: 0, freeOver: 100, fallback: 9.99 },
  express: { name: 'Express Shipping', desc: '2–3 business days', price: 14.99 },
};
const TAX_RATE = 0.05;

const PAYNOW_METHODS = [
  { id: 'ecocash', name: 'EcoCash', desc: 'Instant mobile money via EcoCash', icon: 'phone-portrait-outline' },
  { id: 'onemoney', name: 'OneMoney', desc: 'Pay with your OneMoney wallet', icon: 'cash-outline' },
  { id: 'innbucks', name: 'InnBucks', desc: 'Pay with InnBucks microbank', icon: 'business-outline' },
];

const fmt = (n) => `$${Number(n || 0).toFixed(2)}`;

const CheckoutScreen = () => {
  const { colors, spacing, borderRadius, typography } = useTheme();
  const navigation = useNavigation();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [shippingAddress, setShippingAddress] = useState({
    full_name:
      user?.first_name || user?.last_name
        ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
        : '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: '',
    address2: '',
    city: '',
    province: '',
    postal_code: '',
  });
  const [shippingChoice, setShippingChoice] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [paynowMethod, setPaynowMethod] = useState('ecocash');
  const [idImage, setIdImage] = useState(null);
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Paynow mobile-checkout state
  const [paynowConfigured, setPaynowConfigured] = useState(false);
  const [paynowStatus, setPaynowStatus] = useState(null); // null | 'sent' | 'paid' | 'failed'
  const [paynowInstructions, setPaynowInstructions] = useState('');
  const pollRef = useRef(null);

  useEffect(() => {
    paymentService
      .getConfig()
      .then((cfg) => setPaynowConfigured(!!cfg.configured))
      .catch(() => setPaynowConfigured(false));
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const subtotal = getCartTotal();
  const shippingCost =
    shippingChoice === 'standard' ? (subtotal >= SHIP_OPTIONS.standard.freeOver ? 0 : SHIP_OPTIONS.standard.fallback) : SHIP_OPTIONS.express.price;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + shippingCost + tax;

  const validateStep = () => {
    if (step === 1) {
      if (!shippingAddress.full_name.trim() || !shippingAddress.email.trim() || !shippingAddress.phone.trim()) {
        Alert.alert('Missing Information', 'Please fill in your name, email and phone');
        return false;
      }
      setStep(2);
      return false;
    }
    if (step === 2) {
      if (!shippingAddress.address.trim() || !shippingAddress.city.trim() || !shippingAddress.postal_code.trim()) {
        Alert.alert('Missing Information', 'Please fill in your street address, city and postal code');
        return false;
      }
      setStep(3);
      return false;
    }
    return true;
  };

  const pickIdImage = async () => {
    try {
      const ImagePicker = require('expo-image-picker');
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission needed', 'Please allow photo access to upload your ID.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
      });
      if (!result.canceled && result.assets?.length) {
        setIdImage(result.assets[0].uri);
      }
    } catch (e) {
      Alert.alert('Error', 'Could not open the photo picker.');
    }
  };

  const startPaynowPolling = (paymentId) => {
    if (pollRef.current) clearInterval(pollRef.current);
    let attempts = 0;
    pollRef.current = setInterval(async () => {
      attempts += 1;
      try {
        const result = await paymentService.getPaynowStatus(paymentId);
        if (result.status === 'paid' || result.status === 'failed') {
          clearInterval(pollRef.current);
          pollRef.current = null;
          setPaynowStatus(result.status);
          if (result.status === 'paid') {
            clearCart();
            Alert.alert('Payment successful', `Order ${result.order_number} has been paid. Thank you!`, [
              { text: 'View Orders', onPress: () => navigation.navigate('OrdersTab') },
            ]);
          }
        }
      } catch (e) {
        // transient poll errors are non-fatal
      }
      if (attempts >= 120) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    }, 5000);
  };

  const handlePlaceOrder = async () => {
    if (!cartItems.length) {
      Alert.alert('Empty Cart', 'Your cart is empty.');
      return;
    }
    if (paymentMethod === 'cod' && !idImage) {
      Alert.alert('ID Required', 'Please upload a photo of your ID card for cash on delivery verification.');
      return;
    }

    setIsProcessing(true);
    try {
      const order = await orderService.createOrder({
        cart: cartItems,
        user,
        shipping: {
          customer_name: shippingAddress.full_name,
          email: shippingAddress.email,
          phone: shippingAddress.phone,
          address: shippingAddress.address,
          address2: shippingAddress.address2,
          city: shippingAddress.city,
          state: shippingAddress.province,
          zip_code: shippingAddress.postal_code,
          subtotal,
          shipping_cost: shippingCost,
          tax,
          total,
          note: notes,
        },
        paymentMethod,
        idImageUri: paymentMethod === 'cod' ? idImage : null,
      });

      if (paymentMethod === 'cod') {
        clearCart();
        Alert.alert('Order Placed!', `Your order ${order.order_number || ''} has been placed. Have your ID ready on delivery.`, [
          { text: 'View Orders', onPress: () => navigation.navigate('OrdersTab') },
        ]);
        return;
      }

      // Paynow mobile money flow
      const methodKey = paymentMethod.replace('paynow_', '');
      const initiation = await paymentService.initiatePaynow({
        orderNumber: order.order_number,
        method: methodKey,
        phone: shippingAddress.phone,
      });
      setPaynowStatus('sent');
      setPaynowInstructions(initiation.instructions || 'Check your phone and approve the payment prompt.');
      startPaynowPolling(initiation.payment_id);
    } catch (error) {
      Alert.alert('Order Failed', error.response?.data?.detail || 'Failed to place order');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!cartItems.length && paynowStatus !== 'sent') {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
        <Icon name="basket-outline" size={64} color={colors.textMuted} />
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Your cart is empty</Text>
        <TouchableOpacity
          style={[styles.emptyButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.emptyButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const step1Complete = step > 1;
  const step2Complete = step > 2;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingHorizontal: responsive.padding.lg,
            paddingTop: responsive.padding.lg,
            paddingBottom: responsive.padding.md,
          },
        ]}
      >
        <TouchableOpacity onPress={() => (step > 1 ? setStep(step - 1) : navigation.goBack())} style={styles.backButton}>
          <Icon name="arrow-back" size={responsive.icon.md} color={colors.textPrimary} />
        </TouchableOpacity>
        <Image source={logoImage} style={[styles.headerLogo, { height: responsive.getResponsiveDimension(30, 35, 40) }]} resizeMode="contain" />
        <Text style={[styles.title, { color: colors.textPrimary, fontSize: responsive.fontSize.xl }]}>Checkout</Text>
      </View>

      {/* Step indicator — same 3 steps as the web checkout */}
      <View style={[styles.stepsRow, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}>
        {[
          { n: 1, label: 'Contact' },
          { n: 2, label: 'Shipping' },
          { n: 3, label: 'Payment' },
        ].map(({ n, label }) => (
          <View key={n} style={styles.stepItem}>
            <View
              style={[
                styles.stepCircle,
                {
                  backgroundColor: step === n ? colors.primary : step > n ? colors.success : colors.surfaceVariant,
                  borderColor: step === n ? colors.primary : colors.borderColor,
                },
              ]}
            >
              <Text style={[styles.stepCircleText, { color: step === n || step > n ? '#fff' : colors.textSecondary }]}>
                {step > n ? '✓' : String(n)}
              </Text>
            </View>
            <Text style={[styles.stepLabel, { color: step >= n ? colors.textPrimary : colors.textMuted }]}>{label}</Text>
          </View>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Step 1: Contact */}
        {step === 1 && (
          <View style={[styles.section, { padding: responsive.padding.lg, backgroundColor: colors.cardBg }]}>
            <View style={styles.sectionHeader}>
              <Icon name="person" size={responsive.icon.md} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontSize: responsive.fontSize.md }]}>Contact Information</Text>
            </View>
            <Text style={[styles.label, { color: colors.textSecondary, fontSize: responsive.fontSize.xs }]}>Full Name *</Text>
            <TextInput
              style={[styles.input, styles.inputTheme(colors)]}
              placeholder="John Doe"
              placeholderTextColor={colors.textMuted}
              value={shippingAddress.full_name}
              onChangeText={(text) => setShippingAddress({ ...shippingAddress, full_name: text })}
            />
            <Text style={[styles.label, { color: colors.textSecondary, fontSize: responsive.fontSize.xs }]}>Email *</Text>
            <TextInput
              style={[styles.input, styles.inputTheme(colors)]}
              placeholder="you@example.com"
              placeholderTextColor={colors.textMuted}
              value={shippingAddress.email}
              onChangeText={(text) => setShippingAddress({ ...shippingAddress, email: text })}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <Text style={[styles.label, { color: colors.textSecondary, fontSize: responsive.fontSize.xs }]}>Phone *</Text>
            <TextInput
              style={[styles.input, styles.inputTheme(colors)]}
              placeholder="+263 7X XXX XXXX"
              placeholderTextColor={colors.textMuted}
              value={shippingAddress.phone}
              onChangeText={(text) => setShippingAddress({ ...shippingAddress, phone: text })}
              keyboardType="phone-pad"
            />
            <TouchableOpacity style={[styles.stepButton, { backgroundColor: colors.primary }]} onPress={validateStep}>
              <Text style={styles.stepButtonText}>Continue to Shipping</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 2: Shipping */}
        {step === 2 && (
          <View style={[styles.section, { padding: responsive.padding.lg, backgroundColor: colors.cardBg }]}>
            <View style={styles.sectionHeader}>
              <Icon name="location" size={responsive.icon.md} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontSize: responsive.fontSize.md }]}>Shipping Address</Text>
            </View>
            <Text style={[styles.label, { color: colors.textSecondary, fontSize: responsive.fontSize.xs }]}>Street Address *</Text>
            <TextInput
              style={[styles.input, styles.inputTheme(colors)]}
              placeholder="123 Main Street"
              placeholderTextColor={colors.textMuted}
              value={shippingAddress.address}
              onChangeText={(text) => setShippingAddress({ ...shippingAddress, address: text })}
            />
            <Text style={[styles.label, { color: colors.textSecondary, fontSize: responsive.fontSize.xs }]}>Apartment, suite, etc.</Text>
            <TextInput
              style={[styles.input, styles.inputTheme(colors)]}
              placeholder="Apt 4B"
              placeholderTextColor={colors.textMuted}
              value={shippingAddress.address2}
              onChangeText={(text) => setShippingAddress({ ...shippingAddress, address2: text })}
            />
            <View style={styles.formRow}>
              <View style={styles.halfInput}>
                <Text style={[styles.label, { color: colors.textSecondary, fontSize: responsive.fontSize.xs }]}>City *</Text>
                <TextInput
                  style={[styles.input, styles.inputTheme(colors)]}
                  placeholder="Harare"
                  placeholderTextColor={colors.textMuted}
                  value={shippingAddress.city}
                  onChangeText={(text) => setShippingAddress({ ...shippingAddress, city: text })}
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={[styles.label, { color: colors.textSecondary, fontSize: responsive.fontSize.xs }]}>Province</Text>
                <TextInput
                  style={[styles.input, styles.inputTheme(colors)]}
                  placeholder="Harare"
                  placeholderTextColor={colors.textMuted}
                  value={shippingAddress.province}
                  onChangeText={(text) => setShippingAddress({ ...shippingAddress, province: text })}
                />
              </View>
            </View>
            <Text style={[styles.label, { color: colors.textSecondary, fontSize: responsive.fontSize.xs }]}>Postal Code *</Text>
            <TextInput
              style={[styles.input, styles.inputTheme(colors)]}
              placeholder="00263"
              placeholderTextColor={colors.textMuted}
              value={shippingAddress.postal_code}
              onChangeText={(text) => setShippingAddress({ ...shippingAddress, postal_code: text })}
            />
            <Text style={[styles.label, { color: colors.textSecondary, fontSize: responsive.fontSize.xs }]}>Delivery Speed</Text>
            {Object.entries(SHIP_OPTIONS).map(([key, opt]) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.paymentOption,
                  {
                    backgroundColor: shippingChoice === key ? `${colors.primary}15` : colors.secondary,
                    borderColor: shippingChoice === key ? colors.primary : colors.borderColor,
                    borderRadius: borderRadius.md,
                    padding: responsive.padding.md,
                  },
                ]}
                onPress={() => setShippingChoice(key)}
              >
                <View style={[styles.radioCircle, { borderColor: colors.primary }]}>
                  {shippingChoice === key && <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />}
                </View>
                <View style={styles.paymentInfo}>
                  <Text style={[styles.paymentTitle, { color: colors.textPrimary, fontSize: responsive.fontSize.sm }]}>{opt.name}</Text>
                  <Text style={[styles.paymentDescription, { color: colors.textSecondary, fontSize: responsive.fontSize.xs }]}>
                    {opt.desc} · {key === 'standard' && subtotal >= opt.freeOver ? 'FREE' : fmt(key === 'standard' ? opt.fallback : opt.price)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={[styles.stepButton, { backgroundColor: colors.primary }]} onPress={validateStep}>
              <Text style={styles.stepButtonText}>Continue to Payment</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 3: Payment */}
        {step === 3 && (
          <>
            <View style={[styles.section, { padding: responsive.padding.lg, backgroundColor: colors.cardBg }]}>
              <View style={styles.sectionHeader}>
                <Icon name="card" size={responsive.icon.md} color={colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontSize: responsive.fontSize.md }]}>Payment Method</Text>
              </View>

              {/* Cash on delivery */}
              <TouchableOpacity
                style={[
                  styles.paymentOption,
                  {
                    backgroundColor: paymentMethod === 'cod' ? `${colors.primary}15` : colors.secondary,
                    borderColor: paymentMethod === 'cod' ? colors.primary : colors.borderColor,
                    borderRadius: borderRadius.md,
                    padding: responsive.padding.md,
                  },
                ]}
                onPress={() => setPaymentMethod('cod')}
              >
                <View style={[styles.radioCircle, { borderColor: colors.primary }]}>
                  {paymentMethod === 'cod' && <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />}
                </View>
                <View style={styles.paymentInfo}>
                  <Text style={[styles.paymentTitle, { color: colors.textPrimary, fontSize: responsive.fontSize.sm }]}>Cash on Delivery</Text>
                  <Text style={[styles.paymentDescription, { color: colors.textSecondary, fontSize: responsive.fontSize.xs }]}>
                    Pay when you receive your order
                  </Text>
                </View>
              </TouchableOpacity>

              {/* ID upload for COD — same requirement as the web checkout */}
              {paymentMethod === 'cod' && (
                <View style={[styles.idSection, { backgroundColor: colors.surface, borderColor: colors.borderColor }]}>
                  <View style={styles.idHeader}>
                    <Icon name="id-card" size={18} color={colors.primary} />
                    <Text style={[styles.idTitle, { color: colors.textPrimary }]}>Identity Verification Required</Text>
                  </View>
                  <Text style={[styles.idText, { color: colors.textSecondary }]}>
                    For security purposes, please upload a clear photo of your ID card (National ID, Passport, or Driver's License) for cash on delivery orders.
                  </Text>
                  {idImage ? (
                    <View>
                      <Image source={{ uri: idImage }} style={styles.idPreview} resizeMode="cover" />
                      <TouchableOpacity style={[styles.removeIdButton, { backgroundColor: colors.error }]} onPress={() => setIdImage(null)}>
                        <Icon name="close" size={14} color="#fff" />
                        <Text style={styles.removeIdText}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity style={[styles.uploadButton, { backgroundColor: colors.primary }]} onPress={pickIdImage}>
                      <Icon name="cloud-upload-outline" size={18} color="#fff" />
                      <Text style={styles.uploadText}>Upload ID Card</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Paynow mobile money */}
              {PAYNOW_METHODS.map((m) => {
                const key = `paynow_${m.id}`;
                const selected = paymentMethod === key;
                return (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.paymentOption,
                      {
                        backgroundColor: selected ? `${colors.primary}15` : colors.secondary,
                        borderColor: selected ? colors.primary : colors.borderColor,
                        borderRadius: borderRadius.md,
                        padding: responsive.padding.md,
                        opacity: !paynowConfigured && !selected ? 0.8 : 1,
                      },
                    ]}
                    onPress={() => {
                      setPaymentMethod(key);
                      setPaynowMethod(m.id);
                    }}
                  >
                    <View style={[styles.radioCircle, { borderColor: colors.primary }]}>
                      {selected && <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />}
                    </View>
                    <Icon name={m.icon} size={20} color={colors.textSecondary} style={{ marginRight: 10 }} />
                    <View style={styles.paymentInfo}>
                      <Text style={[styles.paymentTitle, { color: colors.textPrimary, fontSize: responsive.fontSize.sm }]}>
                        {m.name}
                        {!paynowConfigured && ' (setup needed)'}
                      </Text>
                    <Text style={[styles.paymentDescription, { color: colors.textSecondary, fontSize: responsive.fontSize.xs }]}>{m.desc}</Text>
                  </View>                  </TouchableOpacity>
                );
              })}
              {!paynowConfigured && (
                <Text style={[styles.paynowWarn, { color: colors.warning }]}>
                  Paynow mobile money needs server configuration (PAYNOW_INTEGRATION_ID / KEY). Until then, use Cash on Delivery.
                </Text>
              )}
            </View>

            {/* Order summary */}
            <View style={[styles.section, { padding: responsive.padding.lg, backgroundColor: colors.cardBg, marginBottom: responsive.padding.xl }]}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontSize: responsive.fontSize.md }]}>Order Summary</Text>
              {cartItems.map((item) => (
                <View key={`${item.id}`} style={styles.summaryItem}>
                  <View style={styles.itemInfo}>
                    <Text style={[styles.itemName, { color: colors.textPrimary, fontSize: responsive.fontSize.sm }]} numberOfLines={2}>
                      {item.title || item.name}
                    </Text>
                    <Text style={[styles.itemQuantity, { color: colors.textSecondary, fontSize: responsive.fontSize.xs }]}>Qty: {item.quantity}</Text>
                  </View>
                  <Text style={[styles.itemTotal, { color: colors.textPrimary, fontSize: responsive.fontSize.sm }]}>
                    {fmt((item.sale_price ?? item.price) * item.quantity)}
                  </Text>
                </View>
              ))}
              <View style={[styles.divider, { borderBottomWidth: 1, borderBottomColor: colors.borderColor, marginVertical: responsive.padding.md }]} />
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary, fontSize: responsive.fontSize.sm }]}>Subtotal</Text>
                <Text style={[styles.summaryValue, { color: colors.textPrimary, fontSize: responsive.fontSize.sm }]}>{fmt(subtotal)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary, fontSize: responsive.fontSize.sm }]}>Shipping</Text>
                <Text style={[styles.summaryValue, { color: shippingCost === 0 ? colors.success : colors.textPrimary, fontSize: responsive.fontSize.sm }]}>
                  {shippingCost === 0 ? 'FREE' : fmt(shippingCost)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary, fontSize: responsive.fontSize.sm }]}>Tax (5%)</Text>
                <Text style={[styles.summaryValue, { color: colors.textPrimary, fontSize: responsive.fontSize.sm }]}>{fmt(tax)}</Text>
              </View>
              <View style={[styles.divider, { borderBottomWidth: 1, borderBottomColor: colors.borderColor, marginVertical: responsive.padding.md }]} />
              <View style={styles.summaryRow}>
                <Text style={[styles.totalLabel, { color: colors.textPrimary, fontSize: responsive.fontSize.md }]}>Total</Text>
                <Text style={[styles.totalValue, { color: colors.primary, fontSize: responsive.fontSize.lg }]}>{fmt(total)}</Text>
              </View>

              {paynowStatus === 'sent' && (
                <View style={[styles.paynowBox, { backgroundColor: colors.surface, borderColor: colors.borderColor }]}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={[styles.paynowBoxTitle, { color: colors.textPrimary }]}>Waiting for payment approval</Text>
                  <Text style={[styles.paynowBoxText, { color: colors.textSecondary }]}>{paynowInstructions}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.placeOrderButton, { backgroundColor: colors.primary, borderRadius: borderRadius.full, padding: responsive.padding.md, opacity: isProcessing ? 0.7 : 1 }]}
                onPress={handlePlaceOrder}
                disabled={isProcessing || paynowStatus === 'sent'}
              >
                <Text style={[styles.placeOrderButtonText, { fontSize: responsive.fontSize.sm }]}>
                  {isProcessing
                    ? 'Processing...'
                    : paynowStatus === 'sent'
                      ? 'Waiting for payment...'
                      : `Place Order - ${fmt(total)}`}
                </Text>
              </TouchableOpacity>
              <TextInput
                style={[styles.textArea, styles.inputTheme(colors)]}
                placeholder="Order notes (optional)..."
                placeholderTextColor={colors.textMuted}
                value={notes}
                onChangeText={setNotes}
                multiline
              />
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e4e7ec',
    gap: 12,
  },
  backButton: { padding: 8 },
  headerLogo: { width: 80, height: 30 },
  title: { fontSize: 24, fontWeight: '700' },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  stepItem: { alignItems: 'center' },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleText: { fontSize: 13, fontWeight: '700' },
  stepLabel: { fontSize: 11, marginTop: 4, fontWeight: '600' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  section: { marginBottom: 16, borderRadius: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginLeft: 12 },
  label: { fontSize: 12, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase' },
  input: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  inputTheme: (colors) => ({
    backgroundColor: colors.secondary,
    borderColor: colors.borderColor,
    color: colors.textPrimary,
  }),
  textArea: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginTop: 8,
    minHeight: 80,
  },
  formRow: { flexDirection: 'row', gap: 12 },
  halfInput: { flex: 1 },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1.5,
    marginBottom: 12,
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  radioDot: { width: 12, height: 12, borderRadius: 6 },
  paymentInfo: { flex: 1 },
  paymentTitle: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  paymentDescription: { fontSize: 13 },
  idSection: {
    marginTop: 4,
    marginBottom: 12,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  idHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  idTitle: { fontWeight: '700', fontSize: 14 },
  idText: { fontSize: 13, marginBottom: 10, lineHeight: 18 },
  idPreview: { width: '100%', height: 160, borderRadius: 8, marginBottom: 8 },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  uploadText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  removeIdButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 6,
  },
  removeIdText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  paynowWarn: { fontSize: 12, marginBottom: 12, lineHeight: 17 },
  summaryItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  itemInfo: { flex: 1, paddingRight: 8 },
  itemName: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  itemQuantity: { fontSize: 12 },
  itemTotal: { fontSize: 14, fontWeight: '700' },
  divider: { width: '100%' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 14 },
  summaryValue: { fontSize: 14, fontWeight: '600' },
  totalLabel: { fontSize: 16, fontWeight: '700' },
  totalValue: { fontSize: 20, fontWeight: '800' },
  paynowBox: {
    marginTop: 8,
    marginBottom: 12,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    gap: 6,
  },
  paynowBoxTitle: { fontWeight: '700', fontSize: 14 },
  paynowBoxText: { fontSize: 12, textAlign: 'center', lineHeight: 17 },
  stepButton: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 8,
  },
  stepButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  placeOrderButton: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  placeOrderButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyText: { marginTop: 12, fontSize: 16 },
  emptyButton: { marginTop: 20, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  emptyButtonText: { color: '#fff', fontWeight: '700' },
});

export default CheckoutScreen;
