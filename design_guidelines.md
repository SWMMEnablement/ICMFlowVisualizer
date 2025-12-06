# Design Guidelines: ICM Ruby to Nano Banana Prompt

## Design Approach
**Playful Technical Analyzer with Banana Identity & Light Blue Canvas**: Combining the precision of technical workflow analysis with a warm banana yellow accent palette set against a serene light blue background. The "Nano Banana" theme brings personality to code analysis while the light blue creates a calming, focused environment for engineers.

## Core Design Principles
1. **Technical Clarity**: Every visual element serves the purpose of code understanding and workflow visualization
2. **Calming Blue Canvas**: Light blue background reduces eye strain and creates a focused work environment
3. **Warm Yellow Accents**: Banana yellow interactive elements pop against the blue background
4. **Information Hierarchy**: Critical elements (code analysis, Nano Banana breakdown, diagrams) stand out with banana yellow
5. **Accessibility-First**: High contrast between light blue and dark text, plus yellow buttons for clear interaction affordance

---

## Color System - Nano Banana with Light Blue Background

**Primary Yellow/Gold**: `hsl(45 96% 56%)` - Vibrant, warm yellow for primary actions, buttons, and interactive elements
**Secondary Orange**: `hsl(38 88% 50%)` - Warm orange tone for secondary actions and accents
**Accent Gold**: `hsl(50 100% 60%)` - Bright golden yellow for highlights and focus states

**Background Palette - Light Blue**:
- **Main Background**: `hsl(210 30% 93%)` - Soft light blue, calming and focused
- **Card Background**: `hsl(210 20% 98%)` - Very light blue-tinted white for cards
- **Sidebar**: `hsl(210 25% 88%)` - Slightly deeper light blue for navigation areas
- **Borders**: `hsl(210 25% 80%)` - Light blue borders with adequate contrast

**Light Mode**:
- Background: `hsl(210 30% 93%)` (soft light blue)
- Card: `hsl(210 20% 98%)` (subtle blue-tinted white)
- Borders: `hsl(210 25% 80%)` (light blue borders)
- Muted: `hsl(210 20% 90%)` (light blue muted areas)

**Dark Mode**:
- Background: `hsl(215 20% 12%)` (dark base)
- Card: `hsl(215 18% 16%)` (dark cards)
- Borders: `hsl(215 15% 22%)` (dark borders)

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
- Scrollable content area with light blue background
- File name header in banana yellow

### Analysis Panels (Right)

**Overview Tab**: AI-generated summary with yellow accent highlights against light blue background
**Nano Banana Tab**: Structured prompt breakdown with banana yellow section headers
**Diagram Tab**: ASCII flowchart with yellow node styling
**Stats Tab**: Code metrics with banana yellow accent numbers

### Visual States & Feedback

**Processing States**:
- Pending: Soft gold border (primary) on light blue background
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
- Light blue background reduces eye strain during extended analysis sessions
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

## Nano Banana + Light Blue Identity

The banana yellow + light blue combination creates:
- A distinctive, memorable visual identity unique to the tool
- Warm interactive elements that feel approachable and inviting
- A calming blue canvas that reduces eye strain during extended code analysis
- Professional credibility balanced with playful personality
- Strong contrast that guides user attention to interactive banana yellow elements

---

## No Imagery Policy

This is a technical analysis tool. All visuals are:
- SVG-based icons (Lucide React)
- Code syntax highlighting
- Text-based diagrams (ASCII)
- Data visualizations (charts)
- No photographic imagery or emojis
