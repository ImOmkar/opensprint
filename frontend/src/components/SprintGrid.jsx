import SprintCard from "./SprintCard"

function SprintGrid({ sprints, onEdit, onDelete, onToggle }) {

  if (!sprints.length) {

    return (
      <div className="text-center text-gray-500 py-10">
        No sprints yet
      </div>
    )
  }

  return (

    <div className="grid gap-4">

      {sprints.map(sprint => (
        <SprintCard
          key={sprint._id}
          sprint={sprint}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggle={onToggle}
        />
      ))}

    </div>

  )
}

export default SprintGrid