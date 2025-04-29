import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import { getLogoImage } from '@/utils/imageUtils';

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 pt-12 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">서비스</h2>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-600 hover:text-gray-900">
                  홈
                </Link>
              </li>
              <li>
                <Link to="/explore" className="text-gray-600 hover:text-gray-900">
                  탐색
                </Link>
              </li>
              <li>
                <Link to="/trending" className="text-gray-600 hover:text-gray-900">
                  인기
                </Link>
              </li>
              <li>
                <Link to="/recent" className="text-gray-600 hover:text-gray-900">
                  최신
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
                <Link to="/help#faq" className="text-gray-600 hover:text-gray-900">
                  자주 묻는 질문
                </Link>
              </li>
              <li>
                <Link to="/help#contact" className="text-gray-600 hover:text-gray-900">
                  문의하기
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">법적 고지</h2>
            <ul className="space-y-3">
              <li>
                <Link to="/help#privacy" className="text-gray-600 hover:text-gray-900">
                  개인정보처리방침
                </Link>
              </li>
              <li>
                <Link to="/help#terms" className="text-gray-600 hover:text-gray-900">
                  이용약관
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="flex items-center mb-4">
              <img src={getLogoImage()} alt="Love Tree 로고" className="h-8 w-8 rounded-full mr-2" />
              <span className="text-xl font-bold text-green-600">Love Tree</span>
            </div>
            <p className="text-gray-600">
              Love Tree에서 당신의 사랑과 추억을 나무에 새겨보세요.
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-gray-500 hover:text-blue-600" aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-blue-400" aria-label="Twitter">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-pink-600" aria-label="Instagram">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-red-600" aria-label="YouTube">
                <Youtube size={20} />
              </a>
            </div>
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