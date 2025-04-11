import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { fetchNodes } from '@/features/tree/treeSlice';
import TreeList from '@/components/TreeList';
import SearchBar from '@/components/SearchBar';
import Loading from '@/components/Loading';

const Home = () => {
  const dispatch = useDispatch();
  const { nodes, loading, error } = useSelector((state: RootState) => state.tree);

  useEffect(() => {
    dispatch(fetchNodes({}));
  }, [dispatch]);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="text-center text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Love Tree에 오신 것을 환영합니다
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          당신의 특별한 순간을 기록하고 공유하세요
        </p>
      </div>

      <SearchBar />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {nodes.map((node) => (
          <TreeList key={node._id} node={node} />
        ))}
      </div>

      {nodes.length === 0 && (
        <div className="text-center text-gray-500 py-10">
          <p>아직 등록된 트리가 없습니다.</p>
          <p>첫 번째 트리를 만들어보세요!</p>
        </div>
      )}
    </div>
  );
};

export default Home; 