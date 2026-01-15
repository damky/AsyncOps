# Frontend Tests

This directory contains automated tests for the AsyncOps frontend React components.

## Setup

Install test dependencies:

```bash
cd frontend
npm install
```

## Running Tests

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm test -- --watch
```

Run tests with UI:
```bash
npm run test:ui
```

Run tests with coverage:
```bash
npm run test:coverage
```

## Test Structure

- `setup.ts` - Test configuration and global setup
- Component tests are located alongside components in `__tests__` directories

## Testing Library

We use:
- **Vitest** - Test runner (compatible with Vite)
- **React Testing Library** - Component testing utilities
- **@testing-library/jest-dom** - Custom matchers for DOM assertions
- **@testing-library/user-event** - User interaction simulation

## Writing Component Tests

1. Create a `__tests__` directory next to your component
2. Create a test file: `<ComponentName>.test.tsx`
3. Import testing utilities and your component
4. Mock any context providers or external dependencies
5. Test user interactions and component behavior

Example:
```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import MyComponent from '../MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

## Mocking

### Mocking Context
```tsx
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn()
}))
```

### Mocking API Calls
Use MSW (Mock Service Worker) for API mocking if needed, or mock the service functions directly.
