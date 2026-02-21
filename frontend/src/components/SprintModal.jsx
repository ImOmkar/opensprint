// function SprintModal({
//     isOpen,
//     onClose,
//     editingId,
//     title,
//     goal,
//     description,
//     setTitle,
//     setGoal,
//     setDescription,
//     onSubmit
//   }) {
  
//     if (!isOpen) return null
  
//     return (
//       <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
  
//         <div className="
//           bg-gray-900 border border-gray-800
//           rounded-xl
//           w-full max-w-lg
//           p-6
//           shadow-xl
//         ">
  
//           <div className="flex justify-between items-center mb-6">
  
//             <h2 className="text-lg font-semibold text-green-400">
//               {editingId ? "Update Sprint" : "Create Sprint"}
//             </h2>
  
//             <button
//               onClick={onClose}
//               className="text-gray-400 hover:text-white text-xl"
//             >
//               ×
//             </button>
  
//           </div>
  
//           <form
//             onSubmit={(e) => {
//               onSubmit(e)
//               onClose()
//             }}
//           >
  
//             <input
//               type="text"
//               placeholder="Sprint Title"
//               value={title}
//               onChange={(e) => setTitle(e.target.value)}
//               className="w-full mb-4 p-3 rounded bg-black border border-gray-700 focus:border-green-500 outline-none"
//               required
//             />
  
//             <textarea
//               placeholder="Sprint Goal"
//               value={goal}
//               onChange={(e) => setGoal(e.target.value)}
//               className="w-full mb-4 p-3 rounded bg-black border border-gray-700 focus:border-green-500 outline-none"
//               required
//             />
  
//             <textarea
//               placeholder="Description (optional)"
//               value={description}
//               onChange={(e) => setDescription(e.target.value)}
//               className="w-full mb-6 p-3 rounded bg-black border border-gray-700 focus:border-green-500 outline-none"
//             />
  
//             <div className="flex justify-end gap-3">
  
//               <button
//                 type="button"
//                 onClick={onClose}
//                 className="px-4 py-2 rounded border border-gray-700 text-gray-300 hover:border-gray-500"
//               >
//                 Cancel
//               </button>
  
//               <button
//                 type="submit"
//                 className="bg-green-500 hover:bg-green-400 text-black px-5 py-2 rounded font-medium"
//               >
//                 {editingId ? "Update" : "Create"}
//               </button>
  
//             </div>
  
//           </form>
  
//         </div>
  
//       </div>
//     )
//   }
  
//   export default SprintModal

import { useEffect, useState } from "react"

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

  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {

    const check = () => {
      setIsMobile(window.innerWidth < 768)
    }

    check()

    window.addEventListener("resize", check)

    return () => window.removeEventListener("resize", check)

  }, [])


  if (!isOpen) return null


  const handleSubmit = (e) => {
    onSubmit(e)
    onClose()
  }


  return (

    <div className="fixed inset-0 z-50">

      {/* overlay */}
      <div
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />


      {/* Desktop modal */}
      {!isMobile && (

        <div className="absolute inset-0 flex items-center justify-center p-4">

          <div className="
            bg-gray-900 border border-gray-800
            rounded-xl
            w-full max-w-lg
            p-6
            shadow-xl
          ">

            <Header editingId={editingId} onClose={onClose} />

            <SprintForm
              title={title}
              goal={goal}
              description={description}
              setTitle={setTitle}
              setGoal={setGoal}
              setDescription={setDescription}
              editingId={editingId}
              onClose={onClose}
              onSubmit={handleSubmit}
              stacked={false}
            />

          </div>

        </div>

      )}


      {/* Mobile bottom sheet */}
      {isMobile && (

        <div className="absolute bottom-0 left-0 right-0">

          <div className="
            bg-gray-900
            border-t border-gray-800
            rounded-t-2xl
            p-5
            max-h-[85vh]
            overflow-y-auto
            animate-slideUp
          ">

            {/* drag handle */}
            <div className="w-12 h-1.5 bg-gray-700 rounded-full mx-auto mb-4" />

            <Header editingId={editingId} onClose={onClose} />

            <SprintForm
              title={title}
              goal={goal}
              description={description}
              setTitle={setTitle}
              setGoal={setGoal}
              setDescription={setDescription}
              editingId={editingId}
              onClose={onClose}
              onSubmit={handleSubmit}
              stacked={true}
            />

          </div>

        </div>

      )}

    </div>

  )

}


function Header({ editingId, onClose }) {

  return (

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

  )

}


function SprintForm({
  title,
  goal,
  description,
  setTitle,
  setGoal,
  setDescription,
  editingId,
  onClose,
  onSubmit,
  stacked
}) {

  return (

    <form onSubmit={onSubmit}>

      <input
        type="text"
        placeholder="Sprint Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="
          w-full mb-4 p-3 rounded-lg
          bg-black border border-gray-700
          focus:border-green-500 outline-none
        "
        required
      />

      <textarea
        placeholder="Sprint Goal"
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
        className="
          w-full mb-4 p-3 rounded-lg
          bg-black border border-gray-700
          focus:border-green-500 outline-none
        "
        rows={3}
        required
      />

      <textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="
          w-full mb-6 p-3 rounded-lg
          bg-black border border-gray-700
          focus:border-green-500 outline-none
        "
        rows={4}
      />


      {/* Buttons */}
      <div className={`flex gap-3 ${stacked ? "flex-col" : "justify-end"}`}>

        <button
          type="button"
          onClick={onClose}
          className="
            px-4 py-2
            rounded-lg
            border border-gray-700
            text-gray-300
            hover:border-gray-500
            hover:bg-gray-800
            transition
          "
        >
          Cancel
        </button>

        <button
          type="submit"
          className="
            bg-green-500 hover:bg-green-400
            text-black
            px-5 py-2
            rounded-lg
            font-medium
            transition
          "
        >
          {editingId ? "Update Sprint" : "Create Sprint"}
        </button>

      </div>

    </form>

  )

}


export default SprintModal