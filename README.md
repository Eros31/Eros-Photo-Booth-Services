# Eros Photo Booth Services

Web storefront, print layout customizer, and Gmail booking inquiry application for **Eros Photo Booth Services**.

## File Structure

- `index.html` — Semantic page sections (`Welcome`, `Services`, `Events`, `Gallery`, `Strip Studio`, `Book via Gmail`, `About Us`).
- `styles/main.css` — CSS custom properties, keyframe animations, responsive breakpoints, and print frame styling.
- `scripts/app.js` — Organized into numbered modules (`Navigation & Scroll`, `Reveal & Scroll-Spy`, `Packages`, `Gallery`, `Print Customizer & PNG Export`, and `Gmail Booking`).

## Configuration

1. Open `scripts/app.js` and set `CONFIG.studioGmail` to your target studio Gmail address.
2. Serve the project folder over any static HTTP server (or open `index.html` directly in a browser).

## Key Features

- **Package & Magnet Selector:** Toggle `+1000` magnet add-ons and sync selections directly to the booking form.
- **Filterable Gallery:** Filter sample keepsake cards by event category with staggered entrance animations.
- **Strip Studio Customizer:** Supports 10 print formats, 6 typography styles, top/bottom/remove positioning, photo slot previews (up to 4 images), and offscreen `<canvas>` PNG export.
- **Gmail Compose Integration:** Generates pre-addressed Gmail compose links (`mail.google.com`) with formatted booking and layout notes.