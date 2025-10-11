import React from 'react';
import { View, Text } from 'react-native';
import { sharedStyles } from '../styles/sharedStyles';

/**
 * Memoized Hero section component
 */
export const HeroSection = React.memo(() => (
  <View style={sharedStyles.hero}>
    <View style={sharedStyles.heroImage} />
    <Text style={sharedStyles.heroTitle}>🔥 Hot topics right now</Text>
    <Text style={sharedStyles.heroSub}>Tap a topic to see discussion</Text>
  </View>
));

HeroSection.displayName = 'HeroSection';
