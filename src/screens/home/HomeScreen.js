import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  TextInput,
  Modal,
  Dimensions,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Video } from 'expo-av';
import logo from '../../../assets/logo.png';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { categoryService } from '../../services/categoryService';
import { productService } from '../../services/productService';
import { collectionService } from '../../services/collectionService';
import Icon from 'react-native-vector-icons/Ionicons';
import SkeletonSection from '../../components/SkeletonSection';
import SkeletonCard from '../../components/SkeletonCard';
import responsive from '../../utils/responsive';

const ProductCard = React.memo(({ product, navigation, colors = {}, borderRadius = {}, responsive = {} }) => {
  const imageUrl = product.display_image || product.image_url || product.image;
  return (
    <TouchableOpacity
      style={[styles.productCard, { 
        backgroundColor: colors.cardBg || '#fff', 
        borderRadius: borderRadius.md || 10,
        width: (responsive.screenWidth || 375 - (responsive.padding.lg || 16) * 2 - (responsive.padding.sm || 8)) / (responsive.columns?.products || 2) - (responsive.padding.sm || 8)
      }]}
      onPress={() => navigation.navigate('ProductDetail', { productId: product.id })}
    >
      <Image
        source={{ uri: imageUrl }}
        style={[styles.productImage, { height: responsive.getResponsiveDimension ? responsive.getResponsiveDimension(120, 140, 160) : 140 }]}
        resizeMode="cover"
      />
      <View style={[styles.productInfo, { padding: responsive.padding.sm || 8 }]}>
        <Text style={[styles.productName, { color: colors.textPrimary || '#000', fontSize: responsive.fontSize.sm || 14 }]} numberOfLines={responsive.lines?.short || 1}>
          {product.name}
        </Text>
        <Text style={[styles.productCategory, { color: colors.textSecondary || '#666', fontSize: responsive.fontSize.xs || 12 }]}>
          {product.category_name || 'Category'}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

const CollectionSection = React.memo(({ collection, products, navigation, colors = {}, spacing = {}, typography = {}, responsive = {}, borderRadius = {} }) => {
  const hasProducts = products && products.length > 0;
  
  if (!collection) return null;
  
  const collectionKey = collection.slug || collection.collection_type;
  
  return (
    <View style={[styles.section, { paddingHorizontal: spacing.lg || 16, marginTop: spacing.lg || 16 }]}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionHeaderLeft}>
          {collection.icon ? <Icon name={collection.icon} size={20} color={colors.primary || '#007AFF'} /> : null}
          <Text style={[styles.sectionTitle, { color: colors.textPrimary || '#000', ...typography.h3 }]}>
            {collection.name}
          </Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('StoreTab', { collection: collectionKey })}>
          <Text style={[styles.seeAll, { color: colors.primary || '#007AFF' }]}>See All</Text>
        </TouchableOpacity>
      </View>
      {hasProducts ? (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          removeClippedSubviews={true}
          scrollEventThrottle={16}
        >
          <View style={styles.productRow}>
            {products.slice(0, 6).map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                navigation={navigation}
                colors={colors}
                borderRadius={borderRadius}
                responsive={responsive}
              />
            ))}
          </View>
        </ScrollView>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.productRow}>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </View>
        </ScrollView>
      )}
    </View>
  );
});

const ProductSection = React.memo(({ category, products, navigation, colors = {}, responsive = {}, borderRadius = {} }) => {
  const hasProducts = products && products.length > 0;
  
  return (
    <View style={[styles.section, { paddingHorizontal: responsive.padding.lg || 16, marginTop: responsive.padding.lg || 16 }]}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary || '#000', fontSize: responsive.fontSize.md || 16 }]}>
          {category.name}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('StoreTab', { category: category.id })}>
          <Text style={[styles.seeAll, { color: colors.primary || '#007AFF', fontSize: responsive.fontSize.sm || 14 }]}>See All</Text>
        </TouchableOpacity>
      </View>
      {hasProducts ? (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          removeClippedSubviews={true}
          scrollEventThrottle={16}
        >
          <View style={styles.productRow}>
            {products.slice(0, 6).map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                navigation={navigation}
                colors={colors}
                borderRadius={borderRadius}
                responsive={responsive}
              />
            ))}
          </View>
        </ScrollView>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.productRow}>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </View>
        </ScrollView>
      )}
    </View>
  );
});

const HomeScreen = () => {
  const { colors, spacing, borderRadius, typography } = useTheme();
  const navigation = useNavigation();
  
  const [categories, setCategories] = useState([]);
  const [productsByCategory, setProductsByCategory] = useState({});
  const [productsByCollection, setProductsByCollection] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [loadedCategories, setLoadedCategories] = useState(new Set());
  const [visibleSections, setVisibleSections] = useState(new Set());
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivalProducts, setNewArrivalProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const slideAnim = useRef(new Animated.Value(400)).current;

  useEffect(() => {
    loadData();
    loadRecentSearches();
  }, []);

  useEffect(() => {
    if (showSearchModal) {
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(slideAnim, {
        toValue: 400,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    }
  }, [showSearchModal]);

  const loadRecentSearches = async () => {
    try {
      const stored = await AsyncStorage.getItem('recentSearches');
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load recent searches:', error);
    }
  };

  const saveRecentSearch = async (query) => {
    try {
      const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
      setRecentSearches(updated);
      await AsyncStorage.setItem('recentSearches', JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save recent search:', error);
    }
  };

  const loadData = async () => {
    try {
      // Load categories first (like frontend)
      const categoriesData = await categoryService.getCategories();
      const categoriesList = categoriesData.results || categoriesData;
      setCategories(categoriesList);
      
      // Load collections (like frontend)
      const collectionsData = await collectionService.getCollections();
      const collectionsList = collectionsData.results || collectionsData;
      setCollections(collectionsList);
      
      // Load all products
      const allProductsData = await productService.getProducts({ limit: 100 });
      const allProducts = allProductsData.results || allProductsData;
      
      // Group products by collection (like frontend)
      const productsByCollectionMap = {};
      collectionsList.forEach(collection => {
        const collectionKey = collection.slug || collection.collection_type;
        productsByCollectionMap[collectionKey] = allProducts.filter(product => {
          if (product.collections && product.collections.length > 0) {
            return product.collections.some(c => 
              c.slug === collectionKey || c.collection_type === collectionKey || c.id === collection.id
            );
          }
          return false;
        }).slice(0, 6);
      });
      setProductsByCollection(productsByCollectionMap);
      
      // Load products for categories
      const productsMap = {};
      categoriesList.forEach(category => {
        productsMap[category.id] = allProducts.filter(product => 
          product.category === category.id || product.category_id === category.id
        ).slice(0, 6);
      });
      setProductsByCategory(productsMap);
      
      // Load featured and new arrival products for video sections
      const featuredData = await productService.getProducts({ is_featured: true, limit: 1 });
      setFeaturedProducts(featuredData.results || featuredData);
      
      const newArrivalsData = await productService.getProducts({ is_new: true, limit: 1 });
      setNewArrivalProducts(newArrivalsData.results || newArrivalsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategoryProducts = async (categoryId) => {
    if (loadedCategories.has(categoryId)) return;
    
    try {
      const productsData = await productService.getProducts({ category: categoryId, limit: 6 });
      setProductsByCategory(prev => ({
        ...prev,
        [categoryId]: productsData.results || productsData
      }));
      setLoadedCategories(prev => new Set([...prev, categoryId]));
    } catch (error) {
      console.error('Failed to load category products:', error);
    }
  };

  const handleScroll = (event) => {
    const { y } = event.nativeEvent.contentOffset;
    const sectionHeight = 250; // Approximate height of each section
    const visibleSectionIndex = Math.floor(y / sectionHeight);
    
    // Load current and next sections
    const categoriesToLoad = [
      categories[visibleSectionIndex],
      categories[visibleSectionIndex + 1],
      categories[visibleSectionIndex + 2]
    ].filter(Boolean);
    
    categoriesToLoad.forEach(category => {
      loadCategoryProducts(category.id);
    });
  };

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      try {
        const results = await productService.searchProducts(searchQuery);
        setSearchResults(results.results || results);
        await saveRecentSearch(searchQuery);
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }
  };

  const handleSearchChange = async (query) => {
    setSearchQuery(query);
    if (query.trim().length >= 2) {
      setIsSearching(true);
      try {
        const results = await productService.searchProducts(query);
        setSearchResults(results.results || results);
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleRecentSearchPress = (query) => {
    setSearchQuery(query);
    handleSearch();
  };

  const handleSearchResultPress = (product) => {
    setShowSearchModal(false);
    navigation.navigate('ProductDetail', { productId: product.id });
  };

  const openSearchModal = () => {
    setShowSearchModal(true);
  };

  const closeSearchModal = () => {
    setShowSearchModal(false);
  };

  const CategoriesSection = () => {
    return (
      <View style={[styles.section, { paddingHorizontal: responsive.padding.lg, marginTop: responsive.padding.lg }]}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderLeft}>
            <Icon name="grid-outline" size={responsive.icon.sm} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontSize: responsive.fontSize.md }]}>
              Shop By Categories
            </Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('StoreTab')}>
            <Text style={[styles.seeAll, { color: colors.primary, fontSize: responsive.fontSize.sm }]}>See All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.categoryRow}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[styles.categoryCardPortrait, { 
                  backgroundColor: colors.cardBg,
                  width: responsive.getResponsiveDimension(100, 120, 140)
                }]}
                onPress={() => navigation.navigate('StoreTab', { category: category.id })}
              >
                {category.image_url || category.image ? (
                  <Image 
                    source={{ uri: category.image_url || category.image }} 
                    style={[styles.categoryImage, { height: responsive.getResponsiveDimension(140, 160, 180) }]}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.categoryImagePlaceholder, { height: responsive.getResponsiveDimension(140, 160, 180) }]}>
                    <Icon name="grid-outline" size={responsive.icon.lg} color={colors.primary} style={{ opacity: 0.3 }} />
                  </View>
                )}
                <View style={styles.categoryInfoPortrait}>
                  <Text style={[styles.categoryNamePortrait, { color: colors.textPrimary, fontSize: responsive.fontSize.sm }]} numberOfLines={responsive.lines.short}>
                    {category.name}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  };

  const ProductSection = ({ category, products }) => {
    const hasProducts = products && products.length > 0;
    
    return (
      <View style={[styles.section, { paddingHorizontal: responsive.padding.lg, marginTop: responsive.padding.lg }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontSize: responsive.fontSize.md }]}>
            {category.name}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('StoreTab', { category: category.id })}>
            <Text style={[styles.seeAll, { color: colors.primary, fontSize: responsive.fontSize.sm }]}>See All</Text>
          </TouchableOpacity>
        </View>
        {hasProducts ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.productRow}>
              {products.slice(0, 6).map((product) => (
                <ProductCard key={product.id} product={product} navigation={navigation} colors={colors} borderRadius={borderRadius} responsive={responsive} />
              ))}
            </View>
          </ScrollView>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.productRow}>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </View>
          </ScrollView>
        )}
      </View>
    );
  };

  const VideoSection = ({ title, product }) => {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [videoError, setVideoError] = useState(false);
    
    if (!product) return null;
    
    const handlePlaybackStatusUpdate = (status) => {
      setIsPlaying(status.isPlaying);
    };
    
    const handleVideoError = () => {
      setVideoError(true);
    };
    
    const togglePlayPause = async () => {
      if (videoRef.current) {
        const status = await videoRef.current.getStatusAsync();
        if (status.isPlaying) {
          await videoRef.current.pauseAsync();
        } else {
          await videoRef.current.playAsync();
        }
      }
    };
    
    const toggleMute = async () => {
      if (videoRef.current) {
        await videoRef.current.setIsMutedAsync(!isMuted);
        setIsMuted(!isMuted);
      }
    };
    
    const videoSource = product.video_url || product.video_file_url;
    const imageSource = product.display_image || product.image;
    
    return (
      <View style={[styles.videoSection, { paddingHorizontal: responsive.padding.lg, marginTop: responsive.padding.lg }]}>
        <Text style={[styles.videoTitle, { color: colors.textPrimary, fontSize: responsive.fontSize.md, marginBottom: responsive.padding.sm }]}>{title}</Text>
        <View style={styles.videoContainer}>
          <View style={[styles.videoCard, { 
            backgroundColor: colors.cardBg, 
            borderRadius: borderRadius.lg, 
            width: (responsive.screenWidth - responsive.padding.lg * 2 - responsive.padding.md) / 2, 
            height: (responsive.screenWidth - responsive.padding.lg * 2 - responsive.padding.md) / 2 * 1.33 
          }]}>
            {!videoError && videoSource ? (
              <>
                <Video
                  ref={videoRef}
                  source={{ uri: videoSource }}
                  style={styles.videoPlayer}
                  resizeMode={Video.RESIZE_MODE_COVER}
                  shouldPlay={false}
                  isLooping
                  onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
                  onError={handleVideoError}
                />
                <View style={styles.videoControls}>
                  <TouchableOpacity style={styles.muteButton} onPress={toggleMute}>
                    <Icon name={isMuted ? 'volume-mute' : 'volume-high'} size={responsive.icon.sm} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.playButton} onPress={togglePlayPause}>
                    <Icon name={isPlaying ? 'pause' : 'play'} size={responsive.icon.md} color="#fff" />
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <Image
                source={{ uri: imageSource }}
                style={styles.videoPlayer}
                resizeMode="cover"
              />
            )}
          </View>
          <TouchableOpacity
            style={[styles.productImageCard, { 
              backgroundColor: colors.cardBg, 
              borderRadius: borderRadius.lg, 
              width: (responsive.screenWidth - responsive.padding.lg * 2 - responsive.padding.md) / 2, 
              height: (responsive.screenWidth - responsive.padding.lg * 2 - responsive.padding.md) / 2 * 1.33 
            }]}
            onPress={() => navigation.navigate('ProductDetail', { productId: product.id })}
          >
            <Image
              source={{ uri: imageSource }}
              style={styles.productImageCardImage}
              resizeMode="cover"
            />
            <View style={styles.productImageCardOverlay}>
              <Text style={[styles.productImageCardText, { color: colors.textPrimary, fontSize: responsive.fontSize.sm }]} numberOfLines={responsive.lines.short}>
                {product.name}
              </Text>
              <Text style={[styles.productImageCardSubtext, { color: colors.textSecondary, fontSize: responsive.fontSize.xs }]}>
                View Product
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <>
      <ScrollView 
        style={[styles.container, { backgroundColor: colors.background }]}
        onScroll={handleScroll}
        scrollEventThrottle={400}
      >
        <View style={[styles.header, { paddingHorizontal: responsive.padding.lg, paddingTop: responsive.padding.lg }]}>
          <View style={styles.headerLeft}>
            <Image source={logo} style={[styles.headerLogo, { height: responsive.getResponsiveDimension(30, 35, 40) }]} resizeMode="contain" />
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={openSearchModal} style={styles.searchIconButton}>
              <Icon name="search" size={responsive.icon.md} color={colors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('CartStack')} style={styles.cartIconButton}>
              <Icon name="cart-outline" size={responsive.icon.md} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>
        {isLoading ? (
          <SkeletonSection />
        ) : (
          <CategoriesSection />
        )}
        {isLoading ? (
          <SkeletonSection />
        ) : (
          collections.map((collection) => {
            const collectionKey = collection.slug || collection.collection_type;
            return (
              <CollectionSection 
                key={collection.id} 
                collection={collection} 
                products={productsByCollection[collectionKey] || []}
                navigation={navigation}
                colors={colors}
                spacing={spacing}
                typography={typography}
                responsive={responsive}
                borderRadius={borderRadius}
              />
            );
          })
        )}
        {isLoading ? (
          <SkeletonSection />
        ) : (
          <>
            <VideoSection title="Featured Products" product={featuredProducts[0]} />
            <VideoSection title="New Arrivals" product={newArrivalProducts[0]} />
          </>
        )}
        {isLoading ? (
          <SkeletonSection />
        ) : (
          categories.map((category) => (
            <ProductSection
              key={category.id}
              category={category}
              products={productsByCategory[category.id] || []}
              navigation={navigation}
              colors={colors}
              responsive={responsive}
              borderRadius={borderRadius}
            />
          ))
        )}
      </ScrollView>
      <Modal
        visible={showSearchModal}
        animationType="none"
        transparent={true}
        onRequestClose={closeSearchModal}
      >
        <TouchableOpacity 
          style={[styles.searchModalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
          activeOpacity={1}
          onPress={closeSearchModal}
        >
          <Animated.View 
            style={[styles.searchModalContent, { backgroundColor: colors.background, transform: [{ translateX: slideAnim }] }]}
            onStartShouldSetResponder={() => true}
            onResponderMove={(e) => e.stopPropagation()}
          >
            <View style={[styles.searchModalHeader, { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderColor }]}>
              <TouchableOpacity onPress={closeSearchModal} style={styles.searchModalClose}>
                <Icon name="arrow-back" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
              <View style={[styles.searchModalInputWrapper, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}>
                <Icon name="search" size={20} color={colors.textMuted} style={{ marginRight: 8 }} />
                <TextInput
                  style={[styles.searchModalInput, { color: colors.textPrimary }]}
                  placeholder="Search products..."
                  placeholderTextColor={colors.textMuted}
                  value={searchQuery}
                  onChangeText={handleSearchChange}
                  onSubmitEditing={handleSearch}
                  autoFocus={true}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Icon name="close-circle" size={20} color={colors.textMuted} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
            {searchQuery.length === 0 && recentSearches.length > 0 && (
              <View style={[styles.searchModalSection, { paddingHorizontal: spacing.lg, paddingBottom: spacing.md }]}>
                <Text style={[styles.searchModalSectionTitle, { color: colors.textSecondary, marginBottom: spacing.sm }]}>Recent Searches</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {recentSearches.map((search, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[styles.recentSearchChip, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}
                      onPress={() => handleRecentSearchPress(search)}
                    >
                      <Text style={[styles.recentSearchText, { color: colors.textPrimary }]}>{search}</Text>
                      <Icon name="time-outline" size={14} color={colors.textSecondary} />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
            {searchQuery.length >= 2 && (
              <ScrollView style={[styles.searchModalResults, { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }]}>
                {isSearching ? (
                  <Text style={[styles.searchLoadingText, { color: colors.textSecondary }]}>Searching...</Text>
                ) : searchResults.length > 0 ? (
                  searchResults.map((product) => {
                    const imageUrl = product.display_image || product.image_url || product.image;
                    return (
                      <TouchableOpacity
                        key={product.id}
                        style={[styles.searchResultItem, { backgroundColor: colors.cardBg, borderBottomColor: colors.borderColor }]}
                        onPress={() => handleSearchResultPress(product)}
                      >
                        <Image
                          source={{ uri: imageUrl }}
                          style={styles.searchResultImage}
                          resizeMode="cover"
                        />
                        <View style={styles.searchResultInfo}>
                          <Text style={[styles.searchResultName, { color: colors.textPrimary }]} numberOfLines={2}>
                            {product.name}
                          </Text>
                          <Text style={[styles.searchResultPrice, { color: colors.primary }]}>
                            ${Number(product.effective_price || product.price).toFixed(2)}
                          </Text>
                        </View>
                        <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  <Text style={[styles.searchNoResults, { color: colors.textSecondary }]}>No products found</Text>
                )}
              </ScrollView>
            )}
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  headerLogo: {
    width: 120,
    height: 40,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f6f8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f6f8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchModalOverlay: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  searchModalContent: {
    width: '100%',
    height: '100%',
  },
  searchModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 16,
  },
  searchModalClose: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchModalInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 24,
    paddingHorizontal: 16,
    borderWidth: 1.5,
  },
  searchModalInput: {
    flex: 1,
    fontSize: 16,
  },
  searchModalButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchModalSection: {
    marginTop: 8,
  },
  searchModalSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  recentSearchChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
    gap: 6,
  },
  recentSearchText: {
    fontSize: 14,
  },
  searchModalResults: {
    maxHeight: 400,
  },
  searchLoadingText: {
    textAlign: 'center',
    paddingVertical: 20,
    fontSize: 14,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  searchResultImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  searchResultInfo: {
    flex: 1,
  },
  searchResultName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  searchResultPrice: {
    fontSize: 16,
    fontWeight: '700',
  },
  searchNoResults: {
    textAlign: 'center',
    paddingVertical: 20,
    fontSize: 14,
  },
  section: {
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoryRow: {
    flexDirection: 'row',
    paddingRight: 8,
  },
  categoryCardPortrait: {
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryImage: {
    width: '100%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  categoryImagePlaceholder: {
    width: '100%',
    backgroundColor: '#f5f6f8',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  categoryInfoPortrait: {
    padding: 10,
    backgroundColor: '#fff',
  },
  categoryNamePortrait: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  videoSection: {
    marginBottom: 8,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  videoContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  videoCard: {
    flex: 1,
    height: 280,
    overflow: 'hidden',
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  muteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    marginBottom: 8,
  },
  videoControls: {
    position: 'absolute',
    left: 12,
    bottom: 12,
    alignItems: 'flex-start',
  },
  productImageCard: {
    flex: 1,
    height: 280,
    overflow: 'hidden',
  },
  productImageCardImage: {
    width: '100%',
    height: '100%',
  },
  productImageCardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 12,
  },
  productImageCardText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  productImageCardSubtext: {
    color: '#fff',
    fontSize: 12,
  },
  loadingSection: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
  },
  productRow: {
    flexDirection: 'row',
    paddingRight: 8,
  },
  productCard: {
    width: 160,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset:{ width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  productInfo: {
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 12,
  },
});

export default HomeScreen;
