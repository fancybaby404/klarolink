# Profile Customization Feature

## Overview

The Profile Customization feature provides a comprehensive interface for businesses to customize their feedback form appearance and business profile information. It features a modern three-column layout with real-time preview capabilities.

## Features Implemented

### 🎨 **Three-Column Layout**
- **Left Sidebar**: Fixed navigation menu with smooth scrolling
- **Middle Content**: Scrollable customization sections
- **Right Panel**: Live preview with responsive device simulation

### 🏢 **Business Profile Section**
- Business name editing
- Location information
- Profile image URL management
- Real-time validation and preview

### 📷 **Profile Image Management**
- URL-based profile image setting
- Live preview of profile images
- Error handling for broken image URLs
- Fallback to placeholder images

### 🎨 **Form Background Customization**
- **Color Picker**: Visual color selection with hex input
- **Image Upload**: Drag-and-drop file upload with validation
- **Background Type Toggle**: Switch between solid colors and images
- **File Validation**: JPG, PNG, WebP support, 5MB max size
- **Real-time Preview**: Immediate background updates

### 🔘 **Button Customization**
- **Background Color**: Customize submit button color
- **Text Color**: Customize button text color
- **Hover Color**: Customize button hover state
- **Reset to Defaults**: One-click restoration
- **Live Preview**: Real-time button appearance updates

### 📱 **Live Preview Panel**
- **Real-time Updates**: All changes reflect immediately
- **Device Simulation**: Desktop, tablet, and mobile views
- **Actual Form Preview**: Shows real form fields and structure
- **Background Preview**: Live background color/image updates
- **Button Preview**: Interactive button with hover states

## File Structure

```
app/dashboard/profile/
├── page.tsx                     # Main profile customization page
├── 
app/api/upload/background/
├── route.ts                     # Background image upload endpoint
├── 
docs/
├── PROFILE_CUSTOMIZATION.md     # This documentation
```

## Technical Implementation

### **State Management**
- React hooks for form state management
- Real-time synchronization between form inputs and preview
- Optimistic UI updates with error handling

### **File Upload System**
- Secure file validation (type, size)
- Unique filename generation
- Server-side file storage
- Error handling and user feedback

### **Responsive Design**
- Mobile-first approach
- Flexible grid layouts
- Device-specific preview modes
- Consistent spacing and typography

### **Database Integration**
- Updates existing `businesses` table fields
- Maintains backward compatibility
- Proper error handling and validation

## API Endpoints

### **Background Image Upload**
```typescript
POST /api/upload/background
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body: FormData with 'image' field
Response: { success: true, url: string, filename: string }
```

### **Profile Update**
```typescript
PUT /api/profile
Content-Type: application/json
Authorization: Bearer <token>

Body: { name: string, profile_image?: string, location?: string }
```

### **Background Update**
```typescript
PUT /api/profile/background
Content-Type: application/json
Authorization: Bearer <token>

Body: { background_type: "color" | "image", background_value: string }
```

### **Button Customization**
```typescript
PUT /api/profile/button-customization
Content-Type: application/json
Authorization: Bearer <token>

Body: {
  submit_button_color: string,
  submit_button_text_color: string,
  submit_button_hover_color: string
}
```

## Usage Instructions

### **Accessing the Feature**
1. Navigate to the dashboard
2. Click "Customize Profile" in the sidebar
3. Or visit `/dashboard/profile` directly

### **Navigation**
- Use the left sidebar to jump between sections
- Sections automatically highlight based on scroll position
- Smooth scrolling animation for better UX

### **Customizing Background**
1. Select "Form Background" from navigation
2. Choose between "Solid Color" or "Background Image"
3. For colors: Use color picker or enter hex values
4. For images: Upload JPG, PNG, or WebP files (max 5MB)
5. Preview updates in real-time on the right panel

### **Customizing Buttons**
1. Select "Button Styling" from navigation
2. Adjust background, text, and hover colors
3. Use color pickers or enter hex values manually
4. Click "Reset" to restore default colors
5. Preview button interactions in real-time

### **Device Preview**
- Click device icons (desktop/tablet/mobile) in preview panel
- Preview automatically adjusts to show different screen sizes
- All customizations work across all device sizes

## Validation and Error Handling

### **File Upload Validation**
- **File Types**: Only JPG, PNG, WebP allowed
- **File Size**: Maximum 5MB
- **Error Messages**: Clear user feedback for validation failures

### **Color Validation**
- **Hex Format**: Validates proper hex color format
- **Real-time Validation**: Immediate feedback on invalid colors
- **Fallback Colors**: Default colors if validation fails

### **Form Validation**
- **Required Fields**: Business name is required
- **URL Validation**: Profile image URLs are validated
- **Error Display**: Clear error messages with icons

## Accessibility Features

### **Keyboard Navigation**
- All interactive elements are keyboard accessible
- Proper tab order throughout the interface
- Focus indicators for all focusable elements

### **Screen Reader Support**
- Proper ARIA labels on all form controls
- Semantic HTML structure
- Descriptive alt text for images

### **Color Contrast**
- High contrast ratios for all text
- Color picker includes contrast validation
- Accessible color combinations in default palette

## Performance Optimizations

### **Image Handling**
- Lazy loading for preview images
- Optimized file upload with progress feedback
- Efficient image caching

### **Real-time Updates**
- Debounced input handling
- Optimistic UI updates
- Minimal re-renders with React optimization

### **File Management**
- Unique filename generation prevents conflicts
- Automatic cleanup of old uploaded files
- Efficient file storage structure

## Browser Compatibility

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile Browsers**: iOS Safari 14+, Chrome Mobile 90+
- **Features**: Full support for color input, file upload, CSS Grid

## Security Considerations

### **File Upload Security**
- File type validation on both client and server
- File size limits to prevent abuse
- Secure file storage outside web root
- Unique filename generation prevents conflicts

### **Authentication**
- JWT token validation on all endpoints
- Business-specific file access controls
- Proper error handling without information leakage

## Future Enhancements

### **Planned Features**
- **Advanced Image Editor**: Crop, resize, filters
- **Template Gallery**: Pre-designed background templates
- **Brand Kit**: Save and reuse color palettes
- **Export/Import**: Share customization settings
- **A/B Testing**: Test different form appearances

### **Technical Improvements**
- **CDN Integration**: Faster image delivery
- **Image Optimization**: Automatic compression and format conversion
- **Undo/Redo**: History management for customizations
- **Bulk Operations**: Apply settings to multiple forms

## Troubleshooting

### **Common Issues**

**Images not displaying:**
- Check image URL accessibility
- Verify file format (JPG, PNG, WebP only)
- Ensure file size is under 5MB

**Colors not updating:**
- Verify hex color format (#RRGGBB)
- Check browser color input support
- Clear browser cache if needed

**Upload failures:**
- Check file size (max 5MB)
- Verify file type (JPG, PNG, WebP)
- Ensure stable internet connection

**Preview not updating:**
- Refresh the page
- Check browser JavaScript console for errors
- Verify authentication token validity
