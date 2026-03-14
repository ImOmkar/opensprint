// import { Link } from "react-router-dom"

// function ConceptRadar({ concepts = [] }) {

//   if (!concepts.length) return null

//   const max = Math.max(...concepts.map(c => c.count))

//   return (

//     <div className="
//       mb-6
//       bg-gray-900
//       border border-gray-800
//       rounded-xl
//       p-5
//     ">

//       <p className="text-sm text-gray-400 mb-4">
//         Concept Radar
//       </p>

//       <div className="
//         relative
//         h-64
//         overflow-hidden
//       ">

//         {concepts.map((c, i) => {

//           const size = 40 + (c.count / max) * 80

//           const top = Math.random() * 180
//           const left = Math.random() * 80

//           return (

//             <Link
//               key={c.concept}
//               to={`/search?concept=${encodeURIComponent(c.concept)}`}
//               style={{
//                 width: size,
//                 height: size,
//                 top,
//                 left: `${left}%`
//               }}
//               className="
//                 absolute
//                 rounded-full
//                 bg-purple-500/20
//                 border border-purple-500/40
//                 text-purple-300
//                 text-xs
//                 flex items-center justify-center
//                 hover:scale-110
//                 transition
//                 backdrop-blur
//               "
//             >
//               {c.concept}

//             </Link>

//           )

//         })}

//       </div>

//     </div>

//   )

// }

// export default ConceptRadar


import { Link } from "react-router-dom"
import { motion } from "framer-motion"

function ConceptRadar({ concepts = [] }) {

  if (!concepts.length) return null

  const max = Math.max(...concepts.map(c => c.count))

  const getColor = (count) => {

    const ratio = count / max

    if (ratio > 0.7) return "bg-purple-500/30 border-purple-400 text-purple-300"
    if (ratio > 0.4) return "bg-blue-500/30 border-blue-400 text-blue-300"
    if (ratio > 0.2) return "bg-green-500/30 border-green-400 text-green-300"

    return "bg-yellow-500/30 border-yellow-400 text-yellow-300"
  }

  return (

    <div className="
      mb-6
      bg-gray-900
      border border-gray-800
      rounded-xl
      p-5
    ">

      <p className="text-sm text-gray-400 mb-4">
        Concept Radar
      </p>

      <div className="
        relative
        h-72
        overflow-hidden
      ">

        {concepts.map((c, i) => {

          const size = 40 + (c.count / max) * 90

          const top = Math.random() * 60
          const left = Math.random() * 80

          return (

            <motion.div
              key={c.concept}
              initial={{ y: 0 }}
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 4 + Math.random() * 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                top: `${top}%`,
                left: `${left}%`,
                width: size,
                height: size
              }}
              className="absolute flex items-center justify-center"
            >

              <Link
                to={`/search?concept=${encodeURIComponent(c.concept)}`}
                className={`
                  ${getColor(c.count)}
                  rounded-full
                  border
                  flex items-center justify-center
                  text-xs
                  text-center
                  px-2
                  hover:scale-110
                  transition
                  backdrop-blur
                `}
                style={{
                  width: size,
                  height: size
                }}
              >
                {c.concept}
              </Link>

            </motion.div>

          )

        })}

      </div>

    </div>

  )

}

export default ConceptRadar