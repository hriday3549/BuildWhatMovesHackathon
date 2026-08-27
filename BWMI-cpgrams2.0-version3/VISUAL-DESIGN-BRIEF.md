# Nivaran — Visual Design Brief
### Colors, type, and design rules — paste this into any AI for consistent UI output

*Concept: "Cut the Red Tape." India's bureaucracy has a real visual signature — files bound in red tape, ink stamps, ledger registers. Instead of a generic government-blue dashboard or a generic cream-and-serif template, the design leans into that real material world and reinvents it.*

---

## Color Palette

| Name | Hex | Use it for |
|---|---|---|
| **Ledger Paper** | `#F1F5EE` | Base background everywhere — a faint sage-tinted off-white, evoking accountant's ledger paper. Never pure white. |
| **Ink Blue** | `#1E3A5F` | Primary text, primary buttons, navigation, headlines. The dominant color — most of the UI should read as this, not the accent colors. |
| **Red Tape** | `#B4463C` | Pending/attention states, and the literal ribbon graphic on ticket cards. Used sparingly — it's a signal, not decoration. |
| **Stamp Green** | `#2F7A4F` | Verified/resolved states, success confirmations. |
| **Seal Ochre** | `#B8863B` | The wax-seal/stamp accent color specifically — used narrowly, mainly for the "VERIFIED" stamp graphic and small highlights. |
| **Ink Gray** | `#4A4A45` | Secondary text, captions, timestamps, muted labels. |

**Rule of thumb:** if a screen is mostly Ledger Paper + Ink Blue, it's correct. If Red Tape or Seal Ochre show up more than once or twice per screen, it's being overused — they mean something specific (attention / verified) and lose that meaning as decoration.

---

## Typography

Three fonts, three distinct jobs — all from the free **IBM Plex** family (Google Fonts):

| Role | Font | Where |
|---|---|---|
| **Display / headlines** | IBM Plex Serif (bold) | Page headlines, section titles — dignified, form-like |
| **Data / IDs / timestamps** | IBM Plex Mono | Ticket IDs, GPS coordinates, timestamps, stat numbers — reinforces "this is being officially logged," and aligns numbers cleanly |
| **UI / body copy** | IBM Plex Sans | Everything else — buttons, paragraphs, labels, navigation |

Google Fonts import (add to `index.html` `<head>`):
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Serif:wght@400;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
```

---

## Layout Language

- Ticket "cards" are styled like **index cards / file folders**: a slightly raised card face, a thin dashed border evoking a tied bundle of files, a rounded tab at the top.
- A thin **red ribbon** sits diagonally across the top-left corner of every ticket card that isn't yet resolved.
- Generous whitespace, minimal chrome. No dark dashboards, no dense multi-column institutional layouts, no decorative sections that don't map to a real feature.
- Flat, graphic illustrations only (SVG line/flat-color art) — never photorealistic renders, never 3D, never stock photography.

---

## The One Signature Interaction

When a citizen confirms a resolved complaint ("Confirm Fixed"), the red ribbon on that ticket card **visibly cuts/snaps**, and a small ochre circular stamp animates in reading **"VERIFIED."** This is the single most important visual moment in the product — restrained (under ~600ms, no confetti, no 3D) but deliberate. It's the literal, felt payoff of "proof, not just a status label."

A related but distinct moment: when duplicate complaints get merged, several small ticket cards visually **slide together into one parent card**, their ribbons combining into one thicker ribbon with a counter badge ("3 neighbors reported this") — same visual grammar, reused.

---

## Voice & Copy Tone

Plain, active, specific. Say exactly what happens.

- ✅ "You confirmed it's fixed" / "Send OTP" / "Drop pin" / "Confirm fixed" / "Reopen this"
- ❌ "Your grievance has been processed as resolved by the concerned authority" / "Submit" / "Process"

---

## What to Explicitly Avoid

- The generic AI-default look: warm cream background + terracotta accents + generic serif — this is not that palette, don't drift toward it.
- Generic dark-mode dashboard aesthetics.
- Literal saffron/white/green tricolor blocking — no flag cliché.
- Stock government emblem clip art, generic Bootstrap-style card grids with no personality.
- Dense institutional-portal patterns: utility header with phone/email/search, mega-nav with ghost pages (About/Services/Contact), sidebar menus, widget-feed columns, icon carousels, dark two-tier footers with partner-logo strips. These exist to organize large multi-service sites with real content behind every section — on a focused, five-screen product, they read as filler.

---

## One-Line Summary (for quick AI context)

*"Ledger-paper off-white background (#F1F5EE), ink-blue (#1E3A5F) as the dominant color, red-tape red (#B4463C) and seal-ochre (#B8863B) used sparingly as meaningful signals, IBM Plex Serif for headlines / IBM Plex Mono for data / IBM Plex Sans for UI, flat SVG illustration only, ticket cards styled like file folders with a red ribbon that visibly cuts and gets stamped 'VERIFIED' when a citizen confirms a fix — restrained, functional, no institutional clutter."*
