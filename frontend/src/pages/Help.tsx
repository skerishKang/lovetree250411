import { useState } from 'react';

const Help = () => {
  const [activeTab, setActiveTab] = useState<'faq' | 'contact' | 'privacy' | 'terms'>('faq');

  const faqs = [
    {
      question: 'LoveTree는 어떤 서비스인가요?',
      answer: 'LoveTree는 K-pop 팬들이 자신의 아이돌에 대한 사랑을 트리 형태로 표현하고 공유할 수 있는 플랫폼입니다. 각 트리는 노드로 구성되어 있으며, 각 노드에는 텍스트, 이미지, 링크 등을 추가할 수 있습니다.'
    },
    {
      question: '트리를 만드는 방법은 무엇인가요?',
      answer: '1. "새 트리 만들기" 버튼을 클릭합니다.\n2. 트리의 이름과 설명을 입력합니다.\n3. 트리 편집 페이지에서 노드를 추가하고 내용을 작성합니다.\n4. 저장 버튼을 클릭하여 트리를 저장합니다.'
    },
    {
      question: '트리를 공개/비공개로 설정하는 방법은 무엇인가요?',
      answer: '트리 생성 시 "공개 트리로 만들기" 옵션을 선택하거나, 트리 편집 페이지에서 설정을 변경할 수 있습니다. 비공개 트리는 작성자와 공동 편집자만 볼 수 있습니다.'
    },
    {
      question: '다른 사용자의 트리를 공유하는 방법은 무엇인가요?',
      answer: '트리 상세 페이지에서 공유 버튼을 클릭하면 트리의 URL을 복사하거나 소셜 미디어에 공유할 수 있습니다. 공개 트리만 공유가 가능합니다.'
    }
  ];

  return (
    <div className="help-container min-h-screen w-full max-w-full p-2 sm:p-4 overflow-x-auto">
      <div className="bg-white rounded-lg shadow p-4 w-full max-w-3xl mx-auto flex flex-col gap-4">
        <h1 className="text-2xl font-bold mb-6">도움말 센터</h1>

        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('faq')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'faq'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              자주 묻는 질문
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'contact'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              문의하기
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'privacy'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              개인정보 처리방침
            </button>
            <button
              onClick={() => setActiveTab('terms')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'terms'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              이용약관
            </button>
          </nav>
        </div>

        {activeTab === 'faq' && (
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
                <p className="text-gray-600 whitespace-pre-line">{faq.answer}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">문의하기</h2>
            <p className="text-gray-600">
              LoveTree에 대한 문의사항이나 피드백을 보내주세요. 최대한 빠르게 답변 드리겠습니다.
            </p>
            <div className="mt-4">
              <p className="font-medium">이메일</p>
              <p className="text-gray-600">support@lovetree.com</p>
            </div>
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">개인정보 처리방침</h2>
            <div className="space-y-4 text-gray-600">
              <p>
                LoveTree는 사용자의 개인정보 보호를 매우 중요하게 생각합니다. 본 개인정보 처리방침은 LoveTree가 사용자의 개인정보를 어떻게 수집, 사용, 보호하는지 설명합니다.
              </p>
              <h3 className="font-semibold text-gray-800">1. 수집하는 개인정보</h3>
              <ul className="list-disc pl-4 space-y-2">
                <li>이메일 주소</li>
                <li>사용자 이름</li>
                <li>프로필 이미지</li>
                <li>서비스 이용 기록</li>
              </ul>
              <h3 className="font-semibold text-gray-800">2. 개인정보의 사용</h3>
              <p>
                수집된 개인정보는 다음과 같은 목적으로 사용됩니다:
              </p>
              <ul className="list-disc pl-4 space-y-2">
                <li>서비스 제공 및 운영</li>
                <li>사용자 인증</li>
                <li>서비스 개선 및 개발</li>
                <li>고객 지원</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'terms' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">이용약관</h2>
            <div className="space-y-4 text-gray-600">
              <p>
                LoveTree 서비스를 이용하기 위해서는 본 이용약관에 동의해야 합니다. 본 약관은 LoveTree 서비스의 이용과 관련하여 필요한 사항을 규정합니다.
              </p>
              <h3 className="font-semibold text-gray-800">1. 서비스 이용</h3>
              <p>
                사용자는 LoveTree 서비스를 이용함에 있어 다음의 행위를 하지 않아야 합니다:
              </p>
              <ul className="list-disc pl-4 space-y-2">
                <li>타인의 개인정보를 무단으로 수집, 저장, 공개하는 행위</li>
                <li>서비스의 운영을 고의로 방해하는 행위</li>
                <li>타인의 지적재산권을 침해하는 행위</li>
                <li>기타 관련 법령에 위배되는 행위</li>
              </ul>
              <h3 className="font-semibold text-gray-800">2. 서비스 변경 및 중단</h3>
              <p>
                LoveTree는 서비스의 일부 또는 전부를 사전 예고 없이 변경하거나 중단할 수 있습니다.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Help; 