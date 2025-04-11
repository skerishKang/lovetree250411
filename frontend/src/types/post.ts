export interface Post {
  _id: string;
  content: string;
  image?: string;
  author: {
    _id: string;
    username: string;
    profileImage?: string;
  };
  likes: string[];
  commentCount: number;
  createdAt: string;
  category: string;
} 