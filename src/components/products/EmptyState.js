import React, { memo } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import Icon from 'react-native-vector-icons/Ionicons';

const EmptyState = memo(({ 
  icon = 'cube-outline', 
  title = 'No Products Found', 
  message = 'We couldn\'t find any products matching your search.',
  actionLabel = 'Browse All Products',
  onAction 
}) => {
  const { colors, spacing, borderRadius, typography, shadows, touchTarget } = useTheme();

  return (
    <View style={[styles.container, { padding: spacing.xxl }]}>
      <View style={[
        styles.illustration,
        { 
          backgroundColor: colors.surface,
          borderRadius: borderRadius.xxl,
          padding: spacing.xl,
          ...shadows.md,
        }
      ]}>
        <Icon 
          name={icon} 
          size={80} 
          color={colors.textHint} 
        />
      </View>

      <Text style={[styles.title, { color: colors.textPrimary, ...typography.h4 }]}>
        {title}
      </Text>

      <Text style={[styles.message, { color: colors.textSecondary, ...typography.bodySmall, textAlign: 'center' }]}>
        {message}
      </Text>

      {onAction && (
        <TouchableOpacity
          onPress={onAction}
          style={[
            styles.actionButton,
            { 
              backgroundColor: colors.primary,
              paddingHorizontal: spacing.xl,
              paddingVertical: spacing.md,
              borderRadius: borderRadius.full,
              minHeight: touchTarget.minimum,
              ...shadows.sm,
            }
          ]}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
        >
          <Text style={[styles.actionText, { color: colors.onPrimary, ...typography.button }]}>
            {actionLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
});

EmptyState.displayName = 'EmptyState';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  illustration: {
    marginBottom: 8,
  },
  title: {
    fontWeight: '700',
    textAlign: 'center',
  },
  message: {
    maxWidth: 280,
    lineHeight: 22,
  },
  actionButton: {
    marginTop: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    fontWeight: '700',
  },
});

export default EmptyState;
