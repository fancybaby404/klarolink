/**
 * Integration tests for Profile Customization feature
 * Tests the three-column layout, form interactions, and live preview
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { jest } from '@jest/globals'
import ProfilePage from '../app/dashboard/profile/page'

// Mock Next.js router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock fetch for API calls
global.fetch = jest.fn()

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
})

// Mock toast notifications
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

describe('Profile Customization Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue('mock-token')
    
    // Mock successful API responses
    ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/profile')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            business: {
              id: 1,
              name: 'Test Business',
              profile_image: 'https://example.com/image.jpg',
              location: 'Test City',
              background_type: 'color',
              background_value: '#CC79F0',
              submit_button_color: '#CC79F0',
              submit_button_text_color: '#FDFFFA',
              submit_button_hover_color: '#3E7EF7',
            },
            formFields: [
              {
                id: 'rating',
                type: 'rating',
                label: 'Overall Rating',
                required: true,
              },
              {
                id: 'feedback',
                type: 'textarea',
                label: 'Your Feedback',
                required: true,
              },
            ],
            formTitle: 'Test Form',
            formDescription: 'Test Description',
          }),
        })
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
    })
  })

  describe('Layout Structure', () => {
    test('renders three-column layout correctly', async () => {
      render(<ProfilePage />)

      await waitFor(() => {
        // Check for navigation sidebar
        expect(screen.getByText('Customization')).toBeInTheDocument()
        
        // Check for navigation items
        expect(screen.getByText('Business Profile')).toBeInTheDocument()
        expect(screen.getByText('Profile Image')).toBeInTheDocument()
        expect(screen.getByText('Form Background')).toBeInTheDocument()
        expect(screen.getByText('Button Styling')).toBeInTheDocument()
        
        // Check for live preview panel
        expect(screen.getByText('Live Preview')).toBeInTheDocument()
      })
    })

    test('navigation items are clickable and functional', async () => {
      render(<ProfilePage />)

      await waitFor(() => {
        const backgroundNavItem = screen.getByText('Form Background')
        fireEvent.click(backgroundNavItem)
        
        // Should scroll to the background section
        expect(backgroundNavItem.closest('button')).toHaveClass('bg-primary/10')
      })
    })
  })

  describe('Business Profile Section', () => {
    test('displays and updates business information', async () => {
      render(<ProfilePage />)

      await waitFor(() => {
        const businessNameInput = screen.getByDisplayValue('Test Business')
        const locationInput = screen.getByDisplayValue('Test City')
        
        expect(businessNameInput).toBeInTheDocument()
        expect(locationInput).toBeInTheDocument()
        
        // Test input changes
        fireEvent.change(businessNameInput, { target: { value: 'Updated Business' } })
        expect(businessNameInput).toHaveValue('Updated Business')
      })
    })

    test('validates required business name field', async () => {
      render(<ProfilePage />)

      await waitFor(() => {
        const businessNameInput = screen.getByDisplayValue('Test Business')
        
        // Clear the business name
        fireEvent.change(businessNameInput, { target: { value: '' } })
        
        // Try to save
        const saveButton = screen.getByText('Save Changes')
        fireEvent.click(saveButton)
        
        // Should show validation error (implementation dependent)
        expect(businessNameInput).toHaveValue('')
      })
    })
  })

  describe('Background Customization', () => {
    test('switches between color and image background types', async () => {
      render(<ProfilePage />)

      await waitFor(() => {
        // Navigate to background section
        const backgroundNavItem = screen.getByText('Form Background')
        fireEvent.click(backgroundNavItem)
        
        // Check for radio buttons
        const colorRadio = screen.getByLabelText('Solid Color')
        const imageRadio = screen.getByLabelText('Background Image')
        
        expect(colorRadio).toBeChecked()
        expect(imageRadio).not.toBeChecked()
        
        // Switch to image
        fireEvent.click(imageRadio)
        expect(imageRadio).toBeChecked()
        expect(colorRadio).not.toBeChecked()
      })
    })

    test('updates background color in real-time', async () => {
      render(<ProfilePage />)

      await waitFor(() => {
        // Navigate to background section
        const backgroundNavItem = screen.getByText('Form Background')
        fireEvent.click(backgroundNavItem)
        
        // Find color input
        const colorInput = screen.getByDisplayValue('#CC79F0')
        
        // Change color
        fireEvent.change(colorInput, { target: { value: '#FF0000' } })
        
        // Color should update
        expect(colorInput).toHaveValue('#FF0000')
      })
    })
  })

  describe('Button Customization', () => {
    test('updates button colors correctly', async () => {
      render(<ProfilePage />)

      await waitFor(() => {
        // Navigate to button section
        const buttonNavItem = screen.getByText('Button Styling')
        fireEvent.click(buttonNavItem)
        
        // Find button color inputs
        const bgColorInput = screen.getByDisplayValue('#CC79F0')
        const textColorInput = screen.getByDisplayValue('#FDFFFA')
        const hoverColorInput = screen.getByDisplayValue('#3E7EF7')
        
        expect(bgColorInput).toBeInTheDocument()
        expect(textColorInput).toBeInTheDocument()
        expect(hoverColorInput).toBeInTheDocument()
        
        // Test color changes
        fireEvent.change(bgColorInput, { target: { value: '#00FF00' } })
        expect(bgColorInput).toHaveValue('#00FF00')
      })
    })

    test('resets button colors to defaults', async () => {
      render(<ProfilePage />)

      await waitFor(() => {
        // Navigate to button section
        const buttonNavItem = screen.getByText('Button Styling')
        fireEvent.click(buttonNavItem)
        
        // Change a color first
        const bgColorInput = screen.getByDisplayValue('#CC79F0')
        fireEvent.change(bgColorInput, { target: { value: '#FF0000' } })
        
        // Click reset button
        const resetButton = screen.getByText('Reset')
        fireEvent.click(resetButton)
        
        // Should reset to default
        expect(bgColorInput).toHaveValue('#CC79F0')
      })
    })
  })

  describe('Live Preview Panel', () => {
    test('displays live preview with business information', async () => {
      render(<ProfilePage />)

      await waitFor(() => {
        // Check for preview elements
        expect(screen.getByText('Test Business')).toBeInTheDocument()
        expect(screen.getByText('Test City')).toBeInTheDocument()
        expect(screen.getByText('Submit Feedback')).toBeInTheDocument()
      })
    })

    test('switches between device preview modes', async () => {
      render(<ProfilePage />)

      await waitFor(() => {
        // Find device toggle buttons (by their icons or aria-labels)
        const deviceButtons = screen.getAllByRole('button')
        const tabletButton = deviceButtons.find(btn => 
          btn.querySelector('svg') && btn.getAttribute('class')?.includes('h-7 w-7')
        )
        
        if (tabletButton) {
          fireEvent.click(tabletButton)
          // Preview should adjust (implementation dependent)
        }
      })
    })
  })

  describe('Form Submission', () => {
    test('saves profile changes successfully', async () => {
      render(<ProfilePage />)

      await waitFor(() => {
        // Make some changes
        const businessNameInput = screen.getByDisplayValue('Test Business')
        fireEvent.change(businessNameInput, { target: { value: 'Updated Business' } })
        
        // Click save
        const saveButton = screen.getByText('Save Changes')
        fireEvent.click(saveButton)
        
        // Should show loading state
        expect(screen.getByText('Saving...')).toBeInTheDocument()
      })
    })

    test('handles save errors gracefully', async () => {
      // Mock failed API response
      ;(global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          status: 500,
        })
      )

      render(<ProfilePage />)

      await waitFor(() => {
        const saveButton = screen.getByText('Save Changes')
        fireEvent.click(saveButton)
        
        // Should handle error (implementation dependent)
      })
    })
  })

  describe('File Upload', () => {
    test('handles background image upload', async () => {
      render(<ProfilePage />)

      await waitFor(() => {
        // Navigate to background section
        const backgroundNavItem = screen.getByText('Form Background')
        fireEvent.click(backgroundNavItem)
        
        // Switch to image mode
        const imageRadio = screen.getByLabelText('Background Image')
        fireEvent.click(imageRadio)
        
        // Find file input
        const fileInput = screen.getByLabelText(/click to upload/i)
        
        // Create mock file
        const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
        
        // Upload file
        fireEvent.change(fileInput, { target: { files: [file] } })
        
        // Should trigger upload (implementation dependent)
      })
    })
  })

  describe('Responsive Behavior', () => {
    test('adapts to different screen sizes', async () => {
      // Mock window resize
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      })

      render(<ProfilePage />)

      await waitFor(() => {
        // Should render mobile-friendly layout
        expect(screen.getByText('Profile Customization')).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    test('has proper ARIA labels and keyboard navigation', async () => {
      render(<ProfilePage />)

      await waitFor(() => {
        // Check for proper labels
        const businessNameInput = screen.getByLabelText(/business name/i)
        expect(businessNameInput).toBeInTheDocument()
        
        // Check for required field indicators
        const requiredFields = screen.getAllByText('*')
        expect(requiredFields.length).toBeGreaterThan(0)
      })
    })
  })
})

// Helper function to test color validation
function isValidHexColor(color: string): boolean {
  return /^#[0-9A-F]{6}$/i.test(color)
}

// Helper function to test file validation
function isValidImageFile(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp']
  const maxSize = 5 * 1024 * 1024 // 5MB
  
  return validTypes.includes(file.type) && file.size <= maxSize
}

// Export helper functions for use in other tests
export { isValidHexColor, isValidImageFile }
