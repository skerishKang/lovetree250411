import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { updateProfile } from '@/features/auth/authSlice';
import { handleApiError } from '@/utils/apiError';
import { useForm } from 'react-hook-form';
import Loading from '@/components/Loading';

interface ProfileFormData {
  name: string;
  bio: string;
  profileImage?: FileList;
}

const Profile = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state: RootState) => state.auth);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    defaultValues: {
      name: user?.name || '',
      bio: user?.bio || '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setError(null);
      setSuccess(null);

      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('bio', data.bio);

      if (data.profileImage?.[0]) {
        formData.append('profileImage', data.profileImage[0]);
      }

      await dispatch(updateProfile({ userId: user!._id, profileData: formData }));
      setSuccess('프로필이 성공적으로 업데이트되었습니다.');
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError.message);
    }
  };

  if (loading || !user) {
    return <Loading />;
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">프로필 설정</h1>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-600 p-3 rounded-md mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label
            htmlFor="profileImage"
            className="block text-sm font-medium text-gray-700"
          >
            프로필 이미지
          </label>
          <div className="mt-1 flex items-center space-x-4">
            <img
              src={user.profileImage || '/default-avatar.png'}
              alt="프로필"
              className="h-12 w-12 rounded-full object-cover"
            />
            <input
              type="file"
              id="profileImage"
              accept="image/*"
              {...register('profileImage')}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            이름
          </label>
          <input
            type="text"
            id="name"
            {...register('name', {
              required: '이름을 입력해주세요',
              minLength: {
                value: 2,
                message: '이름은 최소 2자 이상이어야 합니다',
              },
            })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="bio"
            className="block text-sm font-medium text-gray-700"
          >
            소개
          </label>
          <textarea
            id="bio"
            rows={4}
            {...register('bio')}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-primary py-2 px-4 text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
          >
            {isSubmitting ? '저장 중...' : '저장'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile; 