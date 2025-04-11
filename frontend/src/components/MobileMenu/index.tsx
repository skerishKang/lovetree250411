import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-50 lg:hidden"
        onClose={onClose}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 z-40 flex">
          <Transition.Child
            as={Fragment}
            enter="transition ease-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <Dialog.Panel className="relative flex w-full max-w-xs flex-col overflow-y-auto bg-white pb-12 shadow-xl">
              <div className="flex px-4 pb-2 pt-5">
                <button
                  type="button"
                  className="-m-2 inline-flex items-center justify-center rounded-md p-2 text-gray-400"
                  onClick={onClose}
                >
                  <span className="sr-only">Close menu</span>
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-6 border-t border-gray-200 px-4 py-6">
                <div className="flow-root">
                  <Link
                    to="/explore"
                    className="-m-2 block p-2 font-medium text-gray-900"
                    onClick={onClose}
                  >
                    탐색
                  </Link>
                </div>
                <div className="flow-root">
                  <Link
                    to="/trending"
                    className="-m-2 block p-2 font-medium text-gray-900"
                    onClick={onClose}
                  >
                    인기
                  </Link>
                </div>
                <div className="flow-root">
                  <Link
                    to="/recent"
                    className="-m-2 block p-2 font-medium text-gray-900"
                    onClick={onClose}
                  >
                    최신
                  </Link>
                </div>
              </div>

              <div className="space-y-6 border-t border-gray-200 px-4 py-6">
                {user ? (
                  <>
                    <div className="flow-root">
                      <Link
                        to="/create"
                        className="-m-2 block p-2 font-medium text-gray-900"
                        onClick={onClose}
                      >
                        새 트리 만들기
                      </Link>
                    </div>
                    <div className="flow-root">
                      <Link
                        to="/profile"
                        className="-m-2 block p-2 font-medium text-gray-900"
                        onClick={onClose}
                      >
                        프로필
                      </Link>
                    </div>
                    <div className="flow-root">
                      <Link
                        to="/settings"
                        className="-m-2 block p-2 font-medium text-gray-900"
                        onClick={onClose}
                      >
                        설정
                      </Link>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flow-root">
                      <Link
                        to="/login"
                        className="-m-2 block p-2 font-medium text-gray-900"
                        onClick={onClose}
                      >
                        로그인
                      </Link>
                    </div>
                    <div className="flow-root">
                      <Link
                        to="/register"
                        className="-m-2 block p-2 font-medium text-gray-900"
                        onClick={onClose}
                      >
                        회원가입
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default MobileMenu; 