import React, { memo, useState } from 'react';
import { View, StyleSheet, Image, Animated, ActivityIndicator } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import Icon from 'react-native-vector-icons/Ionicons';

const ProductImage = memo(({ imageUrl, aspectRatio = 0.72, error }) => {
  const { colors, spacing, borderRadius, animation } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  const handleLoadStart = () => {
    setIsLoading(true);
    setHasError(false);
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: animation.duration.normal,
      useNativeDriver: true,
    }).start();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  if (hasError || !imageUrl) {
    return (
      <View 
        style={[
          styles.placeholder,
          { 
            backgroundColor: colors.surfaceVariant,
            aspectRatio: aspectRatio,
            borderTopLeftRadius: borderRadius.md,
            borderTopRightRadius: borderRadius.md,
          }
        ]}
        accessibilityRole="image"
        accessibilityLabel="Product image not available"
      >
        <Icon 
          name="image-outline" 
          size={48} 
          color={colors.textHint} 
        />
      </View>
    );
  }

  return (
    <View style={{ aspectRatio: aspectRatio }}>
      {isLoading && (
        <View style={[
          styles.loadingContainer,
          { 
            backgroundColor: colors.surfaceVariant,
            borderTopLeftRadius: borderRadius.md,
            borderTopRightRadius: borderRadius.md,
          }
        ]}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      )}
      <Animated.Image
        source={{ uri: imageUrl }}
        style={[
          styles.image,
          {
            opacity: fadeAnim,
            borderTopLeftRadius: borderRadius.md,
            borderTopRightRadius: borderRadius.md,
          }
        ]}
        resizeMode="cover"
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        accessible={true}
        accessibilityLabel={`Product image`}
      />
    </View>
  );
});

ProductImage.displayName = 'ProductImage';

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProductImage;
