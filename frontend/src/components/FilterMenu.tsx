import { useState, useRef, useEffect } from 'react'

interface FilterOption {
  label: string
  value: string
}

interface FilterMenuProps {
  filters: {
    status?: {
      value: string
      onChange: (value: string) => void
      options: FilterOption[]
    }
    severity?: {
      value: string
      onChange: (value: string) => void
      options: FilterOption[]
    }
    assignedTo?: {
      value: number | null
      onChange: (value: number | null) => void
      options: Array<{ id: number; full_name: string }>
    }
    author?: {
      value: number | null
      onChange: (value: number | null) => void
      options: Array<{ id: number; full_name: string }>
    }
  }
  onClearFilters?: () => void
}

const FilterMenu = ({ filters, onClearFilters }: FilterMenuProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [alignRight, setAlignRight] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Calculate dropdown position to prevent viewport overflow
  useEffect(() => {
    if (isOpen && menuRef.current && dropdownRef.current) {
      const buttonRect = menuRef.current.getBoundingClientRect()
      const dropdownWidth = 250 // minWidth from dropdown style
      const viewportWidth = window.innerWidth
      const spaceOnRight = viewportWidth - buttonRect.right
      const spaceOnLeft = buttonRect.left

      // If there's not enough space on the right, align to the right
      if (spaceOnRight < dropdownWidth && spaceOnLeft >= dropdownWidth) {
        setAlignRight(true)
      } else {
        setAlignRight(false)
      }
    }
  }, [isOpen])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const hasActiveFilters = () => {
    return (
      filters.status?.value !== '' ||
      filters.severity?.value !== '' ||
      filters.assignedTo?.value !== null ||
      filters.author?.value !== null
    )
  }

  const handleClearFilters = () => {
    filters.status?.onChange('')
    filters.severity?.onChange('')
    filters.assignedTo?.onChange(null)
    filters.author?.onChange(null)
    onClearFilters?.()
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: hasActiveFilters() ? '#007bff' : '#6c757d',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.875rem'
        }}
      >
        <span>Filters</span>
        {hasActiveFilters() && (
          <span style={{
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            borderRadius: '50%',
            width: '18px',
            height: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            fontWeight: 'bold'
          }}>
            !
          </span>
        )}
        <span>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div 
          ref={dropdownRef}
          style={{
            position: 'absolute',
            top: '100%',
            ...(alignRight ? { right: 0 } : { left: 0 }),
            marginTop: '0.5rem',
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            padding: '1rem',
            minWidth: '250px',
            maxWidth: 'calc(100vw - 2rem)',
            zIndex: 1000
          }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            paddingBottom: '0.75rem',
            borderBottom: '1px solid #eee'
          }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>Filter Options</h3>
            {hasActiveFilters() && (
              <button
                onClick={handleClearFilters}
                style={{
                  padding: '0.25rem 0.5rem',
                  backgroundColor: 'transparent',
                  color: '#007bff',
                  border: '1px solid #007bff',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.75rem'
                }}
              >
                Clear All
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Status Filter */}
            {filters.status && (
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}>
                  By Status
                </label>
                <select
                  value={filters.status.value}
                  onChange={(e) => {
                    filters.status!.onChange(e.target.value)
                    setIsOpen(false)
                  }}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    backgroundColor: 'white',
                    color: '#333',
                    fontSize: '0.875rem'
                  }}
                >
                  {filters.status.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Severity Filter */}
            {filters.severity && (
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}>
                  By Severity
                </label>
                <select
                  value={filters.severity.value}
                  onChange={(e) => {
                    filters.severity!.onChange(e.target.value)
                    setIsOpen(false)
                  }}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    backgroundColor: 'white',
                    color: '#333',
                    fontSize: '0.875rem'
                  }}
                >
                  {filters.severity.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Assigned To Filter */}
            {filters.assignedTo && (
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}>
                  Assigned To
                </label>
                <select
                  value={filters.assignedTo.value || ''}
                  onChange={(e) => {
                    filters.assignedTo!.onChange(e.target.value ? parseInt(e.target.value) : null)
                    setIsOpen(false)
                  }}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    backgroundColor: 'white',
                    color: '#333',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="">All Users</option>
                  {filters.assignedTo.options.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.full_name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Author Filter */}
            {filters.author && (
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}>
                  By Author
                </label>
                <select
                  value={filters.author.value || ''}
                  onChange={(e) => {
                    filters.author!.onChange(e.target.value ? parseInt(e.target.value) : null)
                    setIsOpen(false)
                  }}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    backgroundColor: 'white',
                    color: '#333',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="">All Authors</option>
                  {filters.author.options.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.full_name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default FilterMenu
