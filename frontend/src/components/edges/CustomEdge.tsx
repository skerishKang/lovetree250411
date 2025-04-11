import React, { memo } from 'react';
import { EdgeProps, getBezierPath } from 'reactflow';

// 엣지 색상 매핑
export const edgeColors = {
  gray: '#9CA3AF',
  pink: '#EC4899',
  blue: '#3B82F6',
  green: '#10B981',
  purple: '#8B5CF6',
  orange: '#F97316'
};

// 엣지 스타일 매핑
const edgeStyles = {
  solid: 'none',
  dashed: '5 5',
  dotted: '2 2'
};

const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  style = {},
  markerEnd,
}: EdgeProps) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const color = edgeColors[data?.color || 'gray'];
  const strokeDasharray = edgeStyles[data?.style || 'solid'];
  const strokeWidth = data?.thickness || 2;

  return (
    <path
      id={id}
      style={{
        ...style,
        strokeWidth,
        stroke: color,
        strokeDasharray,
      }}
      className="react-flow__edge-path"
      d={edgePath}
      markerEnd={markerEnd}
    />
  );
};

export default memo(CustomEdge); 