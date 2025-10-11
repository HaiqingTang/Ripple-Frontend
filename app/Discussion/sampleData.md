# Firebase Collections Structure

## Collection: `discussionPosts`

Sample documents:

```json
{
  "title": "Discussion about this weekend's national competition",
  "content": "Anyone joining the national competition this weekend? Tips & schedule.",
  "author": "Sophia",
  "authorId": "user123",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "likes": ["user456", "user789"],
  "likeCount": 2,
  "commentCount": 3
}
```

```json
{
  "title": "Best pizza places in town",
  "content": "Share your favorite pizza spots! I'm looking for recommendations.",
  "author": "Ethan",
  "authorId": "user456",
  "createdAt": "2024-01-14T15:45:00.000Z",
  "likes": ["user123"],
  "likeCount": 1,
  "commentCount": 1
}
```

## Collection: `discussionComments`

Sample documents:

```json
{
  "postId": "POST_ID_FROM_ABOVE",
  "author": "Ethan",
  "authorId": "user456",
  "text": "I'm joining, excited!",
  "createdAt": "2024-01-15T11:00:00.000Z"
}
```

```json
{
  "postId": "POST_ID_FROM_ABOVE",
  "author": "Olivia",
  "authorId": "user789",
  "text": "Try Pine Street Pizza - it's amazing!",
  "createdAt": "2024-01-14T16:00:00.000Z"
}
```

## Firebase Security Rules

Add these rules to your Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Discussion posts
    match /discussionPosts/{postId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null 
        && request.auth.uid == resource.data.authorId;
      allow update: if request.auth != null;
    }
    
    // Discussion comments
    match /discussionComments/{commentId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null 
        && request.auth.uid == resource.data.authorId;
      allow update: if request.auth != null 
        && request.auth.uid == resource.data.authorId;
    }
  }
}
```
