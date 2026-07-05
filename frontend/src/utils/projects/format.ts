export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'No activity yet'

  try {
    return new Intl.DateTimeFormat('en', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(dateString))
  } catch {
    return 'Invalid date'
  }
}

export const formatDateTime = (dateString: string | null | undefined): string => {
  if (!dateString) return 'No activity yet'

  try {
    return new Intl.DateTimeFormat('en', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString))
  } catch {
    return 'Invalid date'
  }
}

export const truncateText = (text: string, maxLength: number = 100): string => {
  if (!text) return ''
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}
