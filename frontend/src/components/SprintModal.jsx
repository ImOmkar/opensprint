function SprintModal({
    isOpen,
    onClose,
    editingId,
    title,
    goal,
    description,
    setTitle,
    setGoal,
    setDescription,
    onSubmit
  }) {
  
    if (!isOpen) return null
  
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
  
        <div className="
          bg-gray-900 border border-gray-800
          rounded-xl
          w-full max-w-lg
          p-6
          shadow-xl
        ">
  
          <div className="flex justify-between items-center mb-6">
  
            <h2 className="text-lg font-semibold text-green-400">
              {editingId ? "Update Sprint" : "Create Sprint"}
            </h2>
  
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-xl"
            >
              ×
            </button>
  
          </div>
  
          <form
            onSubmit={(e) => {
              onSubmit(e)
              onClose()
            }}
          >
  
            <input
              type="text"
              placeholder="Sprint Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full mb-4 p-3 rounded bg-black border border-gray-700 focus:border-green-500 outline-none"
              required
            />
  
            <textarea
              placeholder="Sprint Goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full mb-4 p-3 rounded bg-black border border-gray-700 focus:border-green-500 outline-none"
              required
            />
  
            <textarea
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full mb-6 p-3 rounded bg-black border border-gray-700 focus:border-green-500 outline-none"
            />
  
            <div className="flex justify-end gap-3">
  
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded border border-gray-700 text-gray-300 hover:border-gray-500"
              >
                Cancel
              </button>
  
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-400 text-black px-5 py-2 rounded font-medium"
              >
                {editingId ? "Update" : "Create"}
              </button>
  
            </div>
  
          </form>
  
        </div>
  
      </div>
    )
  }
  
  export default SprintModal