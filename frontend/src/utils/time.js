export function formatExactTime(iso) {
    const date = new Date(iso)
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }
  
  export function formatRelativeTime(iso) {
    const date = new Date(iso)
    const now = new Date()
  
    const seconds = Math.floor((now - date) / 1000)
  
    if (seconds < 60) return "just now"
  
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes} min ago`
  
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} hr ago`
  
    const days = Math.floor(hours / 24)
    if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`
  
    const months = Math.floor(days / 30)
    if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`
  
    const years = Math.floor(months / 12)
    return `${years} year${years > 1 ? "s" : ""} ago`
  }
  