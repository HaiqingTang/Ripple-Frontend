import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function PostDetail() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 80 }}>
        {/* Post header */}
        <View style={styles.post}>
          <View style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.author}>Sophia Bennett</Text>
            <Text style={styles.time}>2d</Text>
          </View>
        </View>
        <Text style={styles.postText}>
          I'm looking for recommendations for a good hiking trail near the city. Any suggestions?
        </Text>

        {/* Reactions row */}
        <View style={styles.reactions}>
          <Ionicons name="heart-outline" size={20} color="#333" />
          <Text style={styles.reactionText}>23</Text>
          <Ionicons name="chatbubble-outline" size={20} color="#333" style={{ marginLeft: 16 }} />
          <Text style={styles.reactionText}>12</Text>
          <Ionicons name="arrow-redo-outline" size={20} color="#333" style={{ marginLeft: 16 }} />
          <Text style={styles.reactionText}>5</Text>
        </View>

        {/* Comments */}
        <Text style={styles.commentTitle}>Comments</Text>

        <View style={styles.comment}>
          <View style={styles.avatarSmall} />
          <View style={styles.commentBody}>
            <Text style={styles.commentAuthor}>Ethan Carter <Text style={styles.commentTime}>1d</Text></Text>
            <Text style={styles.commentText}>
              Try the Redwood Trail, it's a moderate hike with beautiful views.
            </Text>
          </View>
        </View>

        <View style={styles.comment}>
          <View style={styles.avatarSmall} />
          <View style={styles.commentBody}>
            <Text style={styles.commentAuthor}>Olivia Harper <Text style={styles.commentTime}>2d</Text></Text>
            <Text style={styles.commentText}>
              I second the Redwood Trail! Also, make sure to bring plenty of water.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Add comment input */}
      <View style={styles.inputBar}>
        <View style={styles.avatarSmall} />
        <TextInput
          placeholder="Add a comment..."
          style={styles.input}
        />
        <TouchableOpacity>
          <Ionicons name="send" size={24} color="#4A66C2" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#DDE7FF' },
  post: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#bbb', marginRight: 10 },
  author: { fontWeight: '700', fontSize: 16, color: '#333' },
  time: { fontSize: 12, color: '#666' },
  postText: { paddingHorizontal: 16, fontSize: 15, color: '#333', marginBottom: 10 },
  reactions: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 10 },
  reactionText: { marginLeft: 4, fontSize: 13, color: '#333' },
  commentTitle: { fontWeight: '700', fontSize: 16, paddingHorizontal: 16, marginBottom: 10 },
  comment: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 16, marginBottom: 14 },
  avatarSmall: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#bbb', marginRight: 10 },
  commentBody: { flex: 1 },
  commentAuthor: { fontWeight: '600', fontSize: 14, color: '#333' },
  commentTime: { fontWeight: '400', fontSize: 12, color: '#666' },
  commentText: { fontSize: 13, color: '#333', marginTop: 4 },
  inputBar: {
    flexDirection: 'row', alignItems: 'center', padding: 10,
    borderTopWidth: 1, borderColor: '#ccc', backgroundColor: '#fff'
  },
  input: { flex: 1, marginHorizontal: 8, padding: 8 }
});
