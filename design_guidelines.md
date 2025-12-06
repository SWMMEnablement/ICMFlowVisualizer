# Design Guidelines: ICM Ruby to Nano Banana Prompt

## Design Approach
**Reference-Based System Hybrid**: Drawing from Lucidchart and draw.io's proven flowchart interfaces with engineering-focused aesthetics and a vibrant blue color system. This is a utility-first application prioritizing clarity, technical accuracy, and workflow comprehension.

## Core Design Principles
1. **Technical Clarity**: Every visual element serves the purpose of code understanding and workflow visualization
2. **Blue-Forward Identity**: A vibrant blue color scheme conveys technical precision and professionalism
3. **Information Hierarchy**: Critical elements (code analysis, Nano Banana breakdown, diagrams) are visually prominent
4. **Scannable Structure**: Users instantly identify analysis tabs and code structure relationships
5. **Engineering Professionalism**: Clean, precise, and authoritative visual language

---

## Color System - Blue Theme

**Primary Blue**: `hsl(210 100% 40%)` - Vibrant, technical blue for primary actions, buttons, and interactive elements
**Secondary Blue**: `hsl(200 80% 35%)` - Darker blue tone for secondary actions and accents
**Accent Blue**: `hsl(200 95% 45%)` - Bright blue accent for highlights and focus states
**Background**: Light neutral with subtle blue undertones in light mode; dark blue-tinted in dark mode
**Text**: High contrast dark on light, light on dark for accessibility

**Light Mode**:
- Background: `hsl(210 20% 98%)`
- Card: `hsl(0 0% 100%)` (pure white for clarity)
- Borders: `hsl(210 15% 88%)` (subtle blue-tinted grey)

**Dark Mode**:
- Background: `hsl(215 20% 12%)` (dark blue-tinted)
- Card: `hsl(215 18% 16%)` (dark with blue undertone)
- Borders: `hsl(215 15% 22%)` (blue-tinted dark borders)

**Semantic Colors**:
- Destructive/Error: `hsl(0 65% 58%)` - Red (unchanged for clarity)
- Warning: `hsl(38 92% 50%)` - Amber (unchanged for clarity)
- Secondary Success: `hsl(142 71% 45%)` → Blue accent in visualizations

**Chart Colors** (all blue family):
- Chart 1: `hsl(210 100% 40%)` - Primary blue
- Chart 2: `hsl(200 80% 35%)` - Secondary blue
- Chart 3: `hsl(210 60% 50%)` - Medium blue
- Chart 4: `hsl(200 70% 55%)` - Light blue
- Chart 5: `hsl(210 80% 60%)` - Lighter blue

---

## Typography System

**Primary Font**: Source Code Pro (for technical content, code references, file paths)
**Secondary Font**: Roboto (for UI labels, descriptions, general text)
**Display Font**: Inter (for headings, section titles)

**Type Scale**:
- H1 (Page Title): Inter, 32px, 700 weight - Blue primary color
- H2 (Section Headers): Inter, 24px, 600 weight
- H3 (Component Labels): Roboto, 18px, 500 weight
- Body Text: Roboto, 14px, 400 weight
- Code/Technical: Source Code Pro, 13px, 400 weight
- Small Labels: Roboto, 12px, 400 weight

---

## Layout System

**Spacing Units**: Use Tailwind units of 4, 6, 8, 12, and 20 for consistent rhythm
- Component padding: p-4 to p-6
- Section spacing: mb-8, mt-12
- Content margins: p-6 to p-8
- Icon-to-text gaps: gap-2

**Grid Structure**:
- Code panel (left): 525px fixed width
- Analysis panel (right): Flexible, responsive
- Responsive breakpoint: Stack vertically on md and below

---

## Component Library

### Navigation & Controls
**Top Header**: Fixed header with title and action buttons
- Height: 64px
- Blue primary background in light mode, blue-tinted dark in dark mode
- White text for maximum contrast
- Action buttons use primary blue accent

**File Upload Controls**: 
- Buttons styled with primary blue theme
- Icons from Lucide (no emojis)
- Hover state: Subtle elevation with blue accent

**Tabs**: For switching between Analysis, Overview, Nano Banana, Diagram, Stats
- Active tab: Blue primary color underline/background
- Inactive tabs: Muted foreground color
- Smooth transitions between states

### Code Display Panel (Left)
**Code Viewer**: 525px fixed width
- Syntax highlighting with blue accents for important elements
- Monospace font (Source Code Pro)
- Scrollable content area
- File name header in primary blue

### Analysis Panels (Right)

**Overview Tab**: AI-generated summary with blue accent highlights
**Nano Banana Tab**: Structured prompt breakdown with blue section headers
**Diagram Tab**: ASCII flowchart with blue node styling
**Stats Tab**: Code metrics with blue accent numbers

### Visual States & Feedback

**Processing States**:
- Pending: Blue-tinted border (primary)
- Processing: Pulsing blue animation
- Success: Green (#38A169) with checkmark
- Error: Red (#E53E3E) with X icon
- Warning: Amber (#D69E2E) with alert icon

**Interactive Feedback**:
- Buttons: Blue primary background, white text
- Hover state: Slightly elevated with enhanced saturation
- Focus state: Blue ring outline for keyboard navigation
- Disabled state: Muted blue with reduced opacity

---

## Animations

**Minimal, Purposeful Motion**:
- Button hover: Subtle elevation (100ms)
- Tab transitions: Smooth color change (200ms)
- Panel slide: 300ms cubic-bezier transition
- Loading indicators: Continuous blue pulse animation
- No auto-playing animations on load

---

## Accessibility

- Keyboard navigation: Tab through interactive elements
- Focus indicators: 2px solid blue outline on focused elements
- ARIA labels for all buttons and interactive components
- High contrast ratios: Blue primary meets WCAG AA standards
- Zoom controls accessible via keyboard shortcuts

---

## Responsive Considerations

**Desktop (lg+)**: Two-column layout (code left, analysis right)
**Tablet (md)**: Collapsible panels with responsive tabs
**Mobile (base)**: Stack vertically, simplified interface

---

## Visual Hierarchy

**Primary Elements** (use primary blue):
- Main heading: "ICM Ruby to Nano Banana Prompt"
- Active tabs
- Primary action buttons
- Important code annotations

**Secondary Elements** (use secondary blue):
- Tab labels
- Section headers
- Secondary buttons
- Code structure elements

**Tertiary Elements** (use muted colors):
- Additional information
- Timestamps
- Metadata
- Helper text

---

## No Imagery Policy

This is a technical analysis tool. All visuals are:
- SVG-based icons (Lucide React)
- Code syntax highlighting
- Text-based diagrams (ASCII)
- Data visualizations (charts)
- No photographic imagery or emojis
