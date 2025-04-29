import React, { useState } from 'react';
import Layout from '../../components/layout/Layout';
import SearchBar from '../../components/shared/SearchBar';
import TabNavigation, { TabType } from '../../components/shared/TabNavigation';
import TreeGrid from '../../components/home/TreeCard/TreeGrid';
import { TreeCardProps } from '../../components/home/TreeCard/TreeCard';

const HomePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('trending');
  
  // 샘플 트리 데이터
  const sampleTrees: TreeCardProps[] = [
    { id: 1, username: 'felix_fan', starName: 'Felix', type: 'Kpop', likes: 245, nodes: 34, isPublic: true },
    { id: 2, username: 'drama_lover', starName: '오타니', type: '스포츠', likes: 182, nodes: 28, isPublic: true },
    { id: 3, username: 'newtron', starName: '뉴진스 하니', type: 'Kpop', likes: 312, nodes: 42, isPublic: true },
    { id: 4, username: 'anime_otaku', starName: '귀멸의 칼날', type: '애니메이션', likes: 167, nodes: 23, isPublic: true }
  ];
  
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    // TODO: 탭이 변경되면 해당 데이터를 API에서 가져오는 로직 추가
  };
  
  return (
    <Layout>
      <SearchBar />
      <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />
      <TreeGrid trees={sampleTrees} />
    </Layout>
  );
};

export default HomePage; 