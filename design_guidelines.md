# Design Guidelines: ICM Ruby Workflow Analyzer

## Design Approach
**Reference-Based System Hybrid**: Drawing from Lucidchart and draw.io's proven flowchart interfaces with engineering-focused aesthetics. This is a utility-first application prioritizing clarity, technical accuracy, and workflow comprehension.

## Core Design Principles
1. **Technical Clarity**: Every visual element serves the purpose of workflow understanding
2. **Information Hierarchy**: Critical path elements (UI → Exchange → Database) are visually dominant
3. **Scannable Structure**: Users should instantly identify process stages and file relationships
4. **Engineering Professionalism**: Clean, precise, and authoritative visual language

---

## Typography System

**Primary Font**: Source Code Pro (for technical content, code references, file paths)
**Secondary Font**: Roboto (for UI labels, descriptions, general text)
**Display Font**: Inter (for headings, section titles)

**Type Scale**:
- H1 (Page Title): Inter, 32px, 700 weight
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
- Canvas margins: p-20
- Icon-to-text gaps: gap-2

**Grid Structure**:
- Main canvas area:占据 70-75% viewport width
- Side panel (metadata): 25-30% width
- Responsive breakpoint: Stack vertically on md and below

---

## Component Library

### Navigation & Controls
**Top Toolbar**: Fixed header with controls (Zoom In/Out, Reset View, Export, Legend Toggle)
- Height: 64px
- Horizontal layout with icon buttons
- Subtle shadow for elevation

**Side Panel**: Collapsible metadata and statistics panel
- Tabbed interface (Overview, Files, Statistics, Logs)
- Smooth slide-in/out animation

### Visualization Components

**Flowchart Nodes**:
- **Process Rectangles**: Rounded corners (8px), 180px min-width, 60px height
- **Decision Diamonds**: 150px width, 90px height
- **Data/File Boxes**: Parallelogram shape, 160px width
- **Terminal Shapes**: Rounded pill (24px border-radius)

**Connector Lines**:
- Stroke width: 2px for primary flow, 1px for secondary relationships
- Use orthogonal (right-angle) connectors, not curved
- Arrowheads: Solid triangles, 8px size
- Dashed lines (4px dash, 4px gap) for optional/conditional paths

**Interactive Elements**:
- Nodes: Clickable with hover state (subtle scale: 1.02)
- Tooltips: Appear on hover with file details, 200ms delay
- Highlight: Connected paths illuminate on node selection

### Data Display

**File Cards**: Display .inp file information
- Card layout: 320px width, auto height
- Include: filename, size, status badge, timestamp
- Status badges: Pill-shaped, 6px padding, uppercase text

**Statistics Dashboard**: Key metrics grid
- 4-column grid on desktop (2 on tablet, 1 on mobile)
- Large numbers (28px) with descriptive labels below
- Icon accompaniment for each metric

**Log Viewer**: Monospace text display
- Background: Subtle grey (#F9FAFB)
- Max height: 400px with scroll
- Line numbers in left gutter
- Syntax highlighting for ERROR/WARNING/SUCCESS

---

## Visual States & Feedback

**Processing States**:
- Pending: Grey outline (#CBD5E0)
- Processing: Pulsing animation, process green border
- Success: Solid green (#38A169) with checkmark icon
- Error: Red (#E53E3E) with X icon
- Warning: Amber (#D69E2E) with alert icon

**Canvas Interactions**:
- Pan: Click-drag with hand cursor
- Zoom: Mouse wheel or toolbar controls (50%-200% range)
- Select: Click nodes for details in side panel

---

## Animations

**Minimal, Purposeful Motion**:
- Node hover: Transform scale (100ms ease-out)
- Panel slide: 300ms cubic-bezier transition
- Path highlighting: 200ms color transition
- No auto-playing animations on load

---

## Accessibility

- Keyboard navigation: Tab through nodes, Enter to select
- Focus indicators: 2px solid outline on focused elements
- ARIA labels for all flowchart nodes and controls
- Sufficient color contrast ratios (WCAG AA minimum)
- Zoom controls accessible via keyboard shortcuts (+/-)

---

## Responsive Considerations

**Desktop (lg+)**: Full side-by-side layout with zoomable canvas
**Tablet (md)**: Collapsible side panel, canvas takes 100% when expanded
**Mobile (base)**: Stack vertically, simplified flowchart with expandable details

---

## Images

No photographic imagery required. This is a technical diagram interface. All visuals are SVG-based flowchart elements, icons (Heroicons for UI controls), and data visualizations.