function ConfirmModal({
    isOpen,
    title,
    message,
    confirmText = "Delete",
    cancelText = "Cancel",
    onConfirm,
    onCancel
  }) {
    if (!isOpen) return null
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
  
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-md">
  
          <h2 className="text-lg font-bold text-white mb-3">
            {title}
          </h2>
  
          <p className="text-gray-400 mb-6">
            {message}
          </p>
  
          <div className="flex justify-end gap-3">
  
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-600"
            >
              {cancelText}
            </button>
  
            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded bg-red-500 text-black font-semibold hover:bg-red-400"
            >
              {confirmText}
            </button>
  
          </div>
  
        </div>
  
      </div>
    )
  }
  
  export default ConfirmModal