export interface TreeNode {
  _id: string;
  user: string;
  content: string;
  type: 'root' | 'branch' | 'leaf';
  stage: 'seed' | 'sprout' | 'tree';
  mediaUrl?: string;
  description?: string;
  parent?: string;
  children: string[];
  likes: string[];
  comments: Comment[];
  tags: string[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  user: string;
  content: string;
  createdAt: string;
}

export interface TreeResponse {
  nodes: TreeNode[];
  total: number;
  page: number;
  pages: number;
}

export interface TreeState {
  nodes: TreeNode[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

export interface DragItem {
  type: 'node';
  id: string;
  parentId?: string;
}

export interface DropResult {
  id: string;
  parentId?: string;
} 