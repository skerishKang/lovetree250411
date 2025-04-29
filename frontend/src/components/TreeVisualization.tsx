import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { RootState } from '../store';
import { TreeNode as TreeNodeType, DragItem } from '../types/tree';
import { fetchUserTree, deleteNode, updateNode } from '../features/tree/treeSlice';
import TreeNodeForm from './TreeNodeForm';
import { TreeStyleCustomizer, TreeStyle, defaultStyle } from './TreeStyleCustomizer';

type TreeLayout = 'vertical' | 'horizontal';

interface TreeVisualizationProps {
  userId: string;
}

const DraggableNode: React.FC<{
  node: TreeNodeType;
  level: number;
  style: TreeStyle;
  searchTerm: string;
  zoomLevel: number;
  layout: TreeLayout;
  onSelect: (node: TreeNodeType) => void;
  onEdit: (node: TreeNodeType) => void;
  onDelete: (nodeId: string) => void;
  onDrop: (item: DragItem, parentId?: string) => void;
  onToggleExpand: (nodeId: string) => void;
}> = ({ 
  node, 
  level, 
  style, 
  searchTerm, 
  zoomLevel, 
  layout,
  onSelect, 
  onEdit, 
  onDelete, 
  onDrop, 
  onToggleExpand 
}) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'node',
    item: { type: 'node', id: node._id, parentId: node.parent },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: 'node',
    drop: (item: DragItem) => {
      if (item.id !== node._id) {
        onDrop(item, node._id);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  const isMatch = searchTerm && (
    node.content.includes(searchTerm) ||
    (node.description && node.description.includes(searchTerm)) ||
    (node.tags && node.tags.some(tag => tag.includes(searchTerm)))
  );

  const stageColorMap = {
    'tree': style.stageColors.폴인럽 || '#4CAF50',
    'seed': style.stageColors.썸 || '#FFC107',
    'sprout': style.stageColors.입덕 || '#2196F3',
  };

  const nodeStyle = {
    ...(layout === 'vertical' 
      ? {
          marginLeft: `${level * style.levelIndent * zoomLevel}px`,
          marginBottom: `${style.nodeSpacing * zoomLevel}px`,
        }
      : {
          marginTop: `${level * style.levelIndent * zoomLevel}px`,
          marginRight: `${style.nodeSpacing * zoomLevel}px`,
          display: 'inline-block',
          verticalAlign: 'top',
        }
    ),
    padding: `${10 * zoomLevel}px`,
    border: '1px solid #ccc',
    borderRadius: `${style.nodeBorderRadius * zoomLevel}px`,
    cursor: 'move',
    opacity: isDragging ? 0.5 : 1,
    backgroundColor: isOver 
      ? '#f0f0f0' 
      : node.type === 'root' 
        ? style.nodeColors.root 
        : node.type === 'branch' 
          ? style.nodeColors.branch 
          : style.nodeColors.leaf,
    ...(isMatch && { backgroundColor: 'yellow' }),
    transform: `scale(${zoomLevel})`,
    transformOrigin: 'top left',
  };

  const titleStyle = {
    fontSize: `${style.fontSizes.title * zoomLevel}px`,
    color: '#000',
    fontWeight: 'bold',
  };

  const contentStyle = {
    fontSize: `${style.fontSizes.content * zoomLevel}px`,
  };

  const tagStyle = {
    fontSize: `${style.fontSizes.tag * zoomLevel}px`,
  };

  const stageStyle = {
    backgroundColor: node.stage ? stageColorMap[node.stage] : '#ccc',
    padding: `${2 * zoomLevel}px ${6 * zoomLevel}px`,
    borderRadius: `${4 * zoomLevel}px`,
    fontSize: `${style.fontSizes.tag * zoomLevel}px`,
  };

  return (
    <div ref={drop} style={{ 
      display: layout === 'vertical' ? 'block' : 'inline-block',
      width: layout === 'vertical' ? '100%' : 'auto'
    }}>
      <div ref={drag} style={nodeStyle}>
        <div className="flex justify-between items-start">
          <div onClick={() => onSelect(node)}>
            <div style={titleStyle}>{node.content}</div>
            {node.stage && <div style={stageStyle}>{node.stage}</div>}
          </div>
          <div className="flex space-x-2">
            {node.children && node.children.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleExpand(node._id);
                }}
                className="text-gray-600 hover:text-gray-800"
                style={{ fontSize: `${12 * zoomLevel}px` }}
              >
                {node.expanded ? (layout === 'vertical' ? '▼' : '▶') : (layout === 'vertical' ? '▶' : '▼')}
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(node);
              }}
              className="text-green-600 hover:text-green-800"
              style={{ fontSize: `${12 * zoomLevel}px` }}
            >
              ✎
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(node._id);
              }}
              className="text-red-600 hover:text-red-800"
              style={{ fontSize: `${12 * zoomLevel}px` }}
            >
              ×
            </button>
          </div>
        </div>
        {node.mediaUrl && (
          <div className="mt-2" style={{ maxWidth: `${300 * zoomLevel}px` }}>
            <img 
              src={node.mediaUrl} 
              alt={node.content} 
              className="rounded" 
              style={{ width: '100%', height: 'auto' }}
            />
          </div>
        )}
        {node.description && (
          <div className="mt-2" style={contentStyle}>{node.description}</div>
        )}
        <div className="mt-2 flex gap-2">
          {node.tags?.map((tag, index) => (
            <span 
              key={index} 
              style={tagStyle} 
              className="bg-blue-100 text-blue-800 px-2 py-1 rounded"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
      {node.expanded && node.children?.map(childId => {
        // childId가 문자열인 경우, 상태에서 해당 노드 찾기
        const child = typeof childId === 'string' 
          ? nodesWithIds[childId] 
          : childId;
          
        return child ? (
          <DraggableNode
            key={typeof child === 'string' ? child : child._id}
            node={typeof child === 'string' ? nodesWithIds[child] : child}
            level={level + 1}
            style={style}
            searchTerm={searchTerm}
            zoomLevel={zoomLevel}
            layout={layout}
            onSelect={onSelect}
            onEdit={onEdit}
            onDelete={onDelete}
            onDrop={onDrop}
            onToggleExpand={onToggleExpand}
          />
        ) : null;
      })}
    </div>
  );
};

const TreeVisualization: React.FC<TreeVisualizationProps> = ({ userId }) => {
  const dispatch = useDispatch<any>();
  const { nodes, status } = useSelector((state: RootState) => state.trees);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNode, setSelectedNode] = useState<TreeNodeType | null>(null);
  const [formMode, setFormMode] = useState<'add' | 'edit' | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [layout, setLayout] = useState<TreeLayout>('vertical');
  const [treeStyle, setTreeStyle] = useState<TreeStyle>(defaultStyle);
  const [expandedNodeIds, setExpandedNodeIds] = useState<Set<string>>(new Set());
  
  // 노드 ID로 빠르게 접근하기 위한 맵 생성
  const nodesWithIds: Record<string, TreeNodeType> = {};
  nodes.forEach(node => {
    nodesWithIds[node._id] = node;
  });
  
  useEffect(() => {
    if (userId) {
      dispatch(fetchUserTree(userId));
    }
  }, [dispatch, userId]);

  const handleCreateNode = (parentId?: string) => {
    setFormMode('add');
    setSelectedNode(parentId ? nodesWithIds[parentId] : null);
  };

  const handleEditNode = (node: TreeNodeType) => {
    setFormMode('edit');
    setSelectedNode(node);
  };

  const handleDeleteNode = async (nodeId: string) => {
    if (window.confirm('정말로 이 노드를 삭제하시겠습니까?')) {
      await dispatch(deleteNode(nodeId));
    }
  };

  const handleDrop = async (item: DragItem, newParentId?: string) => {
    if (item.parentId !== newParentId) {
      await dispatch(updateNode({
        nodeId: item.id,
        data: { parent: newParentId }
      }));
    }
  };

  const handleToggleExpand = (nodeId: string) => {
    setExpandedNodeIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  // 확장 상태를 포함한 노드 구조 생성
  const getNodeWithExpanded = (node: TreeNodeType): TreeNodeType => {
    return {
      ...node,
      expanded: expandedNodeIds.has(node._id),
      children: node.children || []
    };
  };

  // 확장 상태가 포함된 노드 목록
  const nodesWithExpanded = nodes.map(getNodeWithExpanded);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setZoomLevel(parseFloat(e.target.value));
  };

  const handleLayoutChange = () => {
    setLayout(prev => prev === 'vertical' ? 'horizontal' : 'vertical');
  };

  if (status === 'loading') {
    return <div>로딩 중...</div>;
  }

  if (status === 'error') {
    return <div>에러가 발생했습니다. 다시 시도해주세요.</div>;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-4">
        <div className="mb-4 flex flex-wrap gap-4 items-center">
          <button
            onClick={() => handleCreateNode()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            루트 노드 추가
          </button>
          <div>
            <label htmlFor="search" className="mr-2">검색:</label>
            <input
              id="search"
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              className="border px-2 py-1 rounded"
              placeholder="검색어 입력..."
            />
          </div>
          <div>
            <label htmlFor="zoom" className="mr-2">확대/축소:</label>
            <input
              id="zoom"
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={zoomLevel}
              onChange={handleZoomChange}
              className="w-32"
            />
            <span className="ml-2">{zoomLevel.toFixed(1)}x</span>
          </div>
          <button
            onClick={handleLayoutChange}
            className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
          >
            {layout === 'vertical' ? '가로 배치로 변경' : '세로 배치로 변경'}
          </button>
          <TreeStyleCustomizer
            style={treeStyle}
            onChange={setTreeStyle}
          />
        </div>
        
        <div className={`tree-visualization ${layout === 'horizontal' ? 'flex' : 'block'}`}>
          {nodesWithExpanded.map(node => (
            <DraggableNode
              key={node._id}
              node={node}
              level={0}
              style={treeStyle}
              searchTerm={searchTerm}
              zoomLevel={zoomLevel}
              layout={layout}
              onSelect={() => handleCreateNode(node._id)}
              onEdit={handleEditNode}
              onDelete={handleDeleteNode}
              onDrop={handleDrop}
              onToggleExpand={handleToggleExpand}
            />
          ))}
        </div>
        
        {formMode && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg max-w-xl w-full">
              <h2 className="text-xl mb-4">
                {formMode === 'add' 
                  ? selectedNode 
                    ? `'${selectedNode.content}' 노드 아래에 추가` 
                    : '루트 노드 추가' 
                  : '노드 편집'
                }
              </h2>
              <TreeNodeForm
                node={formMode === 'edit' ? selectedNode : undefined}
                parentId={formMode === 'add' && selectedNode ? selectedNode._id : undefined}
                onCancel={() => {
                  setFormMode(null);
                  setSelectedNode(null);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
};

export default TreeVisualization; 