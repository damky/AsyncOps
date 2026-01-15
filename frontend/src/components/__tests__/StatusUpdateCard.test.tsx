import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import StatusUpdateCard from '../StatusUpdateCard'
import { StatusUpdate } from '../../types/statusUpdate'

// Mock the AuthContext
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn()
}))

import { useAuth } from '../../contexts/AuthContext'

describe('StatusUpdateCard', () => {
  const mockStatusUpdate: StatusUpdate = {
    id: 1,
    title: 'Test Status Update',
    content: 'This is a test status update content',
    user_id: 1,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    tags: ['test', 'example'],
    user: {
      id: 1,
      email: 'test@example.com',
      full_name: 'Test User',
      role: 'member' as const,
      is_active: true,
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z'
    }
  }

  it('renders status update information', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 1, email: 'test@example.com', full_name: 'Test User', role: 'member' as const, is_active: true, created_at: '2024-01-15T10:00:00Z', updated_at: '2024-01-15T10:00:00Z' },
      token: 'test-token',
      login: vi.fn(),
      logout: vi.fn(),
      isAuthenticated: true,
      loading: false
    })

    render(<StatusUpdateCard status={mockStatusUpdate} />)

    expect(screen.getByText('Test Status Update')).toBeInTheDocument()
    expect(screen.getByText('This is a test status update content')).toBeInTheDocument()
    expect(screen.getByText('Test User')).toBeInTheDocument()
    expect(screen.getByText('#test')).toBeInTheDocument()
    expect(screen.getByText('#example')).toBeInTheDocument()
  })

  it('shows edit and delete buttons when user is the author', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 1, email: 'test@example.com', full_name: 'Test User', role: 'member' },
      login: vi.fn(),
      logout: vi.fn(),
      token: 'test-token',
      isAuthenticated: true,
      loading: false
    })

    const onEdit = vi.fn()
    const onDelete = vi.fn()

    render(
      <StatusUpdateCard
        status={mockStatusUpdate}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    )

    expect(screen.getByText('Edit')).toBeInTheDocument()
    expect(screen.getByText('Delete')).toBeInTheDocument()
  })

  it('does not show edit and delete buttons when user is not the author', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 2, email: 'other@example.com', full_name: 'Other User', role: 'member' as const, is_active: true, created_at: '2024-01-15T10:00:00Z', updated_at: '2024-01-15T10:00:00Z' },
      login: vi.fn(),
      logout: vi.fn(),
      token: 'test-token',
      isAuthenticated: true,
      loading: false
    })

    render(<StatusUpdateCard status={mockStatusUpdate} />)

    expect(screen.queryByText('Edit')).not.toBeInTheDocument()
    expect(screen.queryByText('Delete')).not.toBeInTheDocument()
  })

  it('calls onEdit when edit button is clicked', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 1, email: 'test@example.com', full_name: 'Test User', role: 'member' },
      login: vi.fn(),
      logout: vi.fn(),
      token: 'test-token',
      isAuthenticated: true,
      loading: false
    })

    const onEdit = vi.fn()
    const userEvent = await import('@testing-library/user-event')
    const user = userEvent.default.setup()

    render(
      <StatusUpdateCard
        status={mockStatusUpdate}
        onEdit={onEdit}
      />
    )

    const editButton = screen.getByText('Edit')
    await user.click(editButton)

    expect(onEdit).toHaveBeenCalledWith(mockStatusUpdate)
  })

  it('calls onDelete when delete button is clicked', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 1, email: 'test@example.com', full_name: 'Test User', role: 'member' },
      login: vi.fn(),
      logout: vi.fn(),
      token: 'test-token',
      isAuthenticated: true,
      loading: false
    })

    const onDelete = vi.fn()
    const userEvent = await import('@testing-library/user-event')
    const user = userEvent.default.setup()

    render(
      <StatusUpdateCard
        status={mockStatusUpdate}
        onDelete={onDelete}
      />
    )

    const deleteButton = screen.getByText('Delete')
    await user.click(deleteButton)

    expect(onDelete).toHaveBeenCalledWith(mockStatusUpdate.id)
  })

  it('renders without tags when tags array is empty', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 1, email: 'test@example.com', full_name: 'Test User', role: 'member' },
      login: vi.fn(),
      logout: vi.fn(),
      token: 'test-token',
      isAuthenticated: true,
      loading: false
    })

    const statusWithoutTags = {
      ...mockStatusUpdate,
      tags: []
    }

    render(<StatusUpdateCard status={statusWithoutTags} />)

    expect(screen.queryByText('#test')).not.toBeInTheDocument()
  })
})
