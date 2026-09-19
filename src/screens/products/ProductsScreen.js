import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { View, StyleSheet, FlatList, Animated, Dimensions } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useCart } from '../../context/CartContext';
import { categoryService } from '../../services/categoryService';
import { productService } from '../../services/productService';
import ProductsHeader from '../../components/products/ProductsHeader';
import CategoryList from '../../components/products/CategoryList';
import ProductCard from '../../components/products/ProductCard';
import LoadingGrid from '../../components/products/LoadingGrid';
import EmptyState from '../../components/products/EmptyState';
import SearchScreen from '../../components/products/SearchScreen';

const { width: screenWidth } = Dimensions.get('window');

const ProductsScreen = () => {
  const { colors, spacing, grid, breakpoints } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { category: categoryId } = route.params || {};
  const { getCartCount } = useCart();
  
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(categoryId || null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const numColumns = useMemo(() => {
    if (screenWidth >= breakpoints.xl) return grid.columns.xl;
    if (screenWidth >= breakpoints.lg) return grid.columns.lg;
    if (screenWidth >= breakpoints.md) return grid.columns.md;
    return grid.columns.sm;
  }, [screenWidth, breakpoints, grid]);

  const loadData = useCallback(async () => {
    try {
      const [categoriesData, productsData] = await Promise.all([
        categoryService.getCategories(),
        productService.getProducts(selectedCategory ? { category: selectedCategory } : {}),
      ]);
      setCategories(categoriesData.results || categoriesData);
      setProducts(productsData.results || productsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCategorySelect = useCallback((categoryId) => {
    setSelectedCategory(categoryId);
  }, []);

  const handleSearch = useCallback(async (query) => {
    try {
      const results = await productService.searchProducts(query);
      return results;
    } catch (error) {
      console.error('Search failed:', error);
      return { results: [] };
    }
  }, []);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleSearchPress = useCallback(() => {
    setShowSearch(true);
  }, []);

  const handleCartPress = useCallback(() => {
    navigation.navigate('CartStack');
  }, [navigation]);

  const handleSearchClose = useCallback(() => {
    setShowSearch(false);
  }, []);

  const handleRefresh = useCallback(() => {
    loadData();
  }, [loadData]);

  const handleBrowseAll = useCallback(() => {
    setSelectedCategory(null);
  }, []);

  const renderProductItem = useCallback(({ item }) => (
    <ProductCard product={item} />
  ), []);

  const keyExtractor = useCallback((item) => item.id.toString(), []);

  const ListEmptyComponent = useMemo(() => (
    <EmptyState
      icon="cube-outline"
      title="No Products Found"
      message="We couldn't find any products in this category."
      actionLabel="Browse All Products"
      onAction={handleBrowseAll}
    />
  ), [handleBrowseAll]);

  return (
    <>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Animated.ScrollView
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
        >
          <ProductsHeader
            onBack={handleBack}
            onSearch={handleSearchPress}
            onCart={handleCartPress}
            cartCount={getCartCount()}
            scrollY={scrollY}
          />

          <CategoryList
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategorySelect}
          />

          {isLoading ? (
            <LoadingGrid columns={numColumns} rows={4} />
          ) : (
            <FlatList
              data={products}
              renderItem={renderProductItem}
              keyExtractor={keyExtractor}
              numColumns={numColumns}
              contentContainerStyle={[styles.productsList, { paddingHorizontal: spacing.lg, paddingVertical: spacing.md }]}
              columnWrapperStyle={styles.productRow}
              onRefresh={handleRefresh}
              refreshing={isLoading}
              ListEmptyComponent={ListEmptyComponent}
              initialNumToRender={8}
              maxToRenderPerBatch={10}
              windowSize={5}
              removeClippedSubviews={true}
              scrollEnabled={false}
            />
          )}
        </Animated.ScrollView>
      </View>

      <SearchScreen
        visible={showSearch}
        onClose={handleSearchClose}
        onSearch={handleSearch}
        recentSearches={['iPhone', 'Samsung', 'Laptop', 'Headphones']}
        popularSearches={['Electronics', 'Fashion', 'Home', 'Sports', 'Beauty']}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  productsList: {
    flexGrow: 1,
  },
  productRow: {
    justifyContent: 'space-between',
  },
});

export default ProductsScreen;
