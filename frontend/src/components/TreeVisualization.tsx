import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { RootState } from '../store';
import { TreeNode, DragItem } from '../types/tree';
import { fetchUserTree, deleteNode, updateNode } from '../features/tree/treeSlice';
import TreeNodeForm from './TreeNodeForm';
import { TreeStyleCustomizer, TreeStyle, defaultStyle } from './TreeStyleCustomizer';

type TreeLayout = 'vertical' | 'horizontal';

interface TreeVisualizationProps {
  userId: string;
}

const DraggableNode: React.FC<{
  node: TreeNode;
  level: number;
  style: TreeStyle;
  searchTerm: string;
  zoomLevel: number;
  layout: TreeLayout;
  onSelect: (node: TreeNode) => void;
  onEdit: (node: TreeNode) => void;
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
      isDragging: monitor.isDragging(),
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
      isOver: monitor.isOver(),
    }),
  });

  const isMatch = searchTerm && (
    node.content.includes(searchTerm) ||
    (node.description && node.description.includes(searchTerm)) ||
    (node.tags && node.tags.some(tag => tag.includes(searchTerm)))
  );

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
    backgroundColor: style.stageColors[node.stage],
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
            <div style={stageStyle}>{node.stage}</div>
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
      {node.expanded && node.children?.map(child => (
        <DraggableNode
          key={child._id}
          node={child}
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
      ))}
    </div>
  );
};

const TreeVisualization: React.FC<TreeVisualizationProps> = ({ userId }) => {
  const dispatch = useDispatch();
  const { nodes, status } = useSelector((state: RootState) => state.tree);
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [parentId, setParentId] = useState<string | undefined>();
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const [showStyleCustomizer, setShowStyleCustomizer] = useState(false);
  const [treeStyle, setTreeStyle] = useState<TreeStyle>(defaultStyle);
  const [searchTerm, setSearchTerm] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [treeLayout, setTreeLayout] = useState<TreeLayout>('vertical');

  useEffect(() => {
    dispatch(fetchUserTree(userId));
  }, [dispatch, userId]);

  const handleCreateNode = (parentId?: string) => {
    setFormMode('create');
    setParentId(parentId);
    setShowForm(true);
  };

  const handleEditNode = (node: TreeNode) => {
    setFormMode('edit');
    setSelectedNode(node);
    setShowForm(true);
  };

  const handleDeleteNode = async (nodeId: string) => {
    if (window.confirm('정말로 이 노드를 삭제하시겠습니까?')) {
      await dispatch(deleteNode(nodeId));
    }
  };

  const handleDrop = async (item: DragItem, newParentId?: string) => {
    if (item.id && newParentId !== item.parentId) {
      await dispatch(updateNode({
        id: item.id,
        nodeData: { parent: newParentId }
      }));
    }
  };

  const handleToggleExpand = (nodeId: string) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  const getNodeWithExpanded = (node: TreeNode): TreeNode => {
    return {
      ...node,
      expanded: expandedNodes[node._id],
      children: node.children?.map(getNodeWithExpanded)
    };
  };

  const nodesWithExpanded = nodes.map(getNodeWithExpanded);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setZoomLevel(Number(e.target.value));
  };

  const handleLayoutChange = () => {
    setTreeLayout(prev => prev === 'vertical' ? 'horizontal' : 'vertical');
  };

  if (status === 'loading') {
    return <div>로딩 중...</div>;
  }

  if (status === 'failed') {
    return <div>트리를 불러오는데 실패했습니다.</div>;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-4">
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">나의 러브 트리</h2>
          <div className="flex space-x-2 items-center">
            <div className="flex items-center space-x-2">
              <label className="text-sm">확대/축소:</label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={zoomLevel}
                onChange={handleZoomChange}
                className="w-32"
              />
              <span className="text-sm">{Math.round(zoomLevel * 100)}%</span>
            </div>
            <button
              onClick={handleLayoutChange}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              {treeLayout === 'vertical' ? '수평 레이아웃' : '수직 레이아웃'}
            </button>
            <input
              type="text"
              placeholder="검색어 입력"
              value={searchTerm}
              onChange={handleSearch}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => setShowStyleCustomizer(!showStyleCustomizer)}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              {showStyleCustomizer ? '스타일 설정 닫기' : '스타일 설정'}
            </button>
            <button
              onClick={() => handleCreateNode()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              새 노드 생성
            </button>
          </div>
        </div>

        <div 
          className="flex gap-4"
          style={{ 
            flexDirection: treeLayout === 'vertical' ? 'column' : 'row',
            overflowX: treeLayout === 'horizontal' ? 'auto' : 'visible',
            overflowY: treeLayout === 'horizontal' ? 'visible' : 'auto'
          }}
        >
          <div className={`${showStyleCustomizer ? 'w-3/4' : 'w-full'}`}>
            <div 
              className="space-y-4"
              style={{ 
                display: treeLayout === 'vertical' ? 'block' : 'flex',
                flexWrap: treeLayout === 'horizontal' ? 'nowrap' : 'wrap'
              }}
            >
              {nodesWithExpanded.map(node => (
                <DraggableNode
                  key={node._id}
                  node={node}
                  level={0}
                  style={treeStyle}
                  searchTerm={searchTerm}
                  zoomLevel={zoomLevel}
                  layout={treeLayout}
                  onSelect={setSelectedNode}
                  onEdit={handleEditNode}
                  onDelete={handleDeleteNode}
                  onDrop={handleDrop}
                  onToggleExpand={handleToggleExpand}
                />
              ))}
            </div>
          </div>
          
          {showStyleCustomizer && (
            <div className="w-1/4">
              <TreeStyleCustomizer
                style={treeStyle}
                onChange={setTreeStyle}
              />
            </div>
          )}
        </div>

        {showForm && (
          <TreeNodeForm
            userId={userId}
            parentId={formMode === 'create' ? parentId : undefined}
            node={formMode === 'edit' ? selectedNode : undefined}
            onClose={() => {
              setShowForm(false);
              setSelectedNode(null);
              setParentId(undefined);
            }}
          />
        )}
      </div>
    </DndProvider>
  );
};

export default TreeVisualization; 