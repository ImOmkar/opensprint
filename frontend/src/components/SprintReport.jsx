import React from "react"

function SprintReport({ sprint, dives, username, streak }) {
  return (
    <div
      id="sprint-report"
      className="w-[800px] bg-white text-black p-12 font-sans"
    >

      {/* Header */}
      <div className="border-b pb-6 mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {sprint.title}
        </h1>
        <p className="text-gray-700 mb-2">
          {sprint.goal}
        </p>
        {sprint.description && (
          <p className="text-gray-600">
            {sprint.description}
          </p>
        )}
        <div className="text-sm text-gray-500 mt-4">
          Created by @{username}
        </div>
      </div>

      {/* Deep Dives */}
      {dives.map((dive, index) => (
        <div key={dive._id} className="mb-10">

          <h2 className="text-xl font-semibold mb-4 border-l-4 border-purple-600 pl-3">
            {index + 1}. {dive.title}
          </h2>

          {dive.problem && (
            <>
              <h3 className="font-semibold mt-4 mb-1">Problem</h3>
              <p className="text-gray-800 whitespace-pre-wrap">
                {dive.problem}
              </p>
            </>
          )}

          {dive.hypothesis && (
            <>
              <h3 className="font-semibold mt-4 mb-1">Hypothesis</h3>
              <p className="text-gray-800 whitespace-pre-wrap">
                {dive.hypothesis}
              </p>
            </>
          )}

          {dive.tests && (
            <>
              <h3 className="font-semibold mt-4 mb-1">Tests</h3>
              <p className="text-gray-800 whitespace-pre-wrap">
                {dive.tests}
              </p>
            </>
          )}

          {dive.conclusion && (
            <>
              <h3 className="font-semibold mt-4 mb-1">Conclusion</h3>
              <p className="text-gray-800 whitespace-pre-wrap">
                {dive.conclusion}
              </p>
            </>
          )}

        </div>
      ))}

      {/* Footer */}
      <div className="border-t pt-6 text-sm text-gray-500">
        Generated via OpenSprint • {new Date().toDateString()}
        {streak > 0 && ` • 🔥 ${streak} Day Streak`}
      </div>

    </div>
  )
}

export default SprintReport