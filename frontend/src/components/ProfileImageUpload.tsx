import { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfileImage } from '../features/user/userSlice';
import { RootState } from '../features/store';

interface ProfileImageUploadProps {
  currentImage: string;
  onImageUpdate?: (imageUrl: string) => void;
}

const ProfileImageUpload = ({ currentImage, onImageUpdate }: ProfileImageUploadProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch();
  const { loading } = useSelector((state: RootState) => state.user);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const result = await dispatch(updateProfileImage(formData)).unwrap();
      setPreview(null);
      if (onImageUpdate) {
        onImageUpdate(result.profileImage);
      }
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <img
          src={preview || currentImage || 'https://via.placeholder.com/150'}
          alt="프로필"
          className="w-32 h-32 rounded-full object-cover"
          loading="lazy"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageChange}
        accept="image/*"
        className="hidden"
      />
      {preview && (
        <button
          onClick={handleUpload}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
        >
          {loading ? '업로드 중...' : '업로드'}
        </button>
      )}
    </div>
  );
};

export default ProfileImageUpload; 