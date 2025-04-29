import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { register as registerUser } from '@features/auth/authSlice';
import { RootState } from '@/store';

interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const Register = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const onSubmit = async (data: RegisterForm) => {
    if (data.password !== data.confirmPassword) {
      console.log('비밀번호 불일치');
      return;
    }

    try {
      const { confirmPassword, ...registerData } = data;
      console.log('회원가입 시도:', registerData);
      await dispatch(registerUser(registerData)).unwrap();
      console.log('회원가입 성공');
      navigate('/');
    } catch (error) {
      console.error('회원가입 실패:', error);
    }
  };

  return (
    <div className="register-container min-h-screen w-full max-w-full p-2 sm:p-4 overflow-x-auto">
      <div className="bg-white rounded-lg shadow p-4 w-full max-w-md mx-auto flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-center mb-8">회원가입</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              사용자 이름
            </label>
            <input
              type="text"
              id="username"
              {...register('username', {
                required: '사용자 이름을 입력해주세요',
                minLength: {
                  value: 2,
                  message: '사용자 이름은 최소 2자 이상이어야 합니다',
                },
              })}
              className="w-full py-2 px-4 text-base border rounded-lg focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              이메일
            </label>
            <input
              type="email"
              id="email"
              {...register('email', {
                required: '이메일을 입력해주세요',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: '올바른 이메일 주소를 입력해주세요',
                },
              })}
              className="w-full py-2 px-4 text-base border rounded-lg focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              비밀번호
            </label>
            <input
              type="password"
              id="password"
              {...register('password', {
                required: '비밀번호를 입력해주세요',
                minLength: {
                  value: 6,
                  message: '비밀번호는 최소 6자 이상이어야 합니다',
                },
              })}
              className="w-full py-2 px-4 text-base border rounded-lg focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              비밀번호 확인
            </label>
            <input
              type="password"
              id="confirmPassword"
              {...register('confirmPassword', {
                required: '비밀번호를 다시 입력해주세요',
                validate: (value) =>
                  value === watch('password') || '비밀번호가 일치하지 않습니다',
              })}
              className="w-full py-2 px-4 text-base border rounded-lg focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto py-2 px-4 text-base bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            {loading ? '가입 중...' : '가입하기'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register; 