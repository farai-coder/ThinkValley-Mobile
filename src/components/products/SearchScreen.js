import React, { memo, useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, TextInput, FlatList, Keyboard } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import Icon from 'react-native-vector-icons/Ionicons';
import ProductCard from './ProductCard';
import EmptyState from './EmptyState';

const SearchScreen = memo(({ 
  visible, 
  onClose, 
  onSearch, 
  recentSearches = [], 
  popularSearches = [],
  initialQuery = ''
}) => {
  const { colors, spacing, borderRadius, typography, shadows, touchTarget } = useTheme();
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showRecent, setShowRecent] = useState(true);

  useEffect(() => {
    if (visible) {
      setQuery(initialQuery);
      setShowRecent(true);
    }
  }, [visible, initialQuery]);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    setShowRecent(false);
    
    try {
      const searchResults = await onSearch(query);
      setResults(searchResults.results || searchResults);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [query, onSearch]);

  const handleRecentSearchPress = useCallback((searchTerm) => {
    setQuery(searchTerm);
    handleSearch();
  }, [handleSearch]);

  const handleClearQuery = useCallback(() => {
    setQuery('');
    setShowRecent(true);
    setResults([]);
  }, []);

  const renderRecentSearchItem = useCallback(({ item }) => (
    <TouchableOpacity
      onPress={() => handleRecentSearchPress(item)}
      style={[
        styles.searchItem,
        { 
          backgroundColor: colors.surface,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          borderRadius: borderRadius.md,
          marginBottom: spacing.sm,
        }
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Search for ${item}`}
    >
      <View style={styles.searchItemContent}>
        <Icon name="time-outline" size={18} color={colors.textMuted} />
        <Text style={[styles.searchItemText, { color: colors.textPrimary, ...typography.body }]}>
          {item}
        </Text>
      </View>
    </TouchableOpacity>
  ), [colors, spacing, borderRadius, typography, handleRecentSearchPress]);

  const renderPopularSearchItem = useCallback(({ item }) => (
    <TouchableOpacity
      onPress={() => handleRecentSearchPress(item)}
      style={[
        styles.popularItem,
        { 
          backgroundColor: colors.surfaceVariant,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          borderRadius: borderRadius.full,
          marginRight: spacing.sm,
        }
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Search for ${item}`}
    >
      <Text style={[styles.popularItemText, { color: colors.textPrimary, ...typography.caption }]}>
        {item}
      </Text>
    </TouchableOpacity>
  ), [colors, spacing, borderRadius, typography, handleRecentSearchPress]);

  if (!visible) return null;

  return (
    <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
      <View style={[styles.container, { backgroundColor: colors.cardBg }]}>
        <View style={[styles.header, { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderColor }]}>
          <TouchableOpacity
            onPress={onClose}
            style={[styles.backButton, { width: touchTarget.minimum, height: touchTarget.minimum }]}
            accessibilityRole="button"
            accessibilityLabel="Close search"
          >
            <Icon name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>

          <View style={[
            styles.searchInputWrapper,
            { 
              backgroundColor: colors.surface,
              borderColor: colors.borderColor,
              borderRadius: borderRadius.full,
              paddingHorizontal: spacing.md,
              flex: 1,
              marginHorizontal: spacing.sm,
            }
          ]}>
            <Icon name="search" size={20} color={colors.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: colors.textPrimary, ...typography.body }]}
              placeholder="Search products..."
              placeholderTextColor={colors.textHint}
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={handleSearch}
              autoFocus
              returnKeyType="search"
              accessibilityLabel="Search input"
              accessibilityHint="Type to search for products"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={handleClearQuery} hitSlop={8}>
                <Icon name="close-circle" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            onPress={handleSearch}
            style={[styles.searchButton, { width: touchTarget.minimum, height: touchTarget.minimum }]}
            accessibilityRole="button"
            accessibilityLabel="Search"
          >
            <Icon name="search" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <FlatList
          style={styles.content}
          contentContainerStyle={[styles.contentContainer, { paddingHorizontal: spacing.lg, paddingVertical: spacing.lg }]}
          data={showRecent ? (recentSearches.length > 0 ? recentSearches : popularSearches) : results}
          keyExtractor={(item, index) => (item.id || item).toString()}
          renderItem={({ item }) => {
            if (showRecent) {
              if (recentSearches.length > 0) {
                return renderRecentSearchItem({ item });
              }
              return renderPopularSearchItem({ item });
            }
            return <ProductCard product={item} />;
          }}
          ListHeaderComponent={
            showRecent && (
              <View style={styles.section}>
                {recentSearches.length > 0 && (
                  <>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary, ...typography.overline, marginBottom: spacing.md }]}>
                      RECENT SEARCHES
                    </Text>
                    {recentSearches.map((item, index) => renderRecentSearchItem({ item, key: index }))}
                  </>
                )}
                {recentSearches.length === 0 && popularSearches.length > 0 && (
                  <>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary, ...typography.overline, marginBottom: spacing.md }]}>
                      POPULAR SEARCHES
                    </Text>
                    <View style={styles.popularContainer}>
                      {popularSearches.map((item, index) => renderPopularSearchItem({ item, key: index }))}
                    </View>
                  </>
                )}
              </View>
            )
          }
          ListEmptyComponent={
            !showRecent && !isSearching && (
              <EmptyState
                icon="search-outline"
                title="No Results Found"
                message={`We couldn't find any products matching "${query}"`}
                actionLabel="Try a different search"
                onAction={() => setQuery('')}
              />
            )
          }
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={Keyboard.dismiss}
        />
      </View>
    </View>
  );
});

SearchScreen.displayName = 'SearchScreen';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  container: {
    flex: 1,
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1.5,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  searchButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: '700',
  },
  searchItem: {},
  searchItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchItemText: {
    flex: 1,
  },
  popularContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  popularItem: {},
  popularItemText: {
    fontWeight: '600',
  },
});

export default SearchScreen;
