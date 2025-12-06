# Design Guidelines: ICM Ruby to Nano Banana Prompt

## Design Approach
**Playful Technical Analyzer with Banana Identity**: Combining the precision of technical workflow analysis with a warm, inviting banana/yellow color palette. The "Nano Banana" theme brings personality to code analysis while maintaining professional clarity and engineering credibility.

## Core Design Principles
1. **Technical Clarity**: Every visual element serves the purpose of code understanding and workflow visualization
2. **Warm, Approachable Design**: Yellow/banana colors convey friendliness and clarity without sacrificing professionalism
3. **Information Hierarchy**: Critical elements (code analysis, Nano Banana breakdown, diagrams) are visually prominent
4. **Playful Precision**: Combines personality with technical accuracy
5. **Accessibility-First**: High contrast yellow tones ensure readability for all users

---

## Color System - Nano Banana Theme

**Primary Yellow/Gold**: `hsl(45 96% 56%)` - Vibrant, warm yellow for primary actions, buttons, and interactive elements
**Secondary Orange**: `hsl(38 88% 50%)` - Warm orange tone for secondary actions and accents
**Accent Gold**: `hsl(50 100% 60%)` - Bright golden yellow for highlights and focus states
**Background**: Clean light neutral with warm undertones in light mode; dark with warm accents in dark mode
**Text**: High contrast dark on light, light on dark for accessibility

**Light Mode**:
- Background: `hsl(210 20% 98%)` (clean white with slight cool undertone for contrast)
- Card: `hsl(0 0% 100%)` (pure white for clarity)
- Borders: `hsl(45 95% 85%)` (soft warm gold borders)

**Dark Mode**:
- Background: `hsl(215 20% 12%)` (dark base)
- Card: `hsl(215 18% 16%)` (dark cards)
- Borders: `hsl(215 15% 22%)` (dark borders with banana highlights)

**Semantic Colors**:
- Destructive/Error: `hsl(0 65% 58%)` - Red (for critical warnings)
- Warning: `hsl(38 92% 50%)` - Orange (complements banana theme)
- Secondary Success: `hsl(142 71% 45%)` - Green (for positive feedback)

**Chart Colors** (warm yellow family):
- Chart 1: `hsl(45 96% 56%)` - Primary banana yellow
- Chart 2: `hsl(38 88% 50%)` - Warm orange accent
- Chart 3: `hsl(50 100% 60%)` - Bright golden yellow
- Chart 4: `hsl(40 95% 50%)` - Deep golden tone
- Chart 5: `hsl(35 85% 45%)` - Rich warm brown accent

---

## Typography System

**Primary Font**: Source Code Pro (for technical content, code references, file paths)
**Secondary Font**: Roboto (for UI labels, descriptions, general text)
**Display Font**: Inter (for headings, section titles)

**Type Scale**:
- H1 (Page Title): Inter, 32px, 700 weight - Banana yellow primary color
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
- Banana yellow background for visual impact
- Dark text for maximum contrast
- Action buttons use primary yellow accent

**File Upload Controls**: 
- Buttons styled with warm banana yellow theme
- Icons from Lucide (no emojis)
- Hover state: Subtle elevation with golden accent

**Tabs**: For switching between Analysis, Overview, Nano Banana, Diagram, Stats
- Active tab: Banana yellow color underline/background
- Inactive tabs: Muted foreground color
- Smooth transitions between states

### Code Display Panel (Left)
**Code Viewer**: 525px fixed width
- Syntax highlighting with yellow accents for important elements
- Monospace font (Source Code Pro)
- Scrollable content area
- File name header in banana yellow

### Analysis Panels (Right)

**Overview Tab**: AI-generated summary with yellow accent highlights
**Nano Banana Tab**: Structured prompt breakdown with banana yellow section headers
**Diagram Tab**: ASCII flowchart with yellow node styling
**Stats Tab**: Code metrics with banana yellow accent numbers

### Visual States & Feedback

**Processing States**:
- Pending: Soft gold border (primary)
- Processing: Pulsing yellow animation
- Success: Green (#38A169) with checkmark
- Error: Red (#E53E3E) with X icon
- Warning: Orange accent matching theme

**Interactive Feedback**:
- Buttons: Banana yellow background, dark text
- Hover state: Slightly elevated with enhanced saturation
- Focus state: Golden yellow ring outline
- Disabled state: Muted yellow with reduced opacity

---

## Animations

**Minimal, Purposeful Motion**:
- Button hover: Subtle elevation (100ms)
- Tab transitions: Smooth yellow color change (200ms)
- Panel slide: 300ms cubic-bezier transition
- Loading indicators: Continuous banana yellow pulse
- No auto-playing animations on load

---

## Accessibility

- Keyboard navigation: Tab through interactive elements
- Focus indicators: 2px solid golden outline on focused elements
- ARIA labels for all buttons and interactive components
- High contrast ratios: Banana yellow meets WCAG AA standards with dark text
- Zoom controls accessible via keyboard shortcuts

---

## Responsive Considerations

**Desktop (lg+)**: Two-column layout (code left, analysis right)
**Tablet (md)**: Collapsible panels with responsive tabs
**Mobile (base)**: Stack vertically, simplified interface

---

## Visual Hierarchy

**Primary Elements** (use banana yellow):
- Main heading: "ICM Ruby to Nano Banana Prompt"
- Active tabs
- Primary action buttons
- Important code annotations

**Secondary Elements** (use warm orange):
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

## Nano Banana Identity

The banana yellow theme creates a distinctive, memorable visual identity that:
- Differentiates the tool from generic code analyzers
- Makes the interface feel approachable and less intimidating
- Reinforces the brand name throughout the user experience
- Maintains professionalism while celebrating the playful "Nano Banana" concept

---

## No Imagery Policy

This is a technical analysis tool. All visuals are:
- SVG-based icons (Lucide React)
- Code syntax highlighting
- Text-based diagrams (ASCII)
- Data visualizations (charts)
- No photographic imagery or emojis
