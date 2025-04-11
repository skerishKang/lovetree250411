import React from 'react';

export interface TreeStyle {
  nodeSpacing: number;
  levelIndent: number;
  nodeBorderRadius: number;
  nodeColors: {
    root: string;
    branch: string;
    leaf: string;
  };
  stageColors: {
    썸: string;
    입덕: string;
    팬심: string;
    폴인럽: string;
  };
  fontSizes: {
    title: number;
    content: number;
    tag: number;
  };
}

interface TreeStyleCustomizerProps {
  style: TreeStyle;
  onChange: (newStyle: TreeStyle) => void;
}

const defaultStyle: TreeStyle = {
  nodeSpacing: 10,
  levelIndent: 30,
  nodeBorderRadius: 5,
  nodeColors: {
    root: '#e3f2fd',
    branch: '#f3e5f5',
    leaf: '#f1f8e9'
  },
  stageColors: {
    썸: '#ffcdd2',
    입덕: '#f8bbd0',
    팬심: '#e1bee7',
    폴인럽: '#d1c4e9'
  },
  fontSizes: {
    title: 16,
    content: 14,
    tag: 12
  }
};

const TreeStyleCustomizer: React.FC<TreeStyleCustomizerProps> = ({
  style = defaultStyle,
  onChange
}) => {
  const handleChange = (
    category: keyof TreeStyle,
    subcategory: string,
    value: string | number
  ) => {
    const newStyle = { ...style };
    if (category === 'nodeColors' || category === 'stageColors' || category === 'fontSizes') {
      (newStyle[category] as any)[subcategory] = value;
    } else {
      (newStyle as any)[category] = value;
    }
    onChange(newStyle);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-bold mb-4">트리 스타일 설정</h3>
      
      <div className="space-y-6">
        {/* 기본 설정 */}
        <div>
          <h4 className="font-semibold mb-2">기본 설정</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700">노드 간격</label>
              <input
                type="range"
                min="5"
                max="30"
                value={style.nodeSpacing}
                onChange={(e) => handleChange('nodeSpacing', '', Number(e.target.value))}
                className="w-full"
              />
              <span className="text-sm text-gray-500">{style.nodeSpacing}px</span>
            </div>
            <div>
              <label className="block text-sm text-gray-700">레벨 들여쓰기</label>
              <input
                type="range"
                min="20"
                max="60"
                value={style.levelIndent}
                onChange={(e) => handleChange('levelIndent', '', Number(e.target.value))}
                className="w-full"
              />
              <span className="text-sm text-gray-500">{style.levelIndent}px</span>
            </div>
            <div>
              <label className="block text-sm text-gray-700">노드 모서리 둥글기</label>
              <input
                type="range"
                min="0"
                max="20"
                value={style.nodeBorderRadius}
                onChange={(e) => handleChange('nodeBorderRadius', '', Number(e.target.value))}
                className="w-full"
              />
              <span className="text-sm text-gray-500">{style.nodeBorderRadius}px</span>
            </div>
          </div>
        </div>

        {/* 노드 타입별 색상 */}
        <div>
          <h4 className="font-semibold mb-2">노드 타입별 색상</h4>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(style.nodeColors).map(([type, color]) => (
              <div key={type}>
                <label className="block text-sm text-gray-700">{type}</label>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => handleChange('nodeColors', type, e.target.value)}
                  className="w-full h-8 rounded"
                />
              </div>
            ))}
          </div>
        </div>

        {/* 단계별 색상 */}
        <div>
          <h4 className="font-semibold mb-2">단계별 색상</h4>
          <div className="grid grid-cols-4 gap-4">
            {Object.entries(style.stageColors).map(([stage, color]) => (
              <div key={stage}>
                <label className="block text-sm text-gray-700">{stage}</label>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => handleChange('stageColors', stage, e.target.value)}
                  className="w-full h-8 rounded"
                />
              </div>
            ))}
          </div>
        </div>

        {/* 글자 크기 */}
        <div>
          <h4 className="font-semibold mb-2">글자 크기</h4>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(style.fontSizes).map(([type, size]) => (
              <div key={type}>
                <label className="block text-sm text-gray-700">{type}</label>
                <input
                  type="range"
                  min="10"
                  max="24"
                  value={size}
                  onChange={(e) => handleChange('fontSizes', type, Number(e.target.value))}
                  className="w-full"
                />
                <span className="text-sm text-gray-500">{size}px</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export { TreeStyleCustomizer, defaultStyle };
export type { TreeStyle }; 