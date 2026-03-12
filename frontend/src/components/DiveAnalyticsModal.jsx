import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid
} from "recharts"

function DiveAnalyticsModal({ isOpen, onClose, analytics }) {

  if (!isOpen) return null

  const timelineData =
    analytics?.timeline?.map(item => ({
      date: item._id,
      views: item.count
    })) || []

  const sourceData =
    analytics?.sources?.map(item => ({
      source: item._id || "Direct",
      views: item.count
    })) || []

  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">

      <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-800">

          <h3 className="text-lg text-purple-400 font-semibold">
            Dive Analytics
          </h3>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            ×
          </button>

        </div>


        <div className="p-6 space-y-8">

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">

            <div className="bg-gray-950 border border-gray-800 rounded-lg p-4">

              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                Views
              </p>

              <p className="text-2xl font-bold text-white">
                {analytics?.views || 0}
              </p>

            </div>

            <div className="bg-gray-950 border border-gray-800 rounded-lg p-4">

              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                Readers
              </p>

              <p className="text-2xl font-bold text-white">
                {analytics?.readers || 0}
              </p>

            </div>

          </div>


          {/* Timeline Chart */}
          {/* <div>

            <p className="text-sm text-gray-400 mb-3">
              Traffic Over Time
            </p>

            <div className="h-64">

              <ResponsiveContainer width="100%" height="100%">

                <LineChart data={timelineData}>

                  <XAxis dataKey="date" stroke="#888" />
                  <YAxis stroke="#888" />

                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="views"
                    stroke="#a855f7"
                    strokeWidth={2}
                  />

                </LineChart>

              </ResponsiveContainer>

            </div>

          </div> */}

          <div>

            <p className="text-sm text-gray-400 mb-3">
            Traffic Over Time
            </p>

            <div className="h-64 bg-gray-950 border border-gray-800 rounded-lg">

            {timelineData.length === 0 ? (

                <div className="h-full flex items-center justify-center text-gray-500 text-sm text-center px-4">
                No analytics data yet.<br/>
                Check again after some time.
                </div>

            ) : (

                <ResponsiveContainer width="100%" height="100%">

                <LineChart data={timelineData}>

                    <XAxis dataKey="date" stroke="#888" />
                    <YAxis stroke="#888" />

                    <Tooltip />

                    <Line
                    type="monotone"
                    dataKey="views"
                    stroke="#a855f7"
                    strokeWidth={2}
                    />

                </LineChart>

                </ResponsiveContainer>

            )}

          </div>

            </div>

          {/* Traffic Sources */}
          {/* <div>

            <p className="text-sm text-gray-400 mb-3">
              Traffic Sources
            </p>

            <div className="h-64">

              <ResponsiveContainer width="100%" height="100%">

                <BarChart data={sourceData}>

                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />

                  <XAxis dataKey="source" stroke="#888" />

                  <YAxis stroke="#888" />

                  <Tooltip />

                  <Bar dataKey="views" fill="#22c55e" />

                </BarChart>

              </ResponsiveContainer>

            </div>

          </div> */}

          <div>

            <p className="text-sm text-gray-400 mb-3">
            Traffic Sources
            </p>

            <div className="h-64 bg-gray-950 border border-gray-800 rounded-lg">

            {sourceData.length === 0 ? (

                <div className="h-full flex items-center justify-center text-gray-500 text-sm text-center px-4">
                No traffic sources yet.<br/>
                Check again after some time.
                </div>

            ) : (

                <ResponsiveContainer width="100%" height="100%">

                <BarChart data={sourceData}>

                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />

                    <XAxis dataKey="source" stroke="#888" />
                    <YAxis stroke="#888" />

                    <Tooltip />

                    <Bar dataKey="views" fill="#22c55e" />

                </BarChart>

                </ResponsiveContainer>

            )}

            </div>

          </div>

        </div>

      </div>

    </div>

  )

}

export default DiveAnalyticsModal