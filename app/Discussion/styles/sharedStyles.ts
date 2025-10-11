import { StyleSheet } from 'react-native';

/**
 * Shared color constants for Discussion components
 */
export const COLORS = {
  background: '#DDE7FF',
  cardBackground: '#C9D7FF',
  heroBackground: '#EAF0FF',
  primary: '#4A66C2',
  text: '#111827',
  textSecondary: '#6F7EA6',
  textMuted: '#666',
  white: '#fff',
  gray: '#888',
  grayLight: '#f2f2f2',
  grayBorder: '#eee',
  grayAvatar: '#bbb',
  heartRed: '#e11d48',
  heartGray: '#4b5563',
} as const;

/**
 * Shared styles for Discussion components
 */
export const sharedStyles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  contentPadding: {
    padding: 16,
  },

  // Card styles
  card: {
    marginTop: 10,
    marginHorizontal: 4,
    padding: 12,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
  },

  // Hero section
  hero: {
    padding: 12,
  },
  
  heroImage: {
    height: 140,
    borderRadius: 14,
    backgroundColor: COLORS.heroBackground,
    marginBottom: 10,
  },
  
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  
  heroSub: {
    color: COLORS.textSecondary,
    marginTop: 4,
  },

  // Search and action row
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 4,
  },
  
  searchInput: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 10,
    borderRadius: 10,
  },
  
  addButton: {
    marginLeft: 8,
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: 8,
  },

  // Typography
  sectionTitle: {
    marginTop: 16,
    marginLeft: 4,
    fontWeight: '700',
  },
  
  cardTitle: {
    fontWeight: '700',
  },
  
  cardMeta: {
    color: COLORS.textSecondary,
    marginTop: 6,
    fontSize: 12,
  },

  // Post detail styles
  postTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
  },
  
  postMeta: {
    color: COLORS.textSecondary,
    marginBottom: 10,
    fontSize: 12,
  },
  
  postContent: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },

  // Stats and interaction
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 18,
  },
  
  statCount: {
    marginLeft: 6,
    color: COLORS.text,
    fontWeight: '700',
  },

  // Comments
  comment: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: COLORS.grayBorder,
  },
  
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.grayAvatar,
    marginRight: 10,
  },

  // Input and buttons
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: COLORS.white,
  },
  
  input: {
    flex: 1,
    backgroundColor: COLORS.grayLight,
    padding: 8,
    borderRadius: 8,
  },
  
  sendButton: {
    marginLeft: 8,
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: 6,
  },

  // Interactive elements
  touchableArea: {
    padding: 8,
  },
  
  hitSlop: {
    top: 8,
    bottom: 8,
    left: 8,
    right: 8,
  },
});

/**
 * Utility function to create consistent interactive stat styles
 */
export const createStatStyle = (marginRight: number = 16) => ({
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  marginRight,
});

/**
 * Utility function for consistent text styles
 */
export const createTextStyle = (size: number, weight: string, color: string) => ({
  fontSize: size,
  fontWeight: weight,
  color,
});
