function Spinner({ text = "Loading..." }) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
  
        <div className="w-8 h-8 border-4 border-green-400 border-t-transparent rounded-full animate-spin mb-3"></div>
  
        <p className="text-gray-400 text-sm">
          {text}
        </p>
  
      </div>
    )
  }
  
  export default Spinner