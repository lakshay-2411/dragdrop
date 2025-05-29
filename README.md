# Drag & Drop Website Builder

A modern, intuitive visual website builder built with React and TypeScript that allows users to create websites through a drag-and-drop interface without writing code.

## 🚀 Features

- **Visual Drag & Drop Interface**: Intuitive component placement with real-time visual feedback
- **Component Library**: Pre-built components including headings, text, buttons, images, containers, and dividers
- **Live Editing**: Direct content editing with inline text editing capabilities
- **Responsive Design**: Desktop and mobile view modes for responsive design testing
- **Layer Management**: Visual layer panel with element hierarchy and controls
- **Properties Panel**: Real-time style and content editing with color pickers and input controls
- **Undo/Redo System**: Complete history management with unlimited undo/redo operations
- **Element Controls**: Lock, hide, duplicate, and delete elements with granular control
- **Code Export**: Generate clean, production-ready HTML/CSS code
- **Visual Canvas**: Clean workspace with visual indicators and selection feedback

## 🏗️ Architecture

### Component Structure

```
WebsiteBuilder (Main Component)
├── Sidebar (Component Library)
├── Toolbar (Actions & View Controls)
├── Canvas (Design Area)
└── Properties Panel (Element Configuration)
```

### Core Architecture Patterns

#### 1. **State Management Pattern**
- **Centralized State**: All elements and application state managed in the main component
- **Immutable Updates**: State updates follow immutability principles for predictable behavior
- **Event-Driven Updates**: UI changes trigger state updates through well-defined event handlers

#### 2. **Custom Hooks Pattern**
- **useHistory Hook**: Implements undo/redo functionality with history state management
- **Separation of Concerns**: Business logic separated from UI components through custom hooks
- **Reusable Logic**: History management can be reused across different components

#### 3. **Component Factory Pattern**
- **Dynamic Rendering**: Elements rendered based on type through a centralized render function
- **Extensible Design**: New component types can be easily added to the system
- **Consistent Interface**: All elements follow the same interface contract

#### 4. **Observer Pattern**
- **Real-time Updates**: Property changes immediately reflect in the canvas
- **Synchronized Views**: Canvas, layers panel, and properties panel stay synchronized
- **Event Propagation**: Proper event handling prevents conflicts between different interaction zones

## 🛠️ Technology Stack

### Core Technologies
- **React 18**: Modern React with functional components and hooks
- **TypeScript**: Type safety and better developer experience
- **Lucide React**: Consistent and modern icon system
- **HTML5 Drag & Drop API**: Native browser drag-and-drop functionality

### Styling & UI
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **CSS Grid & Flexbox**: Modern layout techniques for responsive design
- **Custom CSS Properties**: Dynamic styling through JavaScript-controlled CSS

### Development Patterns
- **Functional Components**: Modern React development with hooks
- **Custom Hooks**: Reusable logic extraction
- **TypeScript Interfaces**: Strong typing for data structures and component props
- **Event Handling**: Comprehensive event management for user interactions

## 🎯 Design Rationale

### Why This Architecture?

#### 1. **Monolithic Component Approach**
- **Simplicity**: Easier to understand and maintain for a single-purpose application
- **Performance**: Minimal prop drilling and context switching
- **State Consistency**: Centralized state prevents synchronization issues

#### 2. **Custom History Management**
- **User Experience**: Familiar undo/redo functionality expected in design tools
- **Performance**: Efficient state snapshots without external dependencies
- **Control**: Full control over what actions trigger history saves

#### 3. **Drag & Drop Implementation**
- **Native API**: Leverages browser's native drag-and-drop for better performance
- **Visual Feedback**: Real-time visual indicators during drag operations
- **Flexible**: Supports both component library and element repositioning

#### 4. **Real-time Property Editing**
- **Immediate Feedback**: Changes reflect instantly in the canvas
- **User Experience**: Familiar pattern from professional design tools
- **Efficiency**: No need for apply/save buttons, changes are immediate

### Technical Decisions

#### Element Data Structure
```typescript
interface Element {
  id: string;                    
  type: ElementType;            
  content: string;              
  style: ElementStyle;          
  position: {x: number, y: number};
  size: {width: number, height: number};
  locked: boolean;              
  visible: boolean;             
  zIndex: number;               
}
```

#### Why Absolute Positioning?
- **Design Freedom**: Allows pixel-perfect placement like professional design tools
- **Simplicity**: Easier to implement drag-and-drop with absolute positioning
- **Predictability**: Element positions are explicit and controllable

#### Why Custom History Hook?
- **Lightweight**: No external dependencies for undo/redo functionality
- **Tailored**: Designed specifically for our element-based state structure
- **Performance**: Efficient snapshots without unnecessary data copying

## 🚀 Getting Started

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/lakshay-2411/dragdrop.git
cd dragdrop
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

## 🎮 Usage Guide

### Basic Workflow

1. **Add Components**: Drag components from the left sidebar to the canvas
2. **Edit Content**: Click on elements to select and edit content directly
3. **Style Elements**: Use the properties panel to modify colors, fonts, and spacing
4. **Organize Layers**: Use the layers panel to manage element hierarchy
5. **Export Code**: Click the export button to generate HTML/CSS code

### Element Types

- **Heading**: Large text for titles and headers
- **Text**: Paragraph text for content
- **Button**: Interactive button elements
- **Image**: Image placeholders with URL support
- **Container**: Layout containers for grouping elements
- **Divider**: Horizontal rule separators
