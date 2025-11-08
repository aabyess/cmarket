# Korea-Indonesia B2B RFQ Platform Design Guidelines

## Design Approach
**Reference-Based + Design System Hybrid**: Drawing from Alibaba's B2B professionalism and Linear's modern minimalism, built on shadcn/ui component foundations. Prioritizes trust, clarity, and efficient transaction workflows.

## Core Design Elements

### Typography
- **Headings**: Inter, 700 weight for hero (text-5xl), 600 for sections (text-3xl), 500 for cards (text-xl)
- **Body**: Inter, 400 weight, text-base for content, text-sm for metadata
- **Data/Numbers**: Tabular figures, 600 weight for emphasis on pricing/quantities

### Layout System
**Spacing primitives**: Tailwind units of 4, 6, 8, 12, 16 for consistent rhythm
- Container max-width: max-w-7xl for main content
- Section padding: py-16 desktop, py-8 mobile
- Component spacing: space-y-6 for vertical stacks
- Card padding: p-6 standard, p-8 for featured content

### Component Library

**Navigation**: 
- Sticky header with logo, category mega-menu, search bar, language toggle (KR/ID/EN flags), user account
- Secondary nav with breadcrumbs for deep navigation paths

**Hero Section**: 
- Full-width background image showing Korean-Indonesian business handshake or container shipping/trade imagery
- Centered content with search bar for products/suppliers
- Quick category tiles (4 columns) below search: Electronics, Textiles, Manufacturing, Agriculture
- Trust indicators: "5,000+ Verified Suppliers" | "50,000+ RFQs Posted" | "Secure Transactions"

**Select Dropdowns (Critical)**:
- Light mode: bg-white with visible border (border-gray-300), distinct from page background
- Dark mode: bg-gray-800/90 with border-gray-600, clear contrast against bg-gray-950
- Hover states: subtle border color shift (border-blue-500)
- Icons: Chevron-down on right, 20px size
- Padding: px-4 py-2.5 for comfortable touch targets

**RFQ Cards**:
- White cards (dark: bg-gray-900) with subtle shadow
- Header: Category badge + timestamp
- Body: Product title (text-lg), quantity needed, target price range, delivery location
- Footer: "Send Quote" button (primary) + "View Details" (ghost)
- Status indicators: colored dots for New/In Progress/Closed

**Data Tables**:
- Zebra striping for row differentiation
- Fixed header on scroll
- Sortable columns with arrow indicators
- Inline actions (View, Quote, Message) on hover

**Forms**:
- Multi-step RFQ submission with progress indicator
- Field groups with clear labels and helper text
- File upload zones for product specifications/images
- Auto-save indicators for long forms

**Trust Elements**:
- Verification badges (gold for verified suppliers)
- Rating stars with review counts
- Response time indicators
- Transaction history cards

### Images

**Hero Background**: 
Wide-angle professional photograph of international business meeting or modern warehouse/logistics facility. Overlay with gradient (from black/60% to transparent) for text readability. Image should convey professionalism and scale.

**Category Tiles**: 
Clean product photography or iconography representing each category, 16:9 aspect ratio

**Supplier Cards**:
Company logos on neutral backgrounds, consistent sizing (120x80px)

**Buttons on Images**:
All CTAs on hero use backdrop-blur-md bg-white/10 (dark: bg-black/20) with white text and visible borders

### Animations
Minimal and purposeful:
- Smooth transitions on hover states (150ms)
- Loading skeletons for data fetching
- Toast notifications for form submissions

### Dark Mode Strategy
- Background hierarchy: bg-gray-950 (base), bg-gray-900 (cards), bg-gray-800 (inputs)
- Reduce opacity on dividers (border-gray-800)
- Maintain WCAG AA contrast ratios throughout
- Soften white text to gray-100 for eye comfort

## Page Structure

**Homepage**: Hero + Featured Categories (4-col grid) + Recent RFQs (3-col cards) + How It Works (3 steps) + Top Suppliers (carousel) + CTA Section + Footer

**RFQ Browse**: Filters sidebar + RFQ card grid (2-col on desktop) + Pagination

**Supplier Profile**: Header banner + Verification badges + About + Product catalog + Reviews + Contact form

**Dashboard**: Stats overview (4 metrics) + Active RFQs table + Quick actions + Notifications panel

**Footer**: 
Multi-column layout - Company info | Categories | Resources | Contact | Payment methods icons + Security certifications + Language selector