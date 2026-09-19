import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Image,
  TextInput,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { orderService } from '../../services/orderService';
import Icon from 'react-native-vector-icons/Ionicons';
import logoImage from '../../../assets/logo.png';

const OrdersScreen = () => {
  const { colors, spacing, borderRadius, typography } = useTheme();
  const navigation = useNavigation();
  
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = orders.filter(order => {
    const query = searchQuery.toLowerCase();
    const orderNumber = (order.order_number || order.id || '').toString().toLowerCase();
    const status = (order.status || '').toLowerCase();
    return orderNumber.includes(query) || status.includes(query);
  });

  const loadOrders = async () => {
    try {
      const data = await orderService.getOrders();
      setOrders(data.results || data);
    } catch (error) {
      console.error('Failed to load orders:', error);
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

  const OrderCard = ({ order }) => (
    <TouchableOpacity
      style={[styles.orderCard, { backgroundColor: colors.cardBg, borderRadius: borderRadius.md }]}
      onPress={() => navigation.navigate('OrderDetail', { orderId: order.order_number || order.id })}
      activeOpacity={0.7}
    >
      <View style={styles.orderHeader}>
        <View>
          <Text style={[styles.orderNumber, { color: colors.textPrimary }]}>
            Order #{order.order_number || order.id}
          </Text>
          <Text style={[styles.orderDate, { color: colors.textSecondary }]}>
            {new Date(order.created_at).toLocaleDateString()}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(order.status)}20` }]}>
          <Icon name={getStatusIcon(order.status)} size={16} color={getStatusColor(order.status)} />
          <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
            {order.status || 'Pending'}
          </Text>
        </View>
      </View>

      <View style={styles.orderItems}>
        <Text style={[styles.itemsLabel, { color: colors.textSecondary }]}>
          {order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'}
        </Text>
        <Text style={[styles.orderTotal, { color: colors.textPrimary }]}>
          ${Number(order.total)?.toFixed(2) || '0.00'}
        </Text>
      </View>

      <View style={[styles.divider, { borderBottomWidth: 1, borderBottomColor: colors.borderColor }]} />

      <View style={styles.viewOrderSection}>
        <Icon name="eye-outline" size={16} color={colors.primary} />
        <Text style={[styles.viewOrderText, { color: colors.primary }]}>Click to view order</Text>
        <Icon name="chevron-forward" size={16} color={colors.primary} />
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.textSecondary }}>Loading orders...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.staticTopBar, { backgroundColor: colors.cardBg, paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderColor }]}>
        <View style={[styles.searchBar, { backgroundColor: colors.background, borderColor: colors.borderColor }]}>
          <Icon name="search" size={20} color={colors.textMuted} style={{ marginRight: 8 }} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search orders..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close-circle" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={loadOrders} />
        }
      >
        <View style={[styles.header, { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.md }]}>
          <Text style={[styles.title, { color: colors.textPrimary, ...typography.h2 }]}>
            My Orders
          </Text>
        </View>

        <View style={[styles.ordersList, { paddingHorizontal: spacing.lg }]}>
          {filteredOrders.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="cube-outline" size={80} color={colors.textMuted} />
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                {searchQuery ? 'No orders found' : 'No orders yet'}
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                {searchQuery ? 'Try a different search term' : 'Start shopping to see your orders here'}
              </Text>
              {!searchQuery && (
                <TouchableOpacity
                  style={[styles.shopButton, { backgroundColor: colors.primary, borderRadius: borderRadius.full }]}
                  onPress={() => navigation.navigate('StoreStack')}
                >
                  <Text style={styles.shopButtonText}>Start Shopping</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <>
              {filteredOrders.map((order) => <OrderCard key={order.id} order={order} />)}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  staticTopBar: {
    position: 'relative',
    zIndex: 10,
  },
  header: {
    paddingHorizontal: 0,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 24,
    paddingHorizontal: 16,
    borderWidth: 1.5,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  ordersList: {
    paddingVertical: 16,
  },
  orderCard: {
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset:{ width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  orderItems: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemsLabel: {
    fontSize: 14,
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: '700',
  },
  divider: {
    width: '100%',
    marginBottom: 12,
  },
  viewOrderSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  viewOrderText: {
    fontSize: 12,
    fontWeight: '600',
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
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
});

export default OrdersScreen;
