// function ConfirmModal({
//     isOpen,
//     title,
//     message,
//     confirmText = "Delete",
//     cancelText = "Cancel",
//     onConfirm,
//     onCancel
//   }) {
//     if (!isOpen) return null
  
//     return (
//       <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
  
//         <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-md">
  
//           <h2 className="text-lg font-bold text-white mb-3">
//             {title}
//           </h2>
  
//           <p className="text-gray-400 mb-6">
//             {message}
//           </p>
  
//           <div className="flex justify-end gap-3">
  
//             <button
//               onClick={onCancel}
//               className="px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-600"
//             >
//               {cancelText}
//             </button>
  
//             <button
//               onClick={onConfirm}
//               className="px-4 py-2 rounded bg-red-500 text-black font-semibold hover:bg-red-400"
//             >
//               {confirmText}
//             </button>
  
//           </div>
  
//         </div>
  
//       </div>
//     )
//   }
  
//   export default ConfirmModal


import { useEffect, useState } from "react"

function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  onConfirm,
  onCancel
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


  return (

    <div className="fixed inset-0 z-50">

      {/* Overlay */}
      <div
        onClick={onCancel}
        className="absolute inset-0 bg-black/60"
      />


      {/* Desktop Modal */}
      {!isMobile && (

        <div className="absolute inset-0 flex items-center justify-center p-4">

          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md shadow-xl">

            <h2 className="text-lg font-semibold text-white mb-2">
              {title}
            </h2>

            <p className="text-gray-400 mb-6">
              {message}
            </p>

            <div className="flex justify-end gap-3">

              <button
                onClick={onCancel}
                className="px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-600 transition"
              >
                {cancelText}
              </button>

              <button
                onClick={onConfirm}
                className="px-4 py-2 rounded bg-red-500 text-black font-semibold hover:bg-red-400 transition"
              >
                {confirmText}
              </button>

            </div>

          </div>

        </div>

      )}


      {/* Mobile Bottom Sheet */}
      {isMobile && (

        <div className="absolute bottom-0 left-0 right-0">

          <div className="
            bg-gray-900
            border-t border-gray-800
            rounded-t-2xl
            p-6
            animate-slideUp
          ">

            {/* Drag Handle */}
            <div className="w-12 h-1.5 bg-gray-700 rounded-full mx-auto mb-4" />

            <h2 className="text-lg font-semibold text-white mb-2">
              {title}
            </h2>

            <p className="text-gray-400 mb-6">
              {message}
            </p>

            <div className="flex flex-col gap-3">

              <button
                onClick={onConfirm}
                className="
                  w-full
                  py-3
                  rounded-lg
                  bg-red-500
                  text-black
                  font-semibold
                  hover:bg-red-400
                  transition
                "
              >
                {confirmText}
              </button>

              <button
                onClick={onCancel}
                className="
                  w-full
                  py-3
                  rounded-lg
                  bg-gray-800
                  text-white
                  hover:bg-gray-700
                  transition
                "
              >
                {cancelText}
              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  )

}

export default ConfirmModal