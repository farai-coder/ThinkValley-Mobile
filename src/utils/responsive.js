import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Screen size categories
export const isSmallScreen = width < 360;
export const isMediumScreen = width >= 360 && width < 400;
export const isLargeScreen = width >= 400;

// Responsive font sizes
export const getResponsiveFontSize = (small, medium, large) => {
  if (isSmallScreen) return small;
  if (isMediumScreen) return medium;
  return large;
};

// Responsive padding/margins
export const getResponsivePadding = (small, medium, large) => {
  if (isSmallScreen) return small;
  if (isMediumScreen) return medium;
  return large;
};

// Responsive spacing
export const getResponsiveSpacing = (small, medium, large) => {
  if (isSmallScreen) return small;
  if (isMediumScreen) return medium;
  return large;
};

// Responsive dimensions (width/height)
export const getResponsiveDimension = (small, medium, large) => {
  if (isSmallScreen) return small;
  if (isMediumScreen) return medium;
  return large;
};

// Responsive icon sizes
export const getResponsiveIconSize = (small, medium, large) => {
  if (isSmallScreen) return small;
  if (isMediumScreen) return medium;
  return large;
};

// Responsive number of columns for grids
export const getResponsiveColumns = (small, medium, large) => {
  if (isSmallScreen) return small;
  if (isMediumScreen) return medium;
  return large;
};

// Responsive text lines (for truncation)
export const getResponsiveLines = (small, medium, large) => {
  if (isSmallScreen) return small;
  if (isMediumScreen) return medium;
  return large;
};

// Screen dimensions
export const screenWidth = width;
export const screenHeight = height;

// Aspect ratio helpers
export const isPortrait = height > width;
export const isLandscape = width > height;

// Common responsive values
export const responsive = {
  // Screen dimensions
  screenWidth: width,
  screenHeight: height,
  
  // Helper functions
  getResponsiveDimension: getResponsiveDimension,
  getResponsiveFontSize: getResponsiveFontSize,
  getResponsivePadding: getResponsivePadding,
  getResponsiveSpacing: getResponsiveSpacing,
  getResponsiveIconSize: getResponsiveIconSize,
  getResponsiveColumns: getResponsiveColumns,
  getResponsiveLines: getResponsiveLines,
  
  // Font sizes
  fontSize: {
    xs: getResponsiveFontSize(10, 11, 12),
    sm: getResponsiveFontSize(12, 13, 14),
    md: getResponsiveFontSize(14, 15, 16),
    lg: getResponsiveFontSize(16, 18, 20),
    xl: getResponsiveFontSize(20, 22, 24),
    xxl: getResponsiveFontSize(24, 28, 32),
  },
  // Padding
  padding: {
    xs: getResponsivePadding(4, 6, 8),
    sm: getResponsivePadding(8, 10, 12),
    md: getResponsivePadding(12, 14, 16),
    lg: getResponsivePadding(16, 20, 24),
    xl: getResponsivePadding(20, 24, 32),
  },
  // Margin
  margin: {
    xs: getResponsivePadding(4, 6, 8),
    sm: getResponsivePadding(8, 10, 12),
    md: getResponsivePadding(12, 14, 16),
    lg: getResponsivePadding(16, 20, 24),
    xl: getResponsivePadding(20, 24, 32),
  },
  // Icon sizes
  icon: {
    xs: getResponsiveIconSize(12, 14, 16),
    sm: getResponsiveIconSize(16, 18, 20),
    md: getResponsiveIconSize(20, 22, 24),
    lg: getResponsiveIconSize(24, 28, 32),
    xl: getResponsiveIconSize(32, 36, 40),
  },
  // Grid columns
  columns: {
    products: getResponsiveColumns(2, 2, 3),
    categories: getResponsiveColumns(3, 4, 5),
    collections: getResponsiveColumns(1, 1, 2),
  },
  // Text lines
  lines: {
    short: getResponsiveLines(1, 1, 2),
    medium: getResponsiveLines(2, 2, 3),
    long: getResponsiveLines(3, 4, 5),
  },
};

export default responsive;
