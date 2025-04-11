import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../app/store';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">Love Tree에 오신 것을 환영합니다</h1>
        <p className="text-xl text-gray-600 mb-8">
          당신만의 특별한 트리를 만들어보세요
        </p>
        
        <div className="space-y-4">
          {isAuthenticated ? (
            <div className="space-y-4">
              <button
                onClick={() => navigate('/trees')}
                className="px-8 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
              >
                내 트리 목록 보기
              </button>
              <div>
                <button
                  onClick={() => navigate('/trees/create')}
                  className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  새 트리 만들기
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
              >
                로그인
              </button>
              <div>
                <button
                  onClick={() => navigate('/register')}
                  className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  회원가입
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-12 bg-gray-50 p-8 rounded-lg">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Love Tree 소개</h2>
          <div className="text-gray-600 space-y-4">
            <p>
              Love Tree는 당신의 특별한 순간들을 기록하고 공유할 수 있는 공간입니다.
            </p>
            <p>
              사랑하는 사람들과 함께 성장하는 트리를 만들어보세요.
            </p>
            <p>
              소중한 추억들이 트리의 잎이 되어 영원히 기억될 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 