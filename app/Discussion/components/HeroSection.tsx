import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { sharedStyles } from '@/styles/sharedStyles';
import { useDiscussion } from '../_layout';

/**
 * Memoized Hero section component that displays the hottest post
 */
const HeroSection = React.memo(() => {
  const router = useRouter();
  const { hottestPost } = useDiscussion();

  const handlePostPress = () => {
    if (hottestPost) {
      router.push(`/Discussion/detail?id=${hottestPost.id}`);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (!hottestPost) {
    return (
      <View style={sharedStyles.hero}>
        <Image 
          source={require('@/assets/images/discussion-placeholder.png')}
          style={sharedStyles.heroImage}
          resizeMode="cover"
        />
        <Text style={sharedStyles.heroTitle}>🔥 Hot topics right now</Text>
        <Text style={sharedStyles.heroSub}>Tap a topic to see discussion</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity 
      style={sharedStyles.hero} 
      onPress={handlePostPress}
      activeOpacity={0.8}
    >
      {/* TODO: Display the image uploaded with the post instead of placeholder */}
      <Image 
        source={require('@/assets/images/discussion-placeholder.png')}
        style={sharedStyles.heroImage}
        resizeMode="cover"
      />
      <View style={sharedStyles.heroContent}>
        <Text style={sharedStyles.heroTitle}>
          🔥 [HOT] {hottestPost.title}
        </Text>
        <Text style={sharedStyles.heroMeta}>
          Started {formatTimeAgo(hottestPost.createdAt)}
        </Text>
        <Text style={sharedStyles.heroMeta}>
          {hottestPost.commentCount} participants
        </Text>
      </View>
    </TouchableOpacity>
  );
});

HeroSection.displayName = 'HeroSection';

export default HeroSection;
