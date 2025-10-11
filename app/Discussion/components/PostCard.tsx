import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { sharedStyles, COLORS, createStatStyle } from '@/styles/sharedStyles';
import { useDiscussion } from '../_layout';

export interface PostCardProps {
  id: string;
  title: string;
  author?: string;
  createdAt: string;
  commentCount: number;
}

/**
 * Optimized PostCard component with memoization
 */
const PostCard = React.memo<PostCardProps>(({ 
  id, 
  title, 
  author, 
  createdAt, 
  commentCount 
}) => {
  const router = useRouter();
  const { isPostLiked, getPostLikes, togglePostLike } = useDiscussion();
  
  const liked = isPostLiked(id);
  const likeCount = getPostLikes(id);

  const handlePress = React.useCallback(() => {
    router.push(`/Discussion/detail?id=${id}`);
  }, [router, id]);

  const handleLike = React.useCallback(() => {
    togglePostLike(id);
  }, [togglePostLike, id]);

  return (
    <View style={sharedStyles.card}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handlePress}
      >
        <Text style={sharedStyles.cardTitle}>{title}</Text>
        <Text style={sharedStyles.cardMeta}>
          {author} • {new Date(createdAt).toLocaleString()}
        </Text>
      </TouchableOpacity>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
        <TouchableOpacity
          onPress={handleLike}
          style={createStatStyle(16)}
          hitSlop={sharedStyles.hitSlop}
        >
          <Ionicons
            name={liked ? "heart" : "heart-outline"}
            size={16}
            color={liked ? COLORS.heartRed : COLORS.heartGray}
          />
          <Text style={[sharedStyles.statCount, { fontSize: 12 }]}>
            {likeCount}
          </Text>
        </TouchableOpacity>

        <View style={createStatStyle(0)}>
          <Ionicons name="chatbubble-ellipses-outline" size={16} color={COLORS.heartGray} />
          <Text style={[sharedStyles.statCount, { fontSize: 12 }]}>
            {commentCount}
          </Text>
        </View>
      </View>
    </View>
  );
});

PostCard.displayName = 'PostCard';

export default PostCard;
