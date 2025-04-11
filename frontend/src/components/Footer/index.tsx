import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t py-10 mt-12" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">서비스</h2>
            <ul className="space-y-3">
              <li>
                <Link to="/explore" className="text-gray-600 hover:text-gray-900">
                  탐색하기
                </Link>
              </li>
              <li>
                <Link to="/trending" className="text-gray-600 hover:text-gray-900">
                  인기 트리
                </Link>
              </li>
              <li>
                <Link to="/latest" className="text-gray-600 hover:text-gray-900">
                  최신 트리
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">지원</h2>
            <ul className="space-y-3">
              <li>
                <Link to="/help" className="text-gray-600 hover:text-gray-900">
                  도움말
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-600 hover:text-gray-900">
                  자주 묻는 질문
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-600 hover:text-gray-900">
                  문의하기
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">법적 고지</h2>
            <ul className="space-y-3">
              <li>
                <Link to="/privacy" className="text-gray-600 hover:text-gray-900">
                  개인정보처리방침
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-600 hover:text-gray-900">
                  이용약관
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="flex items-center mb-4">
              <img src="/logo.svg" alt="Love Tree 로고" className="h-8 w-auto mr-2" />
              <span className="text-xl font-bold text-green-600">Love Tree</span>
            </div>
            <p className="text-gray-600">
              Love Tree에서 당신의 사랑과 추억을 나무에 새겨보세요.
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-center text-gray-500">
            © {new Date().getFullYear()} Love Tree. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 