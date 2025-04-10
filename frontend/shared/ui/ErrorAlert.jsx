export default function ErrorAlert({ message }) {
  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded my-4">
      <p>{message || '오류가 발생했습니다. 다시 시도해주세요.'}</p>
    </div>
  );
} 