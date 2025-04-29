<div className="toast-container fixed bottom-4 right-4 z-50 space-y-2" role="status" aria-live="polite">
  {toasts.map((toast) => (
    <div key={toast.id} className="toast bg-white shadow-lg rounded-lg px-4 py-3 flex items-center space-x-3">
      <span className="flex-1">{toast.message}</span>
      <button
        className="ml-2 p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
        aria-label="토스트 닫기"
        tabIndex={0}
        role="button"
        onClick={() => removeToast(toast.id)}
      >
        <X className="w-6 h-6" />
      </button>
    </div>
  ))}
</div> 