import React, { ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store'; // 경로 별칭 사용
import Header from '@components/Header'; // 경로 별칭 사용
import Footer from '@components/Footer'; // 경로 별칭 사용
import Loading from '@components/Loading'; // 경로 별칭 사용

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  // ui 슬라이스가 스토어에 정의되어 있다고 가정합니다.
  // 만약 ui 슬라이스가 없다면 이 부분은 에러를 발생시킬 수 있습니다.
  // const { loading } = useSelector((state: RootState) => state.ui);
  const loading = false; // 임시로 false 설정, 추후 ui 슬라이스 확인 필요

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-6">
        {loading ? <Loading /> : children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
