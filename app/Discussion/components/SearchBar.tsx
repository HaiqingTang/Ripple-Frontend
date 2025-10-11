import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { sharedStyles, COLORS } from '../styles/sharedStyles';

/**
 * Memoized SearchBar component with navigation
 */
export const SearchBar = React.memo(() => {
  const router = useRouter();

  const handleSearchPress = React.useCallback(() => {
    router.push('/Discussion/search');
  }, [router]);

  const handleAddPress = React.useCallback(() => {
    router.push('/Discussion/post');
  }, [router]);

  return (
    <View style={sharedStyles.searchRow}>
      <TouchableOpacity 
        style={sharedStyles.searchInput} 
        onPress={handleSearchPress}
      >
        <Text style={{ color: COLORS.gray }}>Search</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={sharedStyles.addButton} 
        onPress={handleAddPress}
      >
        <Text style={{ color: COLORS.white, fontWeight: '700' }}>＋</Text>
      </TouchableOpacity>
    </View>
  );
});

SearchBar.displayName = 'SearchBar';
