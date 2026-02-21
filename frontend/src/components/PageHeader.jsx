function PageHeader({
    title,
    subtitle,
    actionLabel,
    onAction
  }) {
  
    return (
      <div className="
        flex
        flex-col sm:flex-row
        sm:items-center
        sm:justify-between
        gap-4
        mb-6
      ">
  
        {/* Left */}
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold">
            {title}
          </h2>
  
          {subtitle && (
            <p className="text-gray-500 text-sm">
              {subtitle}
            </p>
          )}
        </div>
  
        {/* Right action */}
        {actionLabel && (
          <button
            onClick={onAction}
            className="
              w-full sm:w-auto
              bg-green-500 hover:bg-green-400
              text-black
              px-4 py-2
              rounded-lg
              font-medium
              transition
            "
          >
            {actionLabel}
          </button>
        )}
  
      </div>
    )
  }
  
  export default PageHeader