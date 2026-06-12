# Brol Badge System - SVG Design Specification
## Retro-Geek / VHS Theme Badge Assets

---

## Table of Contents

1. [Design Language](#1-design-language)
2. [Per-Category Visual Rules](#2-per-category-visual-rules)
3. [Rarity Visual Tiers](#3-rarity-visual-tiers)
4. [Example SVG Specifications](#4-example-svg-specifications)
5. [Implementation Notes](#5-implementation-notes)
6. [Badge Inventory (100+ Badges)](#6-badge-inventory-100-badges)

---

## 1. Design Language

### 1.1 Core Visual Philosophy

The Brol badge system embraces a **néon-pixel hybrid** aesthetic that fuses 80s/90s VHS nostalgia with pixel art sensibilities. Each badge is a self-contained visual story rendered as a scalable vector graphic that:

- Evokes nostalgia while remaining crisp at small sizes
- Uses bold silhouettes readable at 32x32px (scaled from 64x64 source)
- Incorporates category-specific visual metaphors
- Communicates rarity through color intensity and effects

### 1.2 Technical Specifications

| Property | Value |
|----------|-------|
| **ViewBox** | `0 0 64 64` (1:1 aspect ratio) |
| **Default Display Size** | 32x32px (scales to 64x64 for detail views) |
| **Base Stroke Width** | 2px at 64x64 scale |
| **Min Stroke Width** | 1.5px (for fine details in epic/legendary) |
| **Max Stroke Width** | 3px (for bold outlines in common) |
| **File Format** | SVG 1.1 with embedded styles |
| **Naming Convention** | `{category}-{subcategory}-{rarity}.svg` |

### 1.3 Color Palette

#### Primary Colors (Theme-Aligned)

```
MAGENTA VHS (Primary)     #FF00FF / hsl(300, 100%, 50%)
NEON CYAN (Secondary)     #00FFFF / hsl(180, 100%, 50%)
CRT AMBER (Accent)        #FFBF00 / hsl(41, 100%, 50%)
VHS YELLOW               #FFFF00 / hsl(60, 100%, 50%)
```

#### Extended Palette

```
DEEP PURPLE    #8B00FF / hsl(275, 100%, 50%)   - Epic tier accent
ELECTRIC BLUE  #00BFFF / hsl(195, 100%, 50%)   - Rare tier accent
HOT PINK       #FF1493 / hsl(330, 100%, 50%)   - Legendary accent
LIME NEON      #39FF14 / hsl(120, 100%, 50%)   - Success states
```

#### Tier-Specific Colors

| Tier | Primary Color | Glow Color | Border/Trim |
|------|---------------|------------|-------------|
| **Common** | `#666680` (muted) | none | `#444455` |
| **Uncommon** | `#00CCAA` (teal) | `#00CCAA40` | `#009977` |
| **Rare** | `#00BFFF` (electric blue) | `#00BFFF60` | `#0088CC` |
| **Epic** | `#9933FF` (purple) | `#9933FF70` | `#7700CC` |
| **Legendary** | `#FFD700` (gold) | `#FFD70080` + rainbow shimmer | `#FFA500` |

#### Neutral Colors

```
CRT BLACK       #0A0A0A (background)
DARK GRAY       #1A1A2E (card background)
MID GRAY        #3A3A4E (muted elements)
LIGHT GRAY      #8888AA (disabled text)
WHITE           #F0F0FF (highlights)
```

### 1.4 Stroke & Line Style

- **Stroke Linecap**: `round` for organic feel, `square` for pixel-art alignment
- **Stroke Linejoin**: `round` for smooth curves, `miter` for sharp geometric shapes
- **Fill Style**: Solid fills primary, with occasional gradient for depth
- **No fill (outline-only)**: Allowed for secondary elements

### 1.5 Pixel Art Guidelines

For badges with pixel art elements:

- Use `<rect>` elements for pixels (no paths with sub-pixel precision)
- 4x4px base pixel size at 64x64 viewBox
- Align to 4x4 grid system
- Avoid anti-aliasing artifacts by using integer coordinates

### 1.6 Glow Effects (CSS/SVG)

```css
/* Tier-based glow definitions */
.glow-common { filter: none; }
.glow-uncommon { filter: drop-shadow(0 0 3px var(--glow-color)); }
.glow-rare { filter: drop-shadow(0 0 6px var(--glow-color)); }
.glow-epic { filter: drop-shadow(0 0 8px var(--glow-color)) drop-shadow(0 0 12px var(--glow-color)); }
.glow-legendary {
  filter: drop-shadow(0 0 8px #FFD700) drop-shadow(0 0 16px #FFA500) drop-shadow(0 0 24px #FF6600);
  animation: legendary-pulse 2s ease-in-out infinite;
}
@keyframes legendary-pulse {
  0%, 100% { filter: drop-shadow(0 0 8px #FFD700) drop-shadow(0 0 16px #FFA500); }
  50% { filter: drop-shadow(0 0 12px #FFD700) drop-shadow(0 0 24px #FFA500) drop-shadow(0 0 32px #FF6600); }
}
```

### 1.7 Accessibility

- All SVG elements have `role="img"` and `aria-label` with badge name
- High contrast ratios maintained (4.5:1 minimum for text elements)
- Glow effects don't reduce contrast below accessible levels
- Color is never the only differentiator (shape hierarchy supplements)

---

## 2. Per-Category Visual Rules

### 2.1 Category: Cinema/VHS (`cinema`)

**Theme Elements:**
- VHS tape shapes (rectangular with notched corners)
- Film reel perforations
- Film strip segments
- Clapperboard silhouettes
- Retro projector beams
- "PLAY" / "REC" indicator lights

**Visual Style:**
- Rounded VHS cassette body (pill-shaped ends)
- Center reel circles with spoke details
- Horizontal film strip lines as decorative borders
- Red "REC" dot indicator
- CRT screen curvature on video-themed badges

**Example Badges:**
- `cinema-vhs-tape-common.svg` - Basic VHS cassette
- `cinema-film-reel-rare.svg` - Classic film reel
- `cinema-clapperboard-uncommon.svg` - Director's clapperboard
- `cinema-projector-epic.svg` - Vintage projector with light beam

**Color Usage:**
- Primary: Magenta VHS for body
- Accent: Amber for "PLAY" text and reel labels
- Glow: Cyan for projector beam effect

### 2.2 Category: Literature (`literature`)

**Theme Elements:**
- Book spines (stacked, leaning, open)
- Typewriter keys (circular, squared)
- Quill pens
- Old manuscript pages with curled edges
- Library stamps
- Reading glasses
- Bookmarks with tassels

**Visual Style:**
- Stacked books with varied spine widths
- Letterpress-style text on book spines
- Typewriter key circles with letters
- Feather quill with ink splatter
- Worn paper texture via subtle line patterns

**Example Badges:**
- `lit-book-stack-common.svg` - Simple stack of 3 books
- `lit-typewriter-uncommon.svg` - Classic typewriter
- `lit-quill-epic.svg` - Elegant feather pen
- `lit-library-rare.svg` - Stack with library stamp

**Color Usage:**
- Primary: Deep purple/magenta for book covers
- Secondary: Cyan for page edges
- Accent: Amber for vintage paper tones
- Trim: Gold for special editions

### 2.3 Category: Retro Video Games (`gaming`)

**Theme Elements:**
- Game controllers (NES, SNES, Sega layouts)
- Cartridge shapes (horizontal, vertical)
- Joystick tops
- Pixel art characters (8-bit style)
- Arcade cabinet silhouettes
- Game cartridge labels with fake titles
- D-pad crosses
- Button circles (A/B style)

**Visual Style:**
- Chunky, rounded controller shapes
- Visible D-pad cross and circular buttons
- Cartridge with label area (decorative pattern)
- Pixel art via rect elements on 4x4 grid
- CRT scanline overlay on arcade badges

**Example Badges:**
- `gaming-nes-controller-common.svg` - Classic NES pad
- `gaming-cartridge-rare.svg` - Cartridge with label
- `gaming-arcade-epic.svg` - Arcade cabinet front
- `gaming-joystick-uncommon.svg` - Ball-top joystick

**Color Usage:**
- Primary: Magenta controller body
- Secondary: Cyan buttons and D-pad
- Accent: Yellow for action buttons
- Detail: White for button labels A/B

### 2.4 Category: TV/Series (`television`)

**Theme Elements:**
- Retro TV set silhouettes (rounded rectangular)
- Antenna (rabbit ears, single rod)
- TV test pattern colors
- Remote control shapes
- Screen glow effects
- Static noise patterns
- Channel knob circles

**Visual Style:**
- Rounded CRT television body
- Antenna extending from top
- Circular channel knob on side
- Screen area with gradient glow
- Coaxial cable extending from back

**Example Badges:**
- `tv-old-set-common.svg` - Basic retro TV
- `tv-antenna-uncommon.svg` - TV with rabbit ears
- `tv-remote-rare.svg` - Vintage remote
- `tv-test-pattern-epic.svg` - Color bar test pattern

**Color Usage:**
- Primary: Magenta for TV body
- Secondary: Cyan for screen glow
- Accent: Amber for channel numbers
- Screen: Gradient from dark to cyan glow center

### 2.5 Category: Hardware/Computing (`hardware`)

**Theme Elements:**
- Circuit board traces (PCB patterns)
- Floppy disk (3.5" and 5.25")
- Old monitor silhouettes
- Keyboard key clusters
- Computer tower shapes
- CPU chip outlines
- Pixel art hard drives
- Serial port patterns

**Visual Style:**
- PCB trace patterns as background texture
- Floppy disk with metal slider
- CRT monitor with curved screen
- Keyboard key grid (simplified)
- Chip with pin connections

**Example Badges:**
- `hw-floppy-disk-common.svg` - 3.5" floppy
- `hw-circuit-board-uncommon.svg` - PCB pattern
- `hw-old-monitor-rare.svg` - CRT monitor
- `hw-cpu-epic.svg` - CPU chip with pins

**Color Usage:**
- Primary: Green for PCB (computing heritage)
- Secondary: Cyan for circuit traces
- Accent: Amber for LED indicators
- Detail: Gold for connection pins

### 2.6 Category: Tabletop/RPG (`tabletop`)

**Theme Elements:**
- Dice (d6, d20, d8, d4)
- Board game tokens
- Character sheet rectangles
- Miniature figure silhouettes
- RPG scroll/parchment
- Chess piece silhouettes
- Card shapes (playing cards, tarot)
- Meeple icons

**Visual Style:**
- Isometric dice with visible pips
- d20 with number engravings
- Folded parchment with wax seal
- Simple meeple silhouette
- Playing card with decorative back

**Example Badges:**
- `tt-d6-common.svg` - Six-sided die
- `tt-meeple-uncommon.svg` - Board game meeple
- `tt-d20-rare.svg` - d20 polyhedral die
- `tt-scroll-epic.svg` - Rolled RPG scroll

**Color Usage:**
- Primary: Magenta for game pieces
- Secondary: Cyan for card backs
- Accent: Amber for dice pips/numbers
- Parchment: Cream/off-white tones

### 2.7 Category: Accomplishments (`accomplishments`)

**Theme Elements:**
- Trophies (cup shape, flame top)
- Medals (circular with ribbon)
- Stars (5-point, 8-point)
- Ribbons (V-shape, horizontal)
- Crowns (simple, decorative)
- Laurels/wreaths
- Achievement unlock icons
- Level-up arrows

**Visual Style:**
- Trophy cup with handles
- Circular medal with star center
- Ribbon tails flowing down
- Radiating star burst behind
- Crown with point details
- Laurel wreath curves

**Example Badges:**
- `ach-trophy-common.svg` - Basic trophy
- `ach-star-uncommon.svg` - Simple star
- `ach-medal-rare.svg` - Medal with ribbon
- `ach-crown-epic.svg` - Royal crown
- `ach-laurel-legendary.svg` - Victory laurel wreath

**Color Usage:**
- Primary: Gold for trophy/medal body
- Accent: Amber for highlights
- Secondary: Cyan for ribbon
- Epic/Legendary: Rainbow/gold shimmer effects

### 2.8 Category: Special (`special`)

**Theme Elements:**
- Glowing orbs
- Crystal shapes
- Lightning bolts
- Fire flames
- Snowflakes
- Rainbow arcs
- Magic stars
- Infinite loop symbols
- Heart shapes (pixelated)
- Pixel art gems

**Visual Style:**
- Central glowing element
- Radiating light rays
- Particle effects (small circles)
- Animated-ready structure
- Unique silhouettes per badge

**Example Badges:**
- `special-fire-common.svg` - Pixel flame
- `special-lightning-uncommon.svg` - Lightning bolt
- `special-crystal-rare.svg` - Gem/crystal
- `special-rainbow-epic.svg` - Full rainbow arc
- `special-infinity-legendary.svg` - Glowing infinity

**Color Usage:**
- Tier-appropriate glow intensity
- Multi-color for rainbow elements
- Cyan/magenta for magic effects
- White core for glowing elements

---

## 3. Rarity Visual Tiers

### 3.1 Common Tier

**Visual Characteristics:**
- Muted color palette (grays, desaturated versions of category colors)
- No glow effects
- Simple, bold silhouettes
- Minimal detail (2-3 elements maximum)
- 2px stroke weight
- Flat fills, no gradients

**Example Palette:**
```
Fill:     #555566
Stroke:   #333344
Detail:   #777788
No glow, no effects
```

### 3.2 Uncommon Tier

**Visual Characteristics:**
- Brighter base colors with slight saturation
- Subtle single-layer glow (2px spread)
- Moderate detail (4-5 elements)
- 2px stroke weight
- Simple gradients (2-color)
- Small accent highlights

**Example Palette:**
```
Fill:     #00CCAA (teal)
Stroke:   #009977
Glow:     #00CCAA40 (40% opacity)
Accent:   #00FFDD
```

### 3.3 Rare Tier

**Visual Characteristics:**
- Full saturation category colors
- Multi-layer glow (4px spread)
- High detail (6-8 elements)
- 2px stroke weight with 1px accent lines
- Gradient fills
- Small particle/star accents

**Example Palette:**
```
Fill:     #00BFFF (electric blue)
Stroke:   #0088CC
Glow:     #00BFFF60
Accent:   #66DDFF
Particles: #FFFFFF at 30%
```

### 3.4 Epic Tier

**Visual Characteristics:**
- Deep purple/violet primary with color shifts
- Intense glow (6px + inner glow)
- Complex composition (10+ elements)
- Mixed stroke weights (1.5px - 2px)
- Rich gradients (3+ color stops)
- Animated-ready particle positions
- Background pattern elements

**Example Palette:**
```
Fill:     #9933FF (deep purple)
Stroke:   #7700CC
Glow:     #9933FF70
Secondary: #CC66FF
Accent:   #FF00FF
Particles: Multi-color micro-dots
```

### 3.5 Legendary Tier

**Visual Characteristics:**
- Gold primary with rainbow shimmer
- Maximum glow with pulsing animation capability
- Full complexity (max elements, layered)
- Gold trim borders (1px additional outline)
- Multi-layer gradients
- Particle system (12+ particles)
- Signature element unique to legendary

**Example Palette:**
```
Fill:     #FFD700 (gold)
Stroke:   #FFA500 (orange-gold)
Trim:     #FFE55C (light gold)
Glow:     #FFD70080 + #FFA50060 + #FF660040
Shimmer:  Animated gradient or static rainbow
Particles: Gold/white sparkles
```

---

## 4. Example SVG Specifications

### 4.1 Common Tier: Cinema-VHS Tape (`cinema-vhs-tape-common.svg`)

```xml
<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="VHS Tape Badge">
  <title>VHS Tape</title>
  
  <!-- VHS Cassette Body -->
  <rect x="6" y="18" width="52" height="28" rx="4" ry="4" 
        fill="#555566" stroke="#333344" stroke-width="2"/>
  
  <!-- Left Reel Circle -->
  <circle cx="20" cy="32" r="8" fill="#222233" stroke="#333344" stroke-width="2"/>
  <circle cx="20" cy="32" r="3" fill="#555566"/>
  
  <!-- Right Reel Circle -->
  <circle cx="44" cy="32" r="8" fill="#222233" stroke="#333344" stroke-width="2"/>
  <circle cx="44" cy="32" r="3" fill="#555566"/>
  
  <!-- Label Area -->
  <rect x="26" y="24" width="12" height="16" fill="#444455"/>
  
  <!-- Bottom Detail Lines -->
  <line x1="10" y1="42" x2="54" y2="42" stroke="#333344" stroke-width="1"/>
  
  <!-- Corner Notch Left -->
  <rect x="6" y="18" width="6" height="6" fill="#444455"/>
  
  <!-- Corner Notch Right -->
  <rect x="52" y="18" width="6" height="6" fill="#444455"/>
</svg>
```

### 4.2 Uncommon Tier: Gaming-NES Controller (`gaming-nes-controller-uncommon.svg`)

```xml
<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="NES Controller Badge">
  <title>NES Controller</title>
  <defs>
    <filter id="glow-uncommon" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="2" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- Controller Body -->
  <rect x="4" y="22" width="56" height="24" rx="6" ry="6" 
        fill="#00CCAA" stroke="#009977" stroke-width="2" filter="url(#glow-uncommon)"/>
  
  <!-- D-Pad Cross -->
  <path d="M16 28 L16 38 L12 38 L12 42 L20 42 L20 38 L16 38" 
        fill="#222233" stroke="#009977" stroke-width="1.5"/>
  <rect x="14" y="32" width="4" height="4" fill="#333344"/>
  
  <!-- Select Button -->
  <rect x="24" y="30" width="6" height="3" rx="1" fill="#007755"/>
  
  <!-- Start Button -->
  <rect x="32" y="30" width="6" height="3" rx="1" fill="#007755"/>
  
  <!-- B Button -->
  <circle cx="42" cy="34" r="4" fill="#FF6600" stroke="#CC4400" stroke-width="1.5"/>
  
  <!-- A Button -->
  <circle cx="52" cy="34" r="4" fill="#FF6600" stroke="#CC4400" stroke-width="1.5"/>
  
  <!-- Cable -->
  <path d="M4 34 Q0 34 0 38" stroke="#009977" stroke-width="2" fill="none"/>
</svg>
```

### 4.3 Rare Tier: Retro TV Set (`tv-old-set-rare.svg`)

```xml
<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Retro TV Badge">
  <title>Retro TV Set</title>
  <defs>
    <filter id="glow-rare" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <linearGradient id="screen-glow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#001122"/>
      <stop offset="50%" style="stop-color:#004466"/>
      <stop offset="100%" style="stop-color:#0088AA"/>
    </linearGradient>
  </defs>
  
  <!-- TV Body -->
  <rect x="6" y="16" width="52" height="38" rx="6" ry="6" 
        fill="#00BFFF" stroke="#0088CC" stroke-width="2" filter="url(#glow-rare)"/>
  
  <!-- Screen Bezel -->
  <rect x="12" y="22" width="32" height="26" rx="3" ry="3" 
        fill="#005577" stroke="#006699" stroke-width="1"/>
  
  <!-- Screen -->
  <rect x="14" y="24" width="28" height="22" rx="2" ry="2" fill="url(#screen-glow)"/>
  
  <!-- Screen Reflection -->
  <path d="M14 24 L28 24 L20 46 L14 46 Z" fill="#FFFFFF" fill-opacity="0.1"/>
  
  <!-- Antenna Left -->
  <line x1="20" y1="16" x2="12" y2="4" stroke="#0088CC" stroke-width="2" stroke-linecap="round"/>
  
  <!-- Antenna Right -->
  <line x1="44" y1="16" x2="52" y2="4" stroke="#0088CC" stroke-width="2" stroke-linecap="round"/>
  
  <!-- Antenna Tips -->
  <circle cx="12" cy="4" r="2" fill="#0088CC"/>
  <circle cx="52" cy="4" r="2" fill="#0088CC"/>
  
  <!-- Channel Knob -->
  <circle cx="52" cy="36" r="5" fill="#006699" stroke="#005588" stroke-width="1.5"/>
  <line x1="52" y1="33" x2="52" y2="36" stroke="#00BFFF" stroke-width="1.5"/>
  
  <!-- Speaker Grille -->
  <line x1="46" y1="44" x2="56" y2="44" stroke="#005588" stroke-width="1"/>
  <line x1="46" y1="47" x2="56" y2="47" stroke="#005588" stroke-width="1"/>
  <line x1="46" y1="50" x2="56" y2="50" stroke="#005588" stroke-width="1"/>
</svg>
```

### 4.4 Epic Tier: Trophy Cup (`ach-trophy-epic.svg`)

```xml
<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Trophy Badge">
  <title>Trophy</title>
  <defs>
    <filter id="glow-epic" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <linearGradient id="gold-shine" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FFD700"/>
      <stop offset="50%" style="stop-color:#FFA500"/>
      <stop offset="100%" style="stop-color:#9933FF"/>
    </linearGradient>
  </defs>
  
  <!-- Radiating Stars Background -->
  <g opacity="0.6">
    <polygon points="32,4 34,12 42,12 36,17 38,25 32,20 26,25 28,17 22,12 30,12" 
             fill="#CC66FF" filter="url(#glow-epic)"/>
    <polygon points="10,20 11,24 15,24 12,27 13,31 10,28 7,31 8,27 5,24 9,24" 
             fill="#9933FF" opacity="0.7"/>
    <polygon points="54,20 55,24 59,24 56,27 57,31 54,28 51,31 52,27 49,24 53,24" 
             fill="#9933FF" opacity="0.7"/>
  </g>
  
  <!-- Trophy Handles -->
  <path d="M14 24 Q6 24 6 32 Q6 40 14 40 L18 40 Q14 40 14 32 Q14 24 18 24 Z" 
        fill="none" stroke="#9933FF" stroke-width="2.5" filter="url(#glow-epic)"/>
  <path d="M50 24 Q58 24 58 32 Q58 40 50 40 L46 40 Q50 40 50 32 Q50 24 46 24 Z" 
        fill="none" stroke="#9933FF" stroke-width="2.5" filter="url(#glow-epic)"/>
  
  <!-- Trophy Cup Body -->
  <path d="M18 14 L46 14 L44 34 Q44 44 32 44 Q20 44 20 34 Z" 
        fill="url(#gold-shine)" stroke="#7700CC" stroke-width="2" filter="url(#glow-epic)"/>
  
  <!-- Cup Rim -->
  <ellipse cx="32" cy="14" rx="14" ry="3" fill="#FFD700" stroke="#7700CC" stroke-width="1.5"/>
  
  <!-- Star on Cup -->
  <polygon points="32,20 34,26 40,26 35,30 37,36 32,32 27,36 29,30 24,26 30,26" 
           fill="#FFFFFF" opacity="0.9"/>
  
  <!-- Trophy Base -->
  <rect x="26" y="44" width="12" height="6" fill="#9933FF" stroke="#7700CC" stroke-width="1.5"/>
  <rect x="22" y="50" width="20" height="4" rx="1" ry="1" fill="#CC66FF" stroke="#7700CC" stroke-width="1.5"/>
  
  <!-- Glow Particles -->
  <circle cx="18" cy="10" r="1.5" fill="#FFFFFF" opacity="0.8"/>
  <circle cx="46" cy="10" r="1.5" fill="#FFFFFF" opacity="0.8"/>
  <circle cx="32" cy="6" r="2" fill="#FFFFFF" opacity="0.6"/>
  <circle cx="12" cy="28" r="1" fill="#FFD700" opacity="0.7"/>
  <circle cx="52" cy="28" r="1" fill="#FFD700" opacity="0.7"/>
</svg>
```

### 4.5 Legendary Tier: Infinity Crystal (`special-infinity-legendary.svg`)

```xml
<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Infinity Crystal Badge">
  <title>Infinity Crystal</title>
  <defs>
    <filter id="glow-legendary" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3" result="blur1"/>
      <feGaussianBlur stdDeviation="5" result="blur2"/>
      <feGaussianBlur stdDeviation="8" result="blur3"/>
      <feMerge>
        <feMergeNode in="blur3"/>
        <feMergeNode in="blur2"/>
        <feMergeNode in="blur1"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <linearGradient id="crystal-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FF00FF"/>
      <stop offset="25%" style="stop-color:#00FFFF"/>
      <stop offset="50%" style="stop-color:#FFD700"/>
      <stop offset="75%" style="stop-color:#FF00FF"/>
      <stop offset="100%" style="stop-color:#00FFFF"/>
    </linearGradient>
    <linearGradient id="gold-trim" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#FFD700"/>
      <stop offset="50%" style="stop-color:#FFFFFF"/>
      <stop offset="100%" style="stop-color:#FFD700"/>
    </linearGradient>
  </defs>
  
  <!-- Outer Glow Ring -->
  <circle cx="32" cy="32" r="28" fill="none" stroke="#FFD70080" stroke-width="2" 
          stroke-dasharray="4 2" filter="url(#glow-legendary)"/>
  
  <!-- Infinity Symbol -->
  <path d="M32 32 
           C32 26 26 22 20 22 
           C14 22 12 26 14 30 
           C16 34 22 36 28 32 
           C34 28 40 26 42 30 
           C44 34 42 38 36 38 
           C30 38 32 34 32 32
           M32 32
           C32 38 38 42 44 42
           C50 42 52 38 50 34
           C48 30 42 28 36 32
           C30 36 24 38 22 34
           C20 30 22 26 28 26
           C34 26 32 30 32 32" 
        fill="none" stroke="url(#crystal-gradient)" stroke-width="3" 
        stroke-linecap="round" filter="url(#glow-legendary)"/>
  
  <!-- Central Crystal -->
  <polygon points="32,14 40,26 36,26 36,42 28,42 28,26 24,26" 
           fill="url(#crystal-gradient)" stroke="url(#gold-trim)" stroke-width="1.5"
           filter="url(#glow-legendary)"/>
  
  <!-- Crystal Facets -->
  <line x1="32" y1="14" x2="32" y2="42" stroke="#FFFFFF" stroke-width="0.5" opacity="0.5"/>
  <line x1="28" y1="26" x2="36" y2="26" stroke="#FFFFFF" stroke-width="0.5" opacity="0.3"/>
  <line x1="28" y1="34" x2="36" y2="34" stroke="#FFFFFF" stroke-width="0.5" opacity="0.3"/>
  
  <!-- Sparkle Particles -->
  <circle cx="12" cy="18" r="2" fill="#FFFFFF" filter="url(#glow-legendary)"/>
  <circle cx="52" cy="18" r="2" fill="#FFFFFF" filter="url(#glow-legendary)"/>
  <circle cx="10" cy="40" r="1.5" fill="#FFD700" filter="url(#glow-legendary)"/>
  <circle cx="54" cy="40" r="1.5" fill="#FFD700" filter="url(#glow-legendary)"/>
  <circle cx="20" cy="10" r="1" fill="#00FFFF" filter="url(#glow-legendary)"/>
  <circle cx="44" cy="10" r="1" fill="#FF00FF" filter="url(#glow-legendary)"/>
  <circle cx="8" cy="28" r="1" fill="#FFFFFF" opacity="0.8"/>
  <circle cx="56" cy="28" r="1" fill="#FFFFFF" opacity="0.8"/>
  <circle cx="16" cy="52" r="1.5" fill="#FFD700" opacity="0.7"/>
  <circle cx="48" cy="52" r="1.5" fill="#FFD700" opacity="0.7"/>
  <circle cx="32" cy="8" r="1.5" fill="#FFFFFF" filter="url(#glow-legendary)"/>
  
  <!-- Gold Trim Accent -->
  <circle cx="32" cy="32" r="4" fill="none" stroke="url(#gold-trim)" stroke-width="1"/>
</svg>
```

---

## 5. Implementation Notes

### 5.1 File Storage Structure

```
/apps/web/public/badges/
├── cinema/
│   ├── cinema-vhs-tape-common.svg
│   ├── cinema-vhs-tape-uncommon.svg
│   ├── cinema-vhs-tape-rare.svg
│   ├── cinema-film-reel-common.svg
│   ├── cinema-film-reel-uncommon.svg
│   ├── cinema-film-reel-rare.svg
│   ├── cinema-film-reel-epic.svg
│   ├── cinema-clapperboard-common.svg
│   ├── cinema-clapperboard-uncommon.svg
│   ├── cinema-clapperboard-rare.svg
│   ├── cinema-projector-epic.svg
│   └── cinema-projector-legendary.svg
├── literature/
│   ├── lit-book-stack-common.svg
│   ├── lit-book-stack-uncommon.svg
│   ├── lit-book-stack-rare.svg
│   ├── lit-typewriter-common.svg
│   ├── lit-typewriter-uncommon.svg
│   ├── lit-typewriter-rare.svg
│   ├── lit-quill-epic.svg
│   └── lit-library-legendary.svg
├── gaming/
│   ├── gaming-nes-controller-common.svg
│   ├── gaming-nes-controller-uncommon.svg
│   ├── gaming-nes-controller-rare.svg
│   ├── gaming-cartridge-common.svg
│   ├── gaming-cartridge-uncommon.svg
│   ├── gaming-cartridge-rare.svg
│   ├── gaming-cartridge-epic.svg
│   ├── gaming-arcade-epic.svg
│   └── gaming-arcade-legendary.svg
├── television/
│   ├── tv-old-set-common.svg
│   ├── tv-old-set-uncommon.svg
│   ├── tv-old-set-rare.svg
│   ├── tv-antenna-common.svg
│   ├── tv-antenna-uncommon.svg
│   ├── tv-remote-common.svg
│   ├── tv-remote-uncommon.svg
│   ├── tv-remote-rare.svg
│   └── tv-test-pattern-epic.svg
├── hardware/
│   ├── hw-floppy-disk-common.svg
│   ├── hw-floppy-disk-uncommon.svg
│   ├── hw-floppy-disk-rare.svg
│   ├── hw-floppy-disk-epic.svg
│   ├── hw-circuit-board-common.svg
│   ├── hw-circuit-board-uncommon.svg
│   ├── hw-circuit-board-rare.svg
│   ├── hw-old-monitor-common.svg
│   ├── hw-old-monitor-uncommon.svg
│   ├── hw-old-monitor-rare.svg
│   ├── hw-cpu-epic.svg
│   └── hw-cpu-legendary.svg
├── tabletop/
│   ├── tt-d4-common.svg
│   ├── tt-d6-common.svg
│   ├── tt-d6-uncommon.svg
│   ├── tt-d6-rare.svg
│   ├── tt-d8-uncommon.svg
│   ├── tt-d10-rare.svg
│   ├── tt-d20-rare.svg
│   ├── tt-d20-epic.svg
│   ├── tt-meeple-common.svg
│   ├── tt-meeple-uncommon.svg
│   ├── tt-scroll-epic.svg
│   └── tt-chess-legendary.svg
├── accomplishments/
│   ├── ach-trophy-common.svg
│   ├── ach-trophy-uncommon.svg
│   ├── ach-trophy-rare.svg
│   ├── ach-trophy-epic.svg
│   ├── ach-star-common.svg
│   ├── ach-star-uncommon.svg
│   ├── ach-star-rare.svg
│   ├── ach-medal-common.svg
│   ├── ach-medal-uncommon.svg
│   ├── ach-medal-rare.svg
│   ├── ach-medal-epic.svg
│   ├── ach-crown-epic.svg
│   ├── ach-crown-legendary.svg
│   ├── ach-laurel-rare.svg
│   └── ach-laurel-legendary.svg
└── special/
    ├── special-fire-common.svg
    ├── special-fire-uncommon.svg
    ├── special-lightning-common.svg
    ├── special-lightning-uncommon.svg
    ├── special-lightning-rare.svg
    ├── special-crystal-rare.svg
    ├── special-crystal-epic.svg
    ├── special-snowflake-epic.svg
    ├── special-rainbow-epic.svg
    ├── special-rainbow-legendary.svg
    ├── special-heart-uncommon.svg
    ├── special-heart-rare.svg
    ├── special-gem-legendary.svg
    └── special-infinity-legendary.svg
```

### 5.2 BadgeDefinition Model Update

The `BadgeDefinition.icon` field currently stores emoji or URL. Migration approach:

```typescript
// Option A: Keep as string, store relative path for local assets
icon: "/badges/cinema-vhs-tape-common.svg"

// Option B: Add new field, deprecate old
iconSvg: String?  // New field for SVG path/URL
iconEmoji: String? // Keep emoji for backward compat

// Option C: Use JSON column for richer metadata (recommended for v2)
iconMeta: Json? // { type: "svg", path: "...", fallback: "🎬" }
```

### 5.3 Frontend Integration

**Badge Display Component (`/apps/web/src/components/badges/badge-icon.tsx`):**

```tsx
interface BadgeIconProps {
  icon: string;        // Current: emoji or SVG URL
  name: string;       // For aria-label
  size?: "sm" | "md" | "lg";
  earned?: boolean;   // Affects opacity
}

export function BadgeIcon({ icon, name, size = "md", earned = true }: BadgeIconProps) {
  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-8 h-8", 
    lg: "w-12 h-12"
  };

  // Check if icon is SVG path (starts with / or contains .svg)
  const isSvg = icon.startsWith("/") || icon.endsWith(".svg");
  
  if (isSvg) {
    return (
      <img 
        src={icon}
        alt={name}
        className={`${sizeClasses[size]} ${!earned ? "opacity-40 grayscale" : ""}`}
      />
    );
  }
  
  // Fallback: emoji
  return (
    <span 
      className={`${sizeClasses[size]} ${!earned ? "opacity-40 grayscale" : ""}`}
      role="img"
      aria-label={name}
    >
      {icon}
    </span>
  );
}
```

### 5.4 Database Migration Script

```sql
-- Add new column for SVG paths (example migration)
ALTER TABLE badge_definitions 
ADD COLUMN IF NOT EXISTS icon_svg VARCHAR(255);

-- Populate with SVG paths based on existing emoji mappings
UPDATE badge_definitions SET icon_svg = 
  CASE slug
    WHEN 'cinema-first' THEN '/badges/cinema-vhs-tape-common.svg'
    WHEN 'bookworm' THEN '/badges/lit-book-stack-common.svg'
    WHEN 'gamer' THEN '/badges/gaming-nes-controller-common.svg'
    -- ... etc
    ELSE '/badges/special-fire-common.svg'
  END
WHERE icon_svg IS NULL;
```

### 5.5 Badge Component Updates

**Badges Page (`/apps/web/src/app/badges/page.tsx`):**

```tsx
// Replace emoji rendering with BadgeIcon component
<div className="text-2xl">{badge.icon}</div>
// Becomes:
<BadgeIcon icon={badge.icon} name={badge.name} size="md" earned={true} />
```

### 5.6 Rarity Styling

```tsx
// Add rarity-based styling classes
const rarityStyles = {
  common: "badge-common",
  uncommon: "badge-uncommon glow-uncommon",
  rare: "badge-rare glow-rare", 
  epic: "badge-epic glow-epic",
  legendary: "badge-legendary glow-legendary animate-pulse"
};
```

### 5.7 Animation Integration

For legendary/epic badges with animations:

```css
/* In globals.css */
@keyframes badge-sparkle {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.05); }
}

.badge-legendary {
  animation: badge-sparkle 3s ease-in-out infinite;
}
```

---

## 6. Badge Inventory (100+ Badges)

### 6.1 Cinema/VHS Category (15 badges)

| Badge Name | Rarity | Icon Filename | Criteria |
|------------|--------|---------------|----------|
| Premiere | Common | cinema-clapperboard-common.svg | First object added |
| Collectionneur | Uncommon | cinema-vhs-tape-uncommon.svg | 5 objects |
| Magnetoscope | Rare | cinema-vhs-tape-rare.svg | 25 objects |
| Telethon | Epic | cinema-vhs-tape-epic.svg | 100 objects |
| Pelletier | Common | cinema-film-reel-common.svg | First loan |
| Cinephile | Uncommon | cinema-film-reel-uncommon.svg | 5 loans |
| Projektor | Rare | cinema-projector-rare.svg | 25 loans |
| Director | Epic | cinema-projector-epic.svg | 100 loans |
| Realisateur | Legendary | cinema-projector-legendary.svg | 500 loans |
| Bobine | Common | cinema-film-reel-common.svg | (alt) |
| Camera | Uncommon | cinema-clapperboard-uncommon.svg | (alt) |
| Ecrandevie | Rare | tv-old-set-rare.svg | Category award |
| Retro | Uncommon | tv-old-set-uncommon.svg | Category award |
| Antenniste | Common | tv-antenna-common.svg | Category award |
| Tele | Common | tv-old-set-common.svg | (alt) |

### 6.2 Literature Category (12 badges)

| Badge Name | Rarity | Icon Filename |
|------------|--------|---------------|
| Lecteur | Common | lit-book-stack-common.svg |
| Page | Uncommon | lit-book-stack-uncommon.svg |
| Bibliotheque | Rare | lit-library-rare.svg |
| Librairie | Epic | lit-library-epic.svg |
| Bibliothecaire | Legendary | lit-library-legendary.svg |
| Dactylo | Common | lit-typewriter-common.svg |
| Redaction | Uncommon | lit-typewriter-uncommon.svg |
| Ecrivain | Rare | lit-typewriter-rare.svg |
| Auteur | Epic | lit-quill-epic.svg |
| Plume | Uncommon | lit-quill-uncommon.svg |
| Papyrus | Rare | lit-scroll-rare.svg |
| Pergament | Epic | lit-scroll-epic.svg |

### 6.3 Gaming Category (15 badges)

| Badge Name | Rarity | Icon Filename |
|------------|--------|---------------|
| Joueur | Common | gaming-nes-controller-common.svg |
| Gameur | Uncommon | gaming-nes-controller-uncommon.svg |
| Hardcore | Rare | gaming-arcade-rare.svg |
| Arcade | Epic | gaming-arcade-epic.svg |
| Champion | Legendary | gaming-arcade-legendary.svg |
| Cartouche | Common | gaming-cartridge-common.svg |
| Console | Uncommon | gaming-cartridge-uncommon.svg |
| Collection | Rare | gaming-cartridge-rare.svg |
| Retro | Epic | gaming-cartridge-epic.svg |
| Joystick | Common | gaming-joystick-common.svg |
| Paddle | Uncommon | gaming-joystick-uncommon.svg |
| Ataris | Rare | gaming-atari-rare.svg |
| Nintendi | Uncommon | gaming-nes-controller-uncommon.svg |
| Segan | Rare | gaming-sega-rare.svg |
| Mega | Epic | gaming-mega-epic.svg |

### 6.4 Hardware/Computing Category (12 badges)

| Badge Name | Rarity | Icon Filename |
|------------|--------|---------------|
| Disquette | Common | hw-floppy-disk-common.svg |
| Savon | Uncommon | hw-floppy-disk-uncommon.svg |
| 1.44Mo | Rare | hw-floppy-disk-rare.svg |
| DD | Epic | hw-harddrive-epic.svg |
| Silicon | Uncommon | hw-cpu-uncommon.svg |
| Processeur | Rare | hw-cpu-rare.svg |
| Puce | Epic | hw-cpu-epic.svg |
| Cerveau | Legendary | hw-cpu-legendary.svg |
| Circuit | Common | hw-circuit-board-common.svg |
| PCB | Uncommon | hw-circuit-board-uncommon.svg |
| Trace | Rare | hw-circuit-board-rare.svg |
| Platine | Epic | hw-circuit-board-epic.svg |

### 6.5 Tabletop/RPG Category (12 badges)

| Badge Name | Rarity | Icon Filename |
|------------|--------|---------------|
| Des | Common | tt-d6-common.svg |
| Chance | Uncommon | tt-d6-uncommon.svg |
| Probabilites | Rare | tt-d20-rare.svg |
| Mathematiques | Epic | tt-d20-epic.svg |
| Fate | Legendary | tt-d20-legendary.svg |
| Plateau | Common | tt-board-common.svg |
| Meeple | Uncommon | tt-meeple-uncommon.svg |
| Pion | Common | tt-token-common.svg |
| Carte | Uncommon | tt-card-uncommon.svg |
| Tarot | Rare | tt-card-rare.svg |
| Scenario | Rare | tt-scroll-rare.svg |
| MJ | Epic | tt-scroll-epic.svg |

### 6.6 Accomplishments Category (15 badges)

| Badge Name | Rarity | Icon Filename |
|------------|--------|---------------|
| Etoile | Common | ach-star-common.svg |
| Constellation | Uncommon | ach-star-uncommon.svg |
| Supernova | Rare | ach-star-rare.svg |
| Galaxie | Epic | ach-star-epic.svg |
| Cosmos | Legendary | ach-star-legendary.svg |
| Coupe | Common | ach-trophy-common.svg |
| Podium | Uncommon | ach-trophy-uncommon.svg |
| Champion | Rare | ach-trophy-rare.svg |
| Legende | Epic | ach-trophy-epic.svg |
| Heros | Legendary | ach-trophy-legendary.svg |
| Medaille | Common | ach-medal-common.svg |
| Bronze | Uncommon | ach-medal-uncommon.svg |
| Argent | Rare | ach-medal-rare.svg |
| Or | Epic | ach-medal-epic.svg |
| Platine | Legendary | ach-medal-legendary.svg |

### 6.7 Special Category (20 badges)

| Badge Name | Rarity | Icon Filename |
|------------|--------|---------------|
| Etincelle | Common | special-spark-common.svg |
| Flamme | Uncommon | special-fire-uncommon.svg |
| Eclair | Rare | special-lightning-rare.svg |
| Foudre | Epic | special-lightning-epic.svg |
| Zeus | Legendary | special-lightning-legendary.svg |
| Flocon | Uncommon | special-snowflake-uncommon.svg |
| Hiver | Rare | special-snowflake-rare.svg |
| Glacier | Epic | special-snowflake-epic.svg |
| Crystal | Rare | special-crystal-rare.svg |
| Diamant | Epic | special-crystal-epic.svg |
| Amethyste | Legendary | special-crystal-legendary.svg |
| Arcenciel | Epic | special-rainbow-epic.svg |
| IRIS | Legendary | special-rainbow-legendary.svg |
| Coeur | Uncommon | special-heart-uncommon.svg |
| Amour | Rare | special-heart-rare.svg |
| Infinity | Epic | special-infinity-epic.svg |
| Infini | Legendary | special-infinity-legendary.svg |
| Gemme | Rare | special-gem-rare.svg |
| Joyau | Epic | special-gem-epic.svg |
| Tresor | Legendary | special-gem-legendary.svg |

---

## Appendix A: SVG Optimization Checklist

- [ ] ViewBox set to `0 0 64 64`
- [ ] Minimal path complexity (max 500 points per path)
- [ ] No embedded raster images
- [ ] No unnecessary groups or empty elements
- [ ] `role="img"` and `aria-label` on root SVG
- [ ] `<title>` element as first child
- [ ] No JavaScript or external references
- [ ] CSS embedded in `<style>` or inline (no external stylesheets)
- [ ] Optimized with SVGO or similar (optional)

## Appendix B: Color Reference

```css
:root {
  /* VHS Theme - Default */
  --badge-common: #666680;
  --badge-uncommon: #00CCAA;
  --badge-rare: #00BFFF;
  --badge-epic: #9933FF;
  --badge-legendary: #FFD700;
  
  /* Glow variants */
  --glow-uncommon: rgba(0, 204, 170, 0.4);
  --glow-rare: rgba(0, 191, 255, 0.5);
  --glow-epic: rgba(153, 51, 255, 0.6);
  --glow-legendary: rgba(255, 215, 0, 0.7);
}
```

---

*Document Version: 1.0*  
*Created for: Brol App - Badge System Redesign*  
*Theme: Retro-Geek / VHS 80s/90s*
