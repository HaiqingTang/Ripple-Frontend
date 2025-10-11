import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { sharedStyles, COLORS } from '@/styles/sharedStyles';
import { useDiscussion } from '../_layout';

export interface PostStatsProps {
  postId: string;
  commentCount: number;
  size?: number;
}

/**
 * Memoized PostStats component for like/comment display
 */
const PostStats = React.memo<PostStatsProps>(({ 
  postId, 
  commentCount, 
  size = 18 
}) => {
  const { isPostLiked, getPostLikes, togglePostLike } = useDiscussion();
  
  const liked = isPostLiked(postId);
  const likeCount = getPostLikes(postId);

  const handleLike = React.useCallback(() => {
    togglePostLike(postId);
  }, [togglePostLike, postId]);

  return (
    <View style={sharedStyles.statRow}>
      <TouchableOpacity
        style={sharedStyles.stat}
        onPress={handleLike}
        hitSlop={sharedStyles.hitSlop}
      >
        <Ionicons
          name={liked ? "heart" : "heart-outline"}
          size={size}
          color={liked ? COLORS.heartRed : COLORS.heartGray}
        />
        <Text style={sharedStyles.statCount}>{likeCount}</Text>
      </TouchableOpacity>

      <View style={sharedStyles.stat}>
        <Ionicons 
          name="chatbubble-ellipses-outline" 
          size={size} 
          color={COLORS.heartGray} 
        />
        <Text style={sharedStyles.statCount}>{commentCount}</Text>
      </View>
    </View>
  );
});

PostStats.displayName = 'PostStats';

export { PostStats };
export default PostStats;
