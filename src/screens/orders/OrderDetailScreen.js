import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
  Platform,
  Share,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { orderService } from '../../services/orderService';
import Icon from 'react-native-vector-icons/Ionicons';
import logoImage from '../../../assets/logo.png';
import QRCode from 'react-native-qrcode-svg';

const OrderDetailScreen = () => {
  const { colors, spacing, borderRadius, typography } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { orderId } = route.params;
  const { width, height } = Dimensions.get('window');

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Responsive sizing based on screen width
  const isSmallScreen = width < 360;
  const isMediumScreen = width >= 360 && width < 400;
  const isLargeScreen = width >= 400;

  const getResponsiveFontSize = (small, medium, large) => {
    if (isSmallScreen) return small;
    if (isMediumScreen) return medium;
    return large;
  };

  const getResponsivePadding = (small, medium, large) => {
    if (isSmallScreen) return small;
    if (isMediumScreen) return medium;
    return large;
  };

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const data = await orderService.getOrder(orderId);
      setOrder(data);
    } catch (error) {
      console.error('Failed to load order:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return colors.warning;
      case 'processing':
        return colors.primary;
      case 'shipped':
        return '#0064d2';
      case 'delivered':
        return colors.success;
      case 'cancelled':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'time-outline';
      case 'processing':
        return 'sync-outline';
      case 'shipped':
        return 'car-outline';
      case 'delivered':
        return 'checkmark-circle-outline';
      case 'cancelled':
        return 'close-circle-outline';
      default:
        return 'help-circle-outline';
    }
  };

  const handleDownloadReceipt = () => {
    const receiptText = `
THINKVALLEY STORE - ORDER RECEIPT
================================
Order #: ${order.order_number || order.id}
Date: ${new Date(order.created_at).toLocaleDateString()}
Status: ${(order.status || 'Pending').toUpperCase()}

CUSTOMER INFORMATION
--------------------
Name: ${order.shipping_address?.full_name || 'N/A'}
Phone: ${order.shipping_address?.phone || 'N/A'}
Address: ${[order.shipping_address?.address, order.shipping_address?.city, order.shipping_address?.province].filter(Boolean).join(', ') || 'N/A'}

ORDER ITEMS
------------
${order.items?.map((item, index) => 
  `${index + 1}. ${item.product_name || item.title || `Product #${item.product_id}`}
   Qty: ${item.quantity || item.qty} | Price: $${Number(item.price).toFixed(2)} | Total: $${Number((item.price || 0) * (item.quantity || item.qty || 0)).toFixed(2)}`
).join('\n\n')}

ORDER SUMMARY
-------------
Subtotal: $${Number(order.subtotal || order.total || 0).toFixed(2)}
Shipping: FREE
TOTAL PAID: $${Number(order.total || 0).toFixed(2)}

Thank you for your business!
ThinkValley Store - Zimbabwe
WhatsApp: +263 778 040 088
    `.trim();

    Share.share({
      message: receiptText,
    }).catch((error) => {
      console.error('Share error:', error);
      Alert.alert('Error', 'Failed to share receipt');
    });
  };

  if (isLoading || !order) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.textSecondary }}>Loading order details...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderColor }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary, ...typography.h2 }]}>
          Order Receipt
        </Text>
        <TouchableOpacity onPress={handleDownloadReceipt} style={styles.downloadButton}>
          <Icon name="download-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={[styles.invoiceContainer, { 
        backgroundColor: '#fff', 
        marginHorizontal: getResponsivePadding(12, 16, 20), 
        marginTop: spacing.md, 
        marginBottom: spacing.xl, 
        padding: getResponsivePadding(12, 16, 20) 
      }]}>
        <View style={styles.invoiceHeader}>
          <View style={styles.invoiceLogoSection}>
            <Image source={logoImage} style={[styles.invoiceLogo, { 
              width: getResponsiveFontSize(36, 42, 48),
              height: getResponsiveFontSize(36, 42, 48)
            }]} resizeMode="contain" />
            <View style={styles.companyDetailsSection}>
              <Text style={[styles.companyDetailText, { color: '#64748b', fontSize: getResponsiveFontSize(9, 10, 11) }]}>Zimbabwe</Text>
              <Text style={[styles.companyDetailText, { color: '#64748b', fontSize: getResponsiveFontSize(9, 10, 11) }]}>WhatsApp: +263 778 040 088</Text>
              <Text style={[styles.companyDetailText, { color: '#64748b', fontSize: getResponsiveFontSize(9, 10, 11) }]}>thinkvalley.co.zw</Text>
            </View>
          </View>
          <View style={styles.invoiceMeta}>
            <Text style={[styles.invoiceTitle, { fontSize: getResponsiveFontSize(22, 25, 28) }]}>RECEIPT</Text>
            <Text style={[styles.invoiceMetaText, { color: '#1e293b', fontSize: getResponsiveFontSize(10, 11, 12) }]}>
              <Text style={styles.invoiceMetaLabel}>Order #:</Text> {order.order_number || order.id}
            </Text>
            <Text style={[styles.invoiceMetaText, { color: '#1e293b', fontSize: getResponsiveFontSize(10, 11, 12) }]}>
              <Text style={styles.invoiceMetaLabel}>Date:</Text> {new Date(order.created_at).toLocaleDateString()}
            </Text>
            <View style={[styles.invoiceStatusBadge, { backgroundColor: getStatusColor(order.status) }]}>
              <Text style={[styles.invoiceStatusText, { fontSize: getResponsiveFontSize(10, 11, 12) }]}>{(order.status || 'Pending').toUpperCase()}</Text>
            </View>
          </View>
        </View>
        <View style={styles.billToSection}>
          <Text style={[styles.billToLabel, { fontSize: getResponsiveFontSize(9, 10, 11) }]}>CUSTOMER</Text>
          {order.shipping_address && (
            <View style={styles.billToContent}>
              <Text style={[styles.billToName, { color: '#1e293b', fontSize: getResponsiveFontSize(11, 12, 13) }]}>
                {order.shipping_address.full_name}
              </Text>
              <Text style={[styles.billToText, { color: '#1e293b', fontSize: getResponsiveFontSize(11, 12, 13) }]}>
                {order.shipping_address.phone}
              </Text>
              <Text style={[styles.billToText, { color: '#1e293b', fontSize: getResponsiveFontSize(11, 12, 13) }]} numberOfLines={2}>
                {[order.shipping_address.address, order.shipping_address.city, order.shipping_address.province].filter(Boolean).join(', ')}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.tableCellSmall, { fontSize: getResponsiveFontSize(10, 11, 12) }]}>#</Text>
            <Text style={[styles.tableHeaderText, styles.tableCellProduct, { fontSize: getResponsiveFontSize(10, 11, 12) }]}>Product</Text>
            <Text style={[styles.tableHeaderText, styles.tableCellSmall, { fontSize: getResponsiveFontSize(10, 11, 12) }]}>Qty</Text>
            <Text style={[styles.tableHeaderText, styles.tableCellRight, { fontSize: getResponsiveFontSize(10, 11, 12) }]}>Price</Text>
            <Text style={[styles.tableHeaderText, styles.tableCellRight, { fontSize: getResponsiveFontSize(10, 11, 12) }]}>Total</Text>
          </View>
          {order.items?.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCellText, styles.tableCellSmall, { fontSize: getResponsiveFontSize(10, 11, 12) }]}>{index + 1}</Text>
              <View style={[styles.tableCellProduct, { flex: 1 }]}>
                <Text style={[styles.tableCellText, { color: '#1e293b', fontSize: getResponsiveFontSize(10, 11, 12) }]} numberOfLines={2}>
                  {item.product_name || item.title || `Product #${item.product_id}`}
                </Text>
              </View>
              <Text style={[styles.tableCellText, styles.tableCellSmall, { fontSize: getResponsiveFontSize(10, 11, 12) }]}>{item.quantity || item.qty}</Text>
              <Text style={[styles.tableCellText, styles.tableCellRight, { fontSize: getResponsiveFontSize(10, 11, 12) }]}>
                ${Number(item.price).toFixed(2)}
              </Text>
              <Text style={[styles.tableCellText, styles.tableCellRight, styles.tableCellBold, { fontSize: getResponsiveFontSize(10, 11, 12) }]}>
                ${Number((item.price || 0) * (item.quantity || item.qty || 0)).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>
        <View style={styles.totalsContainer}>
          <View style={styles.totalsRow}>
            <Text style={[styles.totalsLabel, { color: '#64748b', fontSize: getResponsiveFontSize(11, 12, 13) }]}>Subtotal</Text>
            <Text style={[styles.totalsValue, { color: '#1e293b', fontSize: getResponsiveFontSize(11, 12, 13) }]}>
              ${Number(order.subtotal || order.total || 0).toFixed(2)}
            </Text>
          </View>
          <View style={[styles.totalsRow, styles.totalsGrandRow]}>
            <Text style={[styles.totalsLabel, styles.totalsGrandLabel, { color: '#000', fontSize: getResponsiveFontSize(11, 12, 13) }]}>TOTAL PAID</Text>
            <Text style={[styles.totalsValue, styles.totalsGrandValue, { color: '#000', fontSize: getResponsiveFontSize(14, 15, 16) }]}>
              ${Number(order.total || 0).toFixed(2)}
            </Text>
          </View>
        </View>
        <View style={styles.invoiceFooter}>
          <View style={styles.footerTextSection}>
            <Text style={[styles.footerMainText, { color: '#1e293b', fontSize: getResponsiveFontSize(10, 11, 12) }]}>Thank you for your business.</Text>
            <Text style={[styles.footerSubText, { color: '#94a3b8', fontSize: getResponsiveFontSize(10, 11, 12) }]}>Scan QR to verify authenticity</Text>
          </View>
          <View style={styles.qrCodeContainer}>
            <QRCode
              value={`Order #${order.order_number || order.id}`}
              size={getResponsiveFontSize(72, 84, 96)}
              color="#000"
              backgroundColor="#fff"
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#e4e7ec',
  },
  backButton: {
    padding: 8,
  },
  downloadButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  invoiceContainer: {
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 3,
    borderBottomColor: '#000',
    paddingBottom: 16,
    marginBottom: 18,
  },
  invoiceLogoSection: {
    flexDirection: 'column',
    gap: 8,
  },
  invoiceLogo: {
    width: 48,
    height: 48,
  },
  companyDetailsSection: {
    marginLeft: 0,
  },
  companyDetailText: {
    fontSize: 11,
    marginVertical: 2,
  },
  invoiceMeta: {
    alignItems: 'flex-end',
  },
  invoiceTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#000',
    letterSpacing: 1,
    marginBottom: 4,
  },
  invoiceMetaText: {
    fontSize: 12,
    marginVertical: 2,
  },
  invoiceMetaLabel: {
    fontWeight: '700',
  },
  invoiceStatusBadge: {
    marginTop: 6,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 6,
  },
  invoiceStatusText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  billToSection: {
    marginTop: 18,
  },
  billToLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  billToContent: {
    marginTop: 4,
  },
  billToName: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  billToText: {
    fontSize: 13,
    marginVertical: 2,
  },
  tableContainer: {
    marginTop: 18,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#000',
    paddingVertical: 9,
  },
  tableHeaderText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  tableCellSmall: {
    width: 30,
    textAlign: 'center',
  },
  tableCellProduct: {
    flex: 1,
    paddingHorizontal: 4,
  },
  tableCellRight: {
    width: 50,
    textAlign: 'right',
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tableCellText: {
    fontSize: 12,
  },
  tableCellBold: {
    fontWeight: '600',
  },
  totalsContainer: {
    marginTop: 14,
    alignItems: 'flex-end',
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 4,
  },
  totalsLabel: {
    fontSize: 13,
    paddingRight: 12,
  },
  totalsValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  totalsGrandRow: {
    borderTopWidth: 2,
    borderTopColor: '#000',
    marginTop: 4,
    paddingTop: 8,
    paddingBottom: 8,
  },
  totalsGrandLabel: {
    fontWeight: '800',
  },
  totalsGrandValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  invoiceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 16,
  },
  footerTextSection: {
    flex: 1,
    maxWidth: '60%',
  },
  footerMainText: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  footerSubText: {
    fontSize: 11,
  },
  qrCodeContainer: {
    width: 96,
    height: 96,
    backgroundColor: '#fff',
  },
});

export default OrderDetailScreen;
