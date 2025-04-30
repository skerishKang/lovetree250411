import React, { useEffect, useState, useCallback, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store'; // Assuming AppDispatch is defined in store
import { fetchTreeById, updateTree } from '../features/trees/treeSlice';
import ReactFlow, {
  Background,
  Controls,
  Node,
  Edge,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  Panel,
  NodeMouseHandler,
  ReactFlowInstance,
  ConnectionMode,
  Handle,
  Position,
  NodeChange,
  EdgeChange,
} from 'reactflow';
import 'reactflow/dist/style.css';
import './TreeEdit.css'; // Make sure this path is correct
import YoutubeSearch from '../components/YoutubeSearch'; // Make sure this path is correct
import { addNotification } from '../features/notifications/notificationsSlice'; // Make sure this path is correct
import { selectUser } from '../features/auth/authSelectors'; // Make sure this path is correct
import Modal from '../components/Modal'; // Make sure this path is correct
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'; // Added DragEndEvent
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getToken } from '../utils/auth';
import api from '@/utils/axios';

// TODO: 이 파일의 useSelector 구조와 updateTree 페이로드 구조는
//       slice/thunk 정의가 바뀌면 반드시 점검/수정할 것!
// FIXME: 현재는 동작하지만, 타입 경고가 생기면 즉시 고칠 것!
// NOTE: 타입 경고/에러가 발생하면 반드시 안전하게 수정할 것!

// --- Interfaces ---

interface NodeData {
  label: string;
  videoTitle?: string;
  videoUrl?: string;
  description?: string;
  likes?: number;
  comments?: Array<{
    id: string;
    text: string;
    author: string; // Consider changing to authorId and fetching author details
    createdAt: string;
  }>;
  author?: { // This might represent the node creator, not comment author
    _id: string;
    name: string;
    profileImage?: string;
  };
  mediaImage?: string; // Single image URL (consider replacing with mediaImages)
  mediaImages?: { url: string; caption: string }[]; // Multiple image URLs
  mediaVideos?: { url: string; caption: string }[]; // Multiple video URLs
}

interface NodeDetailModalProps {
  node: Node<NodeData>;
  onClose: () => void;
  onSave: (nodeId: string, data: NodeData) => void; // Pass nodeId for saving
  isEdit: boolean;
  onToggleEdit: () => void;
  onDelete?: (nodeId: string) => void; // optional로 변경
}

// --- Helper Functions ---

// Updated regex: Supports various YouTube URL formats
const getYoutubeID = (url: string): string | null => {
  if (!url) return null;
   // More robust regex to handle various URL formats (including shorts, embed, etc.) and query params
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regExp);
  return match ? match[1] : null;
};

// Fetch YouTube metadata (placeholder - requires API key for full data)
const fetchYoutubeMetadata = async (videoId: string): Promise<{ title: string; description: string; thumbnailUrl: string } | null> => {
  try {
    // Placeholder: In a real app, you'd call the YouTube Data API v3 here
    // const apiKey = 'YOUR_YOUTUBE_API_KEY';
    // const response = await axios.get(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`);
    // if (response.data.items && response.data.items.length > 0) {
    //   const snippet = response.data.items[0].snippet;
    //   return {
    //     title: snippet.title,
    //     description: snippet.description,
    //     thumbnailUrl: snippet.thumbnails.medium.url, // Or mqdefault, high, etc.
    //   };
    // }
    // Fallback if API call fails or no key
    console.warn("YouTube API key not configured. Fetching basic metadata only.");
    return {
      title: '', // Cannot get title without API
      description: '', // Cannot get description without API
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
    };
  } catch (error) {
    console.error('Failed to fetch YouTube metadata:', error);
    return null;
  }
};

// --- Constants ---

const nodeDefaults = {
  style: {
    borderRadius: '8px',
    border: '1px solid #ddd',
    padding: '10px',
    cursor: 'pointer',
    background: 'white',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
  },
};

const initialNodes: Node<NodeData>[] = []; // Start with empty initial nodes
const initialEdges: Edge[] = [];

// CustomNode: Renders the node in ReactFlow
const CustomNode = memo(({ data, id, selected }: { data: NodeData; id: string; selected: boolean }) => {
  const videoUrl = data.videoUrl; // Use only videoUrl
  const videoId = videoUrl ? getYoutubeID(videoUrl) : null;
  const mainImageUrl = data.mediaImages && data.mediaImages.length > 0 ? data.mediaImages[0].url : (videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null);
  console.log('[CustomNode]', id, 'Data received:', data, 'Extracted videoId:', videoId, 'Final mainImageUrl:', mainImageUrl);

  // Optional: Log rendering for debugging
  // useEffect(() => {
  //   console.log(`[CustomNode ${id}] Rendering:`, { data, videoId, videoUrl });
  // }, [data, videoId, id, videoUrl]);

  return (
    <div style={{
      ...nodeDefaults.style,
      border: selected ? '2px solid #3b82f6' : '1px solid #ddd',
      boxShadow: selected ? '0 0 0 2px rgba(59, 130, 246, 0.5)' : nodeDefaults.style.boxShadow,
      position: 'relative',
      padding: '15px',
      width: mainImageUrl ? '220px' : 'auto',
      minWidth: '150px',
    }}>
      {/* Handles - 중앙 정렬 */}
      <Handle type="source" position={Position.Top} id={`t-s-${id}`} isConnectable={true} style={{ background: '#555', top: '-5px', left: '50%', transform: 'translateX(-50%)' }} />
      <Handle type="target" position={Position.Bottom} id={`b-t-${id}`} isConnectable={true} style={{ background: '#aaa', bottom: '-5px', left: '50%', transform: 'translateX(-50%)' }} />
      <Handle type="source" position={Position.Left} id={`l-s-${id}`} isConnectable={true} style={{ background: '#555', left: '-5px', top: '50%', transform: 'translateY(-50%)' }} />
      <Handle type="target" position={Position.Right} id={`r-t-${id}`} isConnectable={true} style={{ background: '#aaa', right: '-5px', top: '50%', transform: 'translateY(-50%)' }} />

      {/* Node Content */}
      <div className="flex items-center justify-between mb-1">
        <div className="font-medium truncate" title={data.videoTitle || data.label}>{data.videoTitle || data.label}</div>
        {data.likes !== undefined && (
          <div className="text-sm text-gray-500 flex-shrink-0 ml-2">
            ❤️ {data.likes}
          </div>
        )}
      </div>
      {mainImageUrl && (
        <div className="mt-2 rounded overflow-hidden aspect-video">
          <img
            src={mainImageUrl}
            alt={`썸네일: ${data.videoTitle || data.label || 'Node'}`}
            loading="lazy"
            className="w-full h-full object-cover"
            tabIndex={-1}
          />
        </div>
      )}
    </div>
  );
});
CustomNode.displayName = 'CustomNode'; // Add display name for React DevTools

// --- NodeTypes 객체를 CustomNode 선언 이후에 위치 (성능 경고 완전 방지)
const nodeTypes = { custom: CustomNode, leaf: CustomNode };

// Sortable Thumbnail Item (Images)
function SortableImageThumb({ id, src, alt, onRemove, onDownload, onShare, filename }: {
  id: string; src: string; alt: string; onRemove: () => void; onDownload: () => void; onShare: () => void; filename: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab', // Change cursor while dragging
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="relative group w-24 h-24 flex-shrink-0">
      <img
        src={src}
        alt={alt}
        className="object-cover w-full h-full rounded border" // Use w-full h-full
        loading="lazy"
        tabIndex={0} // Keep focusable if needed
      />
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
        <div className="flex gap-1">
           <button type="button" onClick={onRemove} className="bg-white bg-opacity-80 rounded-full p-1 text-xs text-red-500 hover:bg-red-100" aria-label="Remove image" title="Remove" tabIndex={0}>🗑️</button>
           <a href={src} download={filename || 'image'} onClick={onDownload} className="bg-white bg-opacity-80 rounded-full p-1 text-xs text-blue-500 hover:bg-blue-100" aria-label="Download image" title="Download" tabIndex={0}>⬇️</a>
           <button type="button" onClick={onShare} className="bg-white bg-opacity-80 rounded-full p-1 text-xs text-green-500 hover:bg-green-100" aria-label="Copy image link" title="Copy Link" tabIndex={0}>🔗</button>
        </div>
      </div>
      <div className="absolute bottom-1 left-1 bg-black bg-opacity-60 rounded px-1 py-0.5 text-[10px] text-white truncate max-w-[calc(100%-8px)]" title={filename}>{filename || 'image'}</div>
    </div>
  );
}

// Sortable Thumbnail Item (Videos)
function SortableVideoThumb({ id, vidId, alt, onRemove, onOpen, onShare, filename }: {
   id: string; vidId: string | null; alt: string; onRemove: () => void; onOpen: () => void; onShare: () => void; filename: string;
 }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="relative group w-40 h-24 flex-shrink-0">
      {vidId ? (
        <img
          src={`https://img.youtube.com/vi/${vidId}/mqdefault.jpg`}
          alt={alt}
          className="object-cover w-full h-full rounded border cursor-pointer"
          loading="lazy"
          tabIndex={0}
          onClick={onOpen}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded border text-xs text-gray-400 p-2 text-center">Invalid Link</div>
      )}
       <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
         <div className="flex gap-1">
           <button type="button" onClick={onRemove} className="bg-white bg-opacity-80 rounded-full p-1 text-xs text-red-500 hover:bg-red-100" aria-label="Remove video" title="Remove" tabIndex={0}>🗑️</button>
           {vidId && (
            <a href={`https://www.youtube.com/watch?v=${vidId}`} target="_blank" rel="noopener noreferrer" className="bg-white bg-opacity-80 rounded-full p-1 text-xs text-blue-500 hover:bg-blue-100" aria-label="Open video in new tab" title="Open" tabIndex={0}>↗️</a>
           )}
           <button type="button" onClick={onShare} className="bg-white bg-opacity-80 rounded-full p-1 text-xs text-green-500 hover:bg-green-100" aria-label="Copy video link" title="Copy Link" tabIndex={0}>🔗</button>
         </div>
       </div>
      <div className="absolute bottom-1 left-1 bg-black bg-opacity-60 rounded px-1 py-0.5 text-[10px] text-white truncate max-w-[calc(100%-8px)]" title={filename}>{filename || 'video'}</div>
    </div>
  );
}

// Node Detail Modal Component
const NodeDetailModal: React.FC<NodeDetailModalProps> = ({
  node,
  onClose,
  onSave,
  isEdit,
  onToggleEdit,
  onDelete,
}) => {
  const [formData, setFormData] = useState<NodeData>({ ...node.data });
  const [videoId, setVideoId] = useState<string | null>(null); // Derived state for main video preview
  const [newComment, setNewComment] = useState('');
  const [showYoutubeSearch, setShowYoutubeSearch] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false); // Renamed for clarity
  const [imageUploading, setImageUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null); // Generic upload error
  const [mediaModalOpen, setMediaModalOpen] = useState(false); // For viewing single media items
  const [mediaModalContent, setMediaModalContent] = useState<{ type: 'image' | 'video', url: string } | null>(null);
  const [newVideoUrl, setNewVideoUrl] = useState(''); // For adding to mediaVideos list

  const dispatch: AppDispatch = useDispatch();
  const user = useSelector(selectUser);

  // Initialize form data and video ID when node changes
  useEffect(() => {
    setFormData({ ...node.data });
    setVideoId(node.data.videoUrl ? getYoutubeID(node.data.videoUrl) : null);
     // Reset other states
    setNewComment('');
    setShowYoutubeSearch(false);
    setIsDraggingOver(false);
    setUploadError(null);
    setNewVideoUrl('');
  }, [node]);


  // Drag and Drop Handlers for YouTube URL input
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const url = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text'); // Handle different drop types
    console.log('Dropped URL:', url);
    if (url) {
      const vidId = getYoutubeID(url);
      if (vidId) {
        const fullUrl = `https://www.youtube.com/watch?v=${vidId}`;
        setFormData(prev => ({ ...prev, videoUrl: fullUrl })); // Update form data
        setVideoId(vidId); // Update preview ID
        // Fetch metadata if title/description are missing
        if (!formData.videoTitle || !formData.description) {
           const metadata = await fetchYoutubeMetadata(vidId);
           if (metadata) {
               setFormData(prev => ({
                   ...prev,
                   videoTitle: prev.videoTitle || metadata.title || `Video ${vidId}`, // Provide fallback title
                   label: prev.label || metadata.title || `Video ${vidId}`, // Also update label
                   description: prev.description || metadata.description,
               }));
           }
        }
      } else {
          setUploadError('Dropped item is not a valid YouTube link.');
          setTimeout(() => setUploadError(null), 3000); // Clear error after 3 seconds
      }
    }
  };

  // Handler for YouTube URL input change
  const handleUrlChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFormData(prev => ({ ...prev, videoUrl: url })); // Update immediately for input value

    const newVidId = getYoutubeID(url);
    setVideoId(newVidId); // Update preview ID

    // Basic validation (can be more robust)
    const youtubeRegExp = /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube(-nocookie)?\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/|shorts\/)?)([\w\-]+)(\S+)?$/;
    if (url && !youtubeRegExp.test(url) && url !== '') {
        setUploadError('Invalid YouTube URL format.');
    } else {
        setUploadError(null); // Clear error on valid or empty input
         // Fetch metadata if ID is valid and title/desc are missing
        if (newVidId && (!formData.videoTitle || !formData.description)) {
            const metadata = await fetchYoutubeMetadata(newVidId);
            if (metadata) {
                setFormData(prev => ({
                    ...prev,
                    videoTitle: prev.videoTitle || metadata.title || `Video ${newVidId}`,
                    label: prev.label || metadata.title || `Video ${newVidId}`,
                    description: prev.description || metadata.description,
                }));
            }
        }
    }
  };

   // Handler for saving the form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
     // Ensure label exists, fallback to video title or default
    const finalData = {
        ...formData,
        label: formData.label || formData.videoTitle || 'Untitled Node'
    };
    onSave(node.id, finalData); // Pass node ID and updated data
    // onClose(); // Typically close after save, unless onSave handles it
  };

   // Handler for adding comments
  const handleAddComment = () => {
    if (!newComment.trim() || !user) return;
    const comment = {
      id: Date.now().toString(), // Use timestamp or UUID
      text: newComment.trim(),
      author: user.name || 'Anonymous', // Use logged-in user's name
      // authorId: user._id, // Store user ID instead of name potentially
      createdAt: new Date().toISOString() // Use ISO string for consistency
    };
    setFormData(prev => ({
      ...prev,
      comments: [...(prev.comments || []), comment]
    }));
    setNewComment('');

     // Dispatch notification (check if node author exists and is not the current user)
    if (node.data.author && user && user._id !== node.data.author._id) {
      dispatch(addNotification({
        _id: `${node.id}-comment-${user._id}-${Date.now()}`, // Example unique ID
        type: 'comment',
        sender: user, // Assuming user object matches sender structure
        post: { _id: node.id, content: node.data.label }, // Adapt as needed
        comment: { _id: comment.id, text: comment.text }, // Adapt as needed
        recipientId: node.data.author._id, // Add recipient ID
        read: false,
        createdAt: comment.createdAt
      }));
    }
  };

  // Handler for uploading multiple node images
  const handleNodeImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setImageUploading(true);
    setUploadError(null);
    const uploadedImages: { url: string; caption: string }[] = [];
    const errors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) {
        errors.push(`"${file.name}" is not an image.`);
        continue;
      }
      if (file.size > 10 * 1024 * 1024) { // Example: 10MB limit
        errors.push(`"${file.name}" exceeds the 10MB size limit.`);
        continue;
      }

      try {
        const formDataObj = new FormData();
        formDataObj.append('file', file); // Key 'file' expected by backend
        // Replace with your actual API endpoint
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formDataObj,
          // Add headers if needed (e.g., Authorization)
          // headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) {
           const errorData = await res.json().catch(() => ({ message: 'Upload failed with status: ' + res.status }));
           throw new Error(errorData.message || `Failed to upload "${file.name}"`);
        }
        const data = await res.json();
        if (!data.url) {
            throw new Error(`Upload succeeded for "${file.name}" but no URL was returned.`);
        }
        uploadedImages.push({ url: data.url, caption: '' }); // Add caption later if needed
      } catch (err: any) {
        errors.push(err.message || `Error uploading "${file.name}".`);
      }
    }

    setImageUploading(false);
    if (errors.length > 0) {
        setUploadError(errors.join('\n')); // Show all errors
         // Optionally clear error after some time
        // setTimeout(() => setUploadError(null), 5000);
    }

    if (uploadedImages.length > 0) {
        setFormData(prev => ({
            ...prev,
            mediaImages: [...(prev.mediaImages || []), ...uploadedImages]
        }));
    }
  };

  // Handler for adding a new video URL to the list
  const handleAddNodeVideo = () => {
    if (!newVideoUrl.trim()) return;
     const vidId = getYoutubeID(newVideoUrl.trim());
     if (!vidId) {
         setUploadError("Invalid YouTube URL format for additional video.");
         setTimeout(() => setUploadError(null), 3000);
         return;
     }
     const urlToAdd = `https://www.youtube.com/watch?v=${vidId}`; // Standardize URL
    setFormData(prev => ({
      ...prev,
      mediaVideos: [...(prev.mediaVideos || []), { url: urlToAdd, caption: '' }]
    }));
    setNewVideoUrl(''); // Clear input after adding
     setUploadError(null); // Clear any previous error
  };

  // Handlers for removing items from lists
  const handleRemoveNodeImageAt = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      mediaImages: (prev.mediaImages || []).filter((_, i) => i !== idx)
    }));
  };

  const handleRemoveNodeVideoAt = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      mediaVideos: (prev.mediaVideos || []).filter((_, i) => i !== idx)
    }));
  };

  // Handler for DND reordering
  const handleDragEnd = (event: DragEndEvent, type: 'images' | 'videos') => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
          setFormData(prev => {
              const items = type === 'images' ? prev.mediaImages : prev.mediaVideos;
              if (!items) return prev;
              const oldIndex = items.findIndex(item => item.url === active.id);
              const newIndex = items.findIndex(item => item.url === over.id);
              if (oldIndex === -1 || newIndex === -1) return prev; // Should not happen

              const newItems = arrayMove(items, oldIndex, newIndex);
              return type === 'images'
                  ? { ...prev, mediaImages: newItems }
                  : { ...prev, mediaVideos: newItems };
          });
      }
  };

   // Open media in modal
   const handleMediaClick = (type: 'image' | 'video', url: string) => {
     setMediaModalContent({ type, url });
     setMediaModalOpen(true);
   };

   // Copy link to clipboard
   const copyToClipboard = (text: string, type: string) => {
        navigator.clipboard.writeText(text).then(() => {
            dispatch(addNotification({ _id: Date.now().toString(), message: `${type} link copied!`, type: 'info' }));
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            dispatch(addNotification({ _id: Date.now().toString(), message: `Failed to copy ${type} link.`, type: 'error' }));
        });
   };

   const sensors = useSensors(useSensor(PointerSensor, {
     // Require the mouse to move by 10 pixels before activating
     // Improves compatibility with click handlers
     activationConstraint: {
       distance: 10,
     },
   }));

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div
          className={`bg-white rounded-lg shadow-xl max-h-[90vh] flex flex-col transition-all duration-300 ease-out ${showYoutubeSearch ? 'w-full max-w-6xl' : 'w-full max-w-2xl'}`}
          onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking inside
        >
          {/* Modal Header */}
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-xl font-semibold">노드 {isEdit ? '편집' : '상세'}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl" aria-label="Close modal">×</button>
          </div>

          {/* Modal Body */}
          <div className={`flex-grow overflow-y-auto p-6 ${showYoutubeSearch ? 'flex' : 'block'}`}>
             {/* Main Content Area */}
             <div className={`space-y-6 ${showYoutubeSearch ? 'w-1/2 pr-3 border-r' : 'w-full'}`}>
               {isEdit ? (
                 /* --- EDIT MODE --- */
                 <form onSubmit={handleSubmit} className="space-y-5">
                   {/* Title Input */}
                   <div>
                     <label htmlFor="node-title" className="block text-sm font-medium text-gray-700 mb-1">제목</label>
                     <input
                       id="node-title"
                       type="text"
                       value={formData.label || ''} // Edit label directly
                       onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value, videoTitle: e.target.value }))} // Sync label and videoTitle
                       className="w-full p-2 border border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500"
                       required
                     />
                   </div>

                   {/* YouTube URL Input & Preview */}
                   <div
                      className={`p-4 border-2 border-dashed rounded-lg transition-colors ${isDraggingOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <label htmlFor="youtube-url-input" className="block text-sm font-medium text-gray-700 mb-1">대표 유튜브 영상 (선택)</label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          id="youtube-url-input"
                          type="text"
                          value={formData.videoUrl || ''}
                          onChange={handleUrlChange}
                          placeholder="유튜브 주소를 붙여넣거나 썸네일을 드래그하세요"
                          className="flex-grow p-2 border border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowYoutubeSearch(!showYoutubeSearch)} // Toggle search panel
                          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition whitespace-nowrap"
                        >
                           {showYoutubeSearch ? '검색 닫기' : '유튜브 검색'}
                        </button>
                      </div>
                      {isDraggingOver && <div className="mt-2 text-sm text-blue-600">Drop YouTube thumbnail or link here</div>}
                      {uploadError && <div className="mt-2 text-sm text-red-600">{uploadError}</div>}
                      {videoId && (
                        <div className="mt-3 rounded overflow-hidden border">
                          <img
                            src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                            alt={`Preview: ${formData.videoTitle || formData.label || 'Video'}`}
                            className="w-full h-auto object-contain"
                            loading="lazy"
                          />
                        </div>
                      )}
                   </div>

                   {/* Description Textarea */}
                   <div>
                     <label htmlFor="node-description" className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                     <textarea
                       id="node-description"
                       value={formData.description || ''}
                       onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                       className="w-full p-2 border border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500"
                       rows={4}
                       placeholder="Add more details about this node..."
                     />
                   </div>

                    {/* Multiple Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">추가 이미지</label>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleNodeImagesChange}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                            disabled={imageUploading}
                            aria-describedby="image-upload-info"
                        />
                        <p id="image-upload-info" className="text-xs text-gray-500 mt-1">여러 이미지를 업로드할 수 있습니다(최대 10MB). 썸네일을 드래그해 순서를 변경하세요.</p>
                        {imageUploading && <div className="text-sm text-blue-600 mt-1 animate-pulse">Uploading images...</div>}
                        {uploadError && <div className="mt-1 text-sm text-red-600 whitespace-pre-wrap">{uploadError.includes('Image') && uploadError}</div>} {/* Show image specific errors */}
                        {formData.mediaImages && formData.mediaImages.length > 0 && (
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, 'images')}>
                                <SortableContext items={formData.mediaImages.map(img => img.url)} strategy={verticalListSortingStrategy}>
                                    <div className="flex gap-2 mt-2 overflow-x-auto py-2 -mx-1 px-1">
                                        {formData.mediaImages.map((img, idx) => (
                                            <SortableImageThumb
                                                key={img.url}
                                                id={img.url} // DND requires unique ID
                                                src={img.url}
                                                alt={`Node image ${idx + 1}`}
                                                filename={img.url.substring(img.url.lastIndexOf('/') + 1)}
                                                onRemove={() => handleRemoveNodeImageAt(idx)}
                                                onDownload={() => {}} // Browser handles download via <a>
                                                onShare={() => copyToClipboard(img.url, 'Image')}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        )}
                    </div>

                    {/* Multiple Video URLs */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">추가 영상 (유튜브)</label>
                      <div className="flex gap-2 mb-2">
                          <input
                              type="text"
                              value={newVideoUrl}
                              onChange={e => setNewVideoUrl(e.target.value)}
                              placeholder="유튜브 주소를 붙여넣고 추가를 누르세요"
                              className="flex-grow p-2 border border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500"
                              aria-label="New YouTube URL to add"
                          />
                          <button
                              type="button"
                              onClick={handleAddNodeVideo}
                              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition whitespace-nowrap"
                          >Add</button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">여러 유튜브 영상을 추가할 수 있습니다. 썸네일을 드래그해 순서를 변경하세요.</p>
                      {uploadError && <div className="mt-1 text-sm text-red-600">{uploadError.includes('video') && uploadError}</div>} {/* Show video specific errors */}
                      {formData.mediaVideos && formData.mediaVideos.length > 0 && (
                          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, 'videos')}>
                              <SortableContext items={formData.mediaVideos.map(vid => vid.url)} strategy={verticalListSortingStrategy}>
                                  <div className="flex gap-2 mt-2 overflow-x-auto py-2 -mx-1 px-1">
                                      {formData.mediaVideos.map((vid, idx) => {
                                          const vidId = getYoutubeID(vid.url);
                                          return (
                                              <SortableVideoThumb
                                                  key={`${vid.url}-${idx}`} // Ensure key uniqueness if URLs might repeat
                                                  id={vid.url} // DND ID
                                                  vidId={vidId}
                                                  alt={`Node video thumbnail ${idx + 1}`}
                                                  filename={vidId ? `YT: ${vidId}` : 'Invalid Link'}
                                                  onRemove={() => handleRemoveNodeVideoAt(idx)}
                                                  onOpen={() => { if (vidId) window.open(`https://www.youtube.com/watch?v=${vidId}`, '_blank'); }}
                                                  onShare={() => copyToClipboard(vid.url, 'Video')}
                                              />
                                          );
                                      })}
                                  </div>
                              </SortableContext>
                          </DndContext>
                      )}
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end gap-3 pt-3 border-t">
                      {onDelete && (
                        <button type="button" onClick={() => onDelete(node.id)} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition">노드 삭제</button>
                      )}
                      <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition">취소</button>
                      <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">저장</button>
                    </div>
                 </form>
               ) : (
                 /* --- VIEW MODE --- */
                 <div className="space-y-4">
                   {/* Title */}
                   <h3 className="text-lg font-semibold">{node.data.videoTitle || node.data.label}</h3>

                   {/* Primary YouTube Video */}
                   {videoId && (
                     <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden shadow">
                       <iframe
                         src={`https://www.youtube.com/embed/${videoId}`}
                         title="Node YouTube Video"
                         allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                         referrerPolicy="strict-origin-when-cross-origin"
                         allowFullScreen
                         className="w-full h-full border-0"
                       />
                     </div>
                   )}

                   {/* Description */}
                   {node.data.description && (
                     <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded border">{node.data.description}</p>
                   )}

                   {/* Additional Images */}
                    {node.data.mediaImages && node.data.mediaImages.length > 0 && (
                        <div>
                            <h4 className="text-sm font-medium text-gray-600 mb-1">Images</h4>
                            <div className="flex gap-2 overflow-x-auto py-2 -mx-1 px-1">
                                {node.data.mediaImages.map((img, idx) => (
                                     <div key={img.url} className="relative w-24 h-24 flex-shrink-0 cursor-pointer" onClick={() => handleMediaClick('image', img.url)}>
                                         <img src={img.url} alt={`Node ${node.id} image ${idx + 1}`} className="w-full h-full object-cover rounded border" loading="lazy" />
                                         <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition flex items-center justify-center text-white text-xl">+</div>
                                     </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Additional Videos */}
                    {node.data.mediaVideos && node.data.mediaVideos.length > 0 && (
                         <div>
                            <h4 className="text-sm font-medium text-gray-600 mb-1">Videos</h4>
                             <div className="flex gap-2 overflow-x-auto py-2 -mx-1 px-1">
                                {node.data.mediaVideos.map((vid, idx) => {
                                    const vidId = getYoutubeID(vid.url);
                                    return (
                                         <div key={`${vid.url}-${idx}`} className="relative w-40 h-24 flex-shrink-0 cursor-pointer" onClick={() => vidId && handleMediaClick('video', `https://www.youtube.com/embed/${vidId}`)}>
                                              {vidId ? (
                                                 <img src={`https://img.youtube.com/vi/${vidId}/mqdefault.jpg`} alt={`Node ${node.id} video ${idx + 1}`} className="w-full h-full object-cover rounded border" loading="lazy" />
                                              ) : (
                                                  <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded border text-xs text-gray-400 p-2 text-center">Invalid Link</div>
                                              )}
                                             <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition flex items-center justify-center text-white text-xl">▶</div>
                                         </div>
                                    );
                                })}
                             </div>
                         </div>
                     )}


                   {/* Likes and Comments Count */}
                   <div className="flex items-center justify-between border-t pt-4">
                     <div className="flex items-center gap-4">
                       <button className="flex items-center gap-1 text-gray-600 hover:text-red-500 transition">
                         <span>❤️</span>
                         <span>{node.data.likes || 0}</span>
                       </button>
                       <span className="text-gray-600">
                         💬 {node.data.comments?.length || 0}
                       </span>
                     </div>
                     {user && ( // Only show edit button if user is logged in (add permission checks if needed)
                         <button onClick={onToggleEdit} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">Edit Node</button>
                     )}
                   </div>

                   {/* Comments Section */}
                   <div className="border-t pt-4">
                     <h4 className="font-semibold mb-3">댓글</h4>
                     {/* Existing Comments */}
                     <div className="space-y-3 mb-4 max-h-48 overflow-y-auto pr-2">
                       {(!node.data.comments || node.data.comments.length === 0) && <p className="text-sm text-gray-500">아직 댓글이 없습니다.</p>}
                       {node.data.comments?.map(comment => (
                         <div key={comment.id} className="bg-gray-50 p-3 rounded shadow-sm text-sm">
                           <div className="flex justify-between items-center mb-1">
                             <span className="font-medium text-gray-800">{comment.author}</span>
                             <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleString()}</span>
                           </div>
                           <p className="text-gray-700">{comment.text}</p>
                         </div>
                       ))}
                     </div>
                     {/* Add Comment Form */}
                     {user && ( // Only show comment form if user is logged in
                         <div className="space-y-2">
                         <textarea
                             placeholder="댓글을 입력하세요..."
                             className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                             rows={2}
                             value={newComment}
                             onChange={(e) => setNewComment(e.target.value)}
                             aria-label="New comment input"
                         />
                         <button
                             onClick={handleAddComment}
                             disabled={!newComment.trim()}
                             className="px-4 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:bg-gray-400 transition"
                         >
                             댓글 등록
                         </button>
                         </div>
                     )}
                   </div>
                 </div>
               )}
             </div>

             {/* YouTube Search Panel (Conditional) */}
             {showYoutubeSearch && (
               <div className="w-1/2 pl-3 overflow-y-auto">
                 <YoutubeSearch
                   onSelect={async (url, title, description) => {
                     const vidId = getYoutubeID(url);
                     setFormData(prev => ({
                       ...prev,
                       videoUrl: url,
                       // Update title/desc only if they weren't manually set or are empty
                       videoTitle: prev.videoTitle || title || (vidId ? `Video ${vidId}` : 'Selected Video'),
                       label: prev.label || title || (vidId ? `Video ${vidId}` : 'Selected Video'),
                       description: prev.description || description,
                     }));
                     if (vidId) {
                        setVideoId(vidId);
                     }
                     setShowYoutubeSearch(false); // Close search after selection
                   }}
                   onClose={() => setShowYoutubeSearch(false)}
                 />
               </div>
             )}
          </div> {/* End Modal Body */}
        </div> {/* End Modal Content */}
      </div> {/* End Modal Backdrop */}

       {/* Media Viewer Modal */}
       <Modal isOpen={mediaModalOpen} onClose={() => setMediaModalOpen(false)} size="xl">
         {mediaModalContent?.type === 'image' && mediaModalContent.url && (
           <img src={mediaModalContent.url} alt="Enlarged node content" className="max-w-full max-h-[80vh] mx-auto rounded" loading="lazy" />
         )}
         {mediaModalContent?.type === 'video' && mediaModalContent.url && (
           <div className="aspect-w-16 aspect-h-9">
               <iframe
                 src={mediaModalContent.url} // Expecting embed URL here
                 title="Node Video Content"
                 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                 referrerPolicy="strict-origin-when-cross-origin"
                 allowFullScreen
                 className="w-full h-full border-0 rounded"
               />
           </div>
         )}
       </Modal>
    </>
  );
};
NodeDetailModal.displayName = 'NodeDetailModal';

// --- Main TreeEdit Component ---

const TreeEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch(); // Use AppDispatch type
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  // Selectors
  const { currentTree: tree, loading: status, error } = useSelector((state: RootState) => state.trees);
  const storedNodes = tree?.nodes ?? [];
  const storedEdges = tree?.edges ?? [];

  // React Flow States
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Modal States
  const [selectedNode, setSelectedNode] = useState<Node<NodeData> | null>(null);
  const [isModalEditMode, setIsModalEditMode] = useState(false);

  // 최초 1회만 Redux 상태로 로컬 상태 초기화
  const [initialized, setInitialized] = useState(false);

  // Fetch Tree Data Effect
  useEffect(() => {
    if (!id) {
      alert("트리 ID가 없습니다. 메인 페이지로 이동합니다.");
      navigate("/home");
    } else {
      dispatch(fetchTreeById(id));
    }
  }, [id, dispatch, navigate]);

  // 최초 1회만 Redux 상태로 로컬 상태 초기화
  useEffect(() => {
    if (!initialized && tree && storedNodes && storedEdges) {
      const flowNodes = storedNodes.map((n: Node<NodeData>) => ({
        ...n,
        position: n.position || { x: Math.random() * 400, y: Math.random() * 400 },
        type: 'custom',
        data: { ...n.data }
      })) as Node<NodeData>[];
      setNodes(flowNodes);
      setEdges(storedEdges as Edge[]);
      setInitialized(true);
    }
  }, [tree, storedNodes, storedEdges, setNodes, setEdges, initialized]);

  // Handler for connecting nodes
  const onConnect = useCallback(
    (connection: Connection | Edge) => {
      // Add specific handle IDs to the connection object if needed, React Flow does this automatically if IDs match
      console.log("Connection created:", connection);
      setEdges((eds) => addEdge({ ...connection, animated: true, style: { stroke: '#555' } }, eds));
    },
    [setEdges]
  );

  // Handler for clicking a node (open modal in view mode)
  const onNodeClick: NodeMouseHandler = useCallback((_, node) => {
    console.log('Node clicked:', node);
    setSelectedNode(node as Node<NodeData>); // Type assertion
    setIsModalEditMode(false); // Default to view mode on click
  }, []);

   // Handler for double clicking a node (open modal in edit mode)
   const onNodeDoubleClick: NodeMouseHandler = useCallback((_, node) => {
     console.log('Node double clicked:', node);
     setSelectedNode(node as Node<NodeData>); // Type assertion
     setIsModalEditMode(true); // Open in edit mode on double click
   }, []);

  // Save Node Data from Modal
  const handleSaveNodeData = useCallback(
    (nodeId: string, data: NodeData) => {
        console.log('Saving node data:', nodeId, data); // 모달에서 받은 data 로깅
        setNodes((nds) =>
            nds.map((n) => {
                if (n.id === nodeId) {
                    console.log('업데이트 전 노드 data:', n.data);
                    console.log('모달에서 받은 새 data:', data);
                    return { ...n, data: data };
                }
                return n;
            })
        );
        // Close modal after saving
        setSelectedNode(null);
        setIsModalEditMode(false);

        // Optionally: Dispatch update to backend/Redux immediately
        // dispatch(updateTreeNode({ treeId, nodeId, data })); // Define this action if needed
         dispatch(addNotification({ _id: Date.now().toString(), message: `Node "${data.label}" updated.`, type: 'success' }));

    },
    [setNodes, dispatch]
  );


  // Save Tree Layout and Data
  const onSaveTree = useCallback(() => {
    if (!id || !reactFlowInstance) {
        console.error("Cannot save: Missing treeId or React Flow instance.");
        dispatch(addNotification({ _id: Date.now().toString(), message: 'Error: Cannot save tree.', type: 'error' }));
        return;
    }
     // Get current nodes and edges from React Flow state (important!)
     const currentNodes = reactFlowInstance.getNodes();
     const currentEdges = reactFlowInstance.getEdges();

    console.log('Saving tree with ID:', id);
    console.log('Nodes to save:', currentNodes);
    console.log('Edges to save:', currentEdges);

     // Prepare nodes data for backend (remove internal React Flow properties if necessary)
     const nodesToSave = currentNodes.map(({ id, type, data, position }) => ({
         id,
         type,
         data,
         position,
     }));


    // Dispatch action to update the entire tree structure in Redux/backend
     dispatch(updateTree({
         treeId: id,
         data: {
           nodes: nodesToSave,
           edges: currentEdges,
           // name: tree?.name,
           // description: tree?.description
         }
     }))
     .unwrap() // Use unwrap to handle async thunk promise result
     .then(() => {
         dispatch(addNotification({ _id: Date.now().toString(), message: 'Tree saved successfully!', type: 'success' }));
     })
     .catch((saveError) => {
         console.error("Failed to save tree:", saveError);
         dispatch(addNotification({ _id: Date.now().toString(), message: `Failed to save tree: ${saveError.message || 'Unknown error'}` , type: 'error' }));
     });

  }, [id, reactFlowInstance, dispatch]); // Add reactFlowInstance and dispatch

  // 실제 "노드 추가" 버튼 핸들러 (API 호출 포함)
  const handleAddCustomNode = useCallback(async () => {
    if (!id) return;
    const newNodeData = {
      label: '새 노드',
      content: '새 노드 내용',
      videoTitle: '',
      videoUrl: '',
      description: '',
      likes: [],
      comments: [],
      mediaImages: [],
      mediaVideos: []
    };
    try {
      const token = getToken();
      if (!token) {
        console.error('오류: 인증 토큰이 없습니다.');
        dispatch(addNotification({ _id: Date.now().toString(), message: '로그인이 필요합니다.', type: 'error' }));
        return;
      }
      const apiResponse = await api.post(
        `/trees/${id}/nodes`,
        newNodeData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('[Add Node] API 응답 성공! 응답 데이터:', apiResponse.data);
      const finalNewNode = {
        id: apiResponse.data._id || apiResponse.data.nodeId,
        type: 'custom',
        position: { x: 100, y: 100 },
        data: apiResponse.data.data || newNodeData,
      };
      if (!finalNewNode.id) {
        console.error('[Add Node] 오류: 백엔드 응답에서 노드 ID를 찾을 수 없습니다!');
        return;
      }
      setNodes((prevNodes) => [...prevNodes, finalNewNode]);
      console.log('[Add Node] setNodes 호출 완료!');
    } catch (error) {
      console.error('[Add Node] 노드 생성 실패:', error);
      dispatch(addNotification({ _id: Date.now().toString(), message: '노드 생성 실패', type: 'error' }));
    }
  }, [id, setNodes, dispatch]);

  // 더블클릭으로 노드 추가 (API 연동)
  const handlePaneDoubleClick = useCallback(async (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    console.log('handlePaneDoubleClick 함수 호출됨!', event);
    if (!reactFlowInstance || !id) return;
    console.log('React Flow 인스턴스:', reactFlowInstance);
    const position = reactFlowInstance.screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });
    console.log('계산된 노드 위치:', position);
    const newNodeData = {
      label: '노드추가',
      content: '내용을 입력하세요',
      videoTitle: '',
      videoUrl: '',
      description: '',
      likes: [],
      comments: [],
      mediaImages: [],
      mediaVideos: []
    };
    try {
      const token = getToken();
      if (!token) {
        console.error('오류: 인증 토큰이 없습니다.');
        dispatch(addNotification({ _id: Date.now().toString(), message: '로그인이 필요합니다.', type: 'error' }));
        return;
      }
      const apiResponse = await api.post(
        `/trees/${id}/nodes`,
        newNodeData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('[Double Click] API 응답 성공! 응답 데이터:', apiResponse.data);
      const finalNewNode = {
        id: apiResponse.data._id || apiResponse.data.nodeId,
        type: 'custom',
        position,
        data: apiResponse.data.data || newNodeData,
      };
      console.log('[Double Click] setNodes 호출 직전, newNode 객체:', finalNewNode);
      if (!finalNewNode.id) {
        console.error('[Double Click] 오류: 백엔드 응답에서 노드 ID를 찾을 수 없습니다!');
        return;
      }
      setNodes((prevNodes) => [...prevNodes, finalNewNode]);
    } catch (error) {
      console.error('[Double Click] 노드 생성 실패:', error);
      dispatch(addNotification({ _id: Date.now().toString(), message: '노드 생성 실패', type: 'error' }));
    }
  }, [reactFlowInstance, id, setNodes, dispatch]);

  // Override default nodes change handler to log changes (optional)
  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    // console.log("Node Changes:", changes);
    onNodesChange(changes);
  }, [onNodesChange]);

  // Override default edges change handler to log changes (optional)
  const handleEdgesChange = useCallback((changes: EdgeChange[]) => {
    // console.log("Edge Changes:", changes);
    onEdgesChange(changes);
  }, [onEdgesChange]);

  // 노드 삭제 핸들러
  const handleDeleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    setSelectedNode(null);
    setIsModalEditMode(false);
    dispatch(addNotification({ _id: Date.now().toString(), message: 'Node deleted.', type: 'info' }));
  }, [setNodes, setEdges, dispatch]);

  if (status === 'pending') return <div className="p-4 text-center">Loading tree...</div>;
  if (status === 'failed') return <div className="p-4 text-center text-red-500">Error loading tree: {error}</div>;
  if (!tree) return <div className="p-4 text-center">Tree not found.</div>; // Handle case where tree is null after loading attempt

  return (
    <div className="tree-edit-container h-[calc(100vh-60px)] p-2 sm:p-4 w-full max-w-full overflow-x-auto">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onNodeDoubleClick={onNodeDoubleClick}
        onDoubleClick={handlePaneDoubleClick}
        onInit={setReactFlowInstance}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        deleteKeyCode={['Backspace', 'Delete']}
        className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg min-w-0"
      >
        <Background color="#aaa" gap={16} />
        <Controls />
        <Panel position="top-right">
          <div className="flex flex-col sm:flex-row flex-wrap gap-2 p-2 bg-white rounded-lg shadow min-w-0">
            <button
              onClick={handleAddCustomNode}
              className="w-full sm:w-auto py-2 px-4 text-base bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              title="노드 추가"
            >
              노드 추가
            </button>
            <button
              onClick={onSaveTree}
              className="w-full sm:w-auto py-2 px-4 text-base bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              title="트리 저장"
            >
              트리 저장
            </button>
            <button
              onClick={() => navigate(`/trees/${id}`)}
              className="w-full sm:w-auto py-2 px-4 text-base bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
              title="트리 보기"
            >
              트리 보기
            </button>
          </div>
        </Panel>
      </ReactFlow>

      {/* Node Detail Modal */}
      {selectedNode && (
        <NodeDetailModal
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
          onSave={handleSaveNodeData}
          isEdit={isModalEditMode}
          onToggleEdit={() => setIsModalEditMode((prev) => !prev)}
          onDelete={handleDeleteNode}
        />
      )}
    </div>
  );
};

// --- Export Default ---
// This MUST be at the end of the file
export default TreeEdit;