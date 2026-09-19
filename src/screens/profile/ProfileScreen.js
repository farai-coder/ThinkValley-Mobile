import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  RefreshControl,
  TextInput,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import logoImage from '../../../assets/logo.png';
import responsive from '../../utils/responsive';

const ProfileScreen = () => {
  const { colors, spacing, borderRadius, typography } = useTheme();
  const { user, logout, updateProfile, getProfile } = useAuth();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    refreshProfile();
  }, []);

  const refreshProfile = async () => {
    try {
      setRefreshing(true);
      await getProfile();
    } catch (error) {
      console.error('Failed to refresh profile:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          onPress: async () => {
            try {
              await logout();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Auth' }],
              });
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const MenuItem = ({ icon, title, subtitle, onPress, showArrow = true, searchableText = '' }) => {
    const matchesSearch = searchQuery === '' || 
      searchableText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      title.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return null;
    
    return (
      <TouchableOpacity
        style={[styles.menuItem, { backgroundColor: colors.cardBg, borderRadius: borderRadius.md, padding: responsive.padding.md }]}
        onPress={onPress}
      >
        <View style={[styles.menuIcon, { backgroundColor: `${colors.primary}20` }]}>
          <Icon name={icon} size={responsive.icon.md} color={colors.primary} />
        </View>
        <View style={styles.menuContent}>
          <Text style={[styles.menuTitle, { color: colors.textPrimary, fontSize: responsive.fontSize.sm }]} numberOfLines={responsive.lines.short}>{title}</Text>
          {subtitle && <Text style={[styles.menuSubtitle, { color: colors.textSecondary, fontSize: responsive.fontSize.xs }]} numberOfLines={responsive.lines.short}>{subtitle}</Text>}
        </View>
        {showArrow && <Icon name="chevron-forward" size={responsive.icon.md} color={colors.textMuted} />}
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refreshProfile} />
      }
    >
      <View style={[styles.profileSection, { 
        backgroundColor: colors.cardBg, 
        paddingHorizontal: responsive.padding.lg, 
        paddingVertical: responsive.padding.xl, 
        marginTop: responsive.padding.md 
      }]}>
        <View style={styles.profileInfo}>
          <View style={[styles.avatar, { 
            backgroundColor: colors.primary,
            width: responsive.getResponsiveDimension(50, 60, 70),
            height: responsive.getResponsiveDimension(50, 60, 70)
          }]}>
            <Text style={[styles.avatarText, { color: '#fff', fontSize: responsive.fontSize.xl }]}>
              {user?.first_name?.[0] || user?.username?.[0] || 'U'}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: colors.textPrimary, fontSize: responsive.fontSize.lg }]} numberOfLines={responsive.lines.short}>
              {user?.first_name && user?.last_name
                ? `${user.first_name} ${user.last_name}`
                : user?.username || 'User'}
            </Text>
            <Text style={[styles.userEmail, { color: colors.textSecondary, fontSize: responsive.fontSize.sm }]} numberOfLines={responsive.lines.short}>
              {user?.email || 'user@example.com'}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => setShowSearch(!showSearch)} style={styles.searchButton}>
          <Icon name={showSearch ? "close" : "search"} size={responsive.icon.md} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {showSearch && (
        <View style={[styles.searchBarContainer, { 
          backgroundColor: colors.cardBg, 
          paddingHorizontal: responsive.padding.lg, 
          paddingVertical: responsive.padding.md, 
          marginTop: responsive.padding.md 
        }]}>
          <View style={[styles.searchInputWrapper, { backgroundColor: colors.background, borderColor: colors.borderColor }]}>
            <Icon name="search" size={responsive.icon.sm} color={colors.textMuted} style={{ marginRight: 8 }} />
            <TextInput
              style={[styles.searchInput, { color: colors.textPrimary, fontSize: responsive.fontSize.sm }]}
              placeholder="Search settings"
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus={true}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Icon name="close-circle" size={responsive.icon.sm} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      <View style={[styles.menuSection, { padding: responsive.padding.lg, marginTop: responsive.padding.md }]}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary, fontSize: responsive.fontSize.xs }]}>Account</Text>
        
        <MenuItem
          icon="person-outline"
          title="Edit Profile"
          subtitle="Update your personal information"
          searchableText="edit profile personal information account settings"
          onPress={() => Alert.alert('Edit Profile', 'Profile editing will be implemented')}
        />
        
        <MenuItem
          icon="location-outline"
          title="Shipping Addresses"
          subtitle="Manage your delivery addresses"
          searchableText="shipping addresses delivery location account"
          onPress={() => Alert.alert('Addresses', 'Address management will be implemented')}
        />
        
        <MenuItem
          icon="card-outline"
          title="Payment Methods"
          subtitle="Manage payment options"
          searchableText="payment methods credit card billing account"
          onPress={() => Alert.alert('Payment Methods', 'Payment management will be implemented')}
        />
      </View>

      <View style={[styles.menuSection, { padding: responsive.padding.lg }]}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary, fontSize: responsive.fontSize.xs }]}>Orders</Text>
        
        <MenuItem
          icon="list-outline"
          title="My Orders"
          subtitle="View order history and status"
          searchableText="orders history status purchase"
          onPress={() => navigation.navigate('Orders')}
        />
        
        <MenuItem
          icon="receipt-outline"
          title="Order Tracking"
          subtitle="Track your deliveries"
          searchableText="order tracking delivery shipping status"
          onPress={() => navigation.navigate('Orders')}
        />
      </View>

      <View style={[styles.menuSection, { padding: responsive.padding.lg }]}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary, fontSize: responsive.fontSize.xs }]}>Settings</Text>
        
        <MenuItem
          icon="notifications-outline"
          title="Notifications"
          subtitle="Manage push notifications"
          searchableText="notifications push alerts settings"
          onPress={() => Alert.alert('Notifications', 'Notification settings will be implemented')}
        />
        
        <MenuItem
          icon="help-circle-outline"
          title="Help & Support"
          subtitle="FAQs and customer support"
          searchableText="help support faq customer service"
          onPress={() => Alert.alert('Help', 'Help center will be implemented')}
        />
        
        <MenuItem
          icon="document-text-outline"
          title="Terms & Privacy"
          subtitle="Terms of service and privacy policy"
          searchableText="terms privacy policy legal"
          onPress={() => Alert.alert('Terms', 'Terms and privacy will be implemented')}
        />
      </View>

      <View style={[styles.menuSection, { padding: spacing.lg, marginBottom: spacing.xl }]}>
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: colors.error, borderRadius: borderRadius.md }]}
          onPress={handleLogout}
        >
          <Icon name="log-out-outline" size={24} color="#fff" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileSection: {
    borderRadius: 12,
    position: 'relative',
  },
  searchButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
  },
  searchBarContainer: {
    borderRadius: 12,
  },
  searchInputWrapper: {
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
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '800',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
  },
  menuSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset:{ width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginTop: 8,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
});

export default ProfileScreen;
