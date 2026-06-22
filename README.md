# Austin Graces Dental Clinic — Website Preview

A fast, **mobile-first** demo website for **Austin Graces Dental Clinic** (a family dental
clinic in **Enugu, Nigeria**). Built as a single, polished landing page so patients can see
treatments, prices, the smile gallery, location and FAQs — and **book on WhatsApp** without
asking basic questions in DM.

Pure **HTML + CSS + vanilla JS** — no build step, no dependencies. Just open it in a browser.

> This is a **preview/demo** the clinic can view, own and customise. All copy, photos, prices,
> address, HMO details and doctor names are placeholders ready to be replaced.

---

## ▶️ Run it locally

No installation needed — it's static. From inside this folder:

```bash
# Option A — Python (built in on most machines)
python -m http.server 8099
# then open http://127.0.0.1:8099

# Option B — Node
npx serve .

# Option C — just double-click index.html
```

## 🏗️ Build

There is **no build step** — the contents of this folder *are* the website. To "build/deploy",
upload the whole folder to any static host (GitHub Pages, Netlify, Vercel, cPanel, etc.).

This repo is set up for **GitHub Pages**: the live URL is

```
https://princenwafor.github.io/austin-graces-dental-clinic/
```

---

## 📁 Structure

```
austin-graces-dental-clinic/
├── index.html              The whole site (all sections)
├── css/style.css           Design system + every component (edit brand colours here)
├── js/main.js              Nav, FAQ, counters, WhatsApp wiring, booking flow
└── assets/
    ├── logo.png            Clinic logo (upscaled & sharpened from the supplied file)
    ├── img/                Photos (smile gallery, clinic graphics)
    └── video/              Clinic videos + auto-generated poster frames
```

---

## ✏️ Make it the clinic's own (easy edits)

| What to change | Where |
|----------------|-------|
| **WhatsApp number & phone** | `js/main.js` → the `CLINIC` object at the top (`whatsapp`, `phone`). Used by every WhatsApp/Call button. |
| **Logo** | Replace `assets/logo.png` with the final high-resolution logo (keep the filename, or update the `<img src>` in `index.html` header & footer). |
| **Photos / videos** | Drop new files into `assets/img` and `assets/video` and update the `src` paths in `index.html` (Smile Gallery, hero, about). |
| **Prices** | In `index.html`, each treatment card has a `tcard__price` block — edit the ₦ amounts. They're sample ranges. |
| **HMO details** | The "Payment & HMO" section + the relevant FAQ answer in `index.html`. |
| **Doctor names** | Not shown yet (kept generic). Add a "Meet the Dentist" block or names in the About section. |
| **Address & map** | The "Location" section — update the address text and the Google Maps `iframe src` to the exact pin. |
| **Brand colours** | `css/style.css` → the `:root` tokens (`--c-navy`, `--c-gold`, `--c-red`, …). Change once, restyles everywhere. |
| **Opening hours** | "Location" section (`hours-mini`) + the JSON-LD `openingHoursSpecification` in `<head>`. |
| **SEO title/description** | `<head>` of `index.html` (built around *"Dental clinic in Enugu"*). |

### WhatsApp messages
Every "Chat on WhatsApp" / "Book" button carries a service-specific pre-filled message in its
`data-wa="..."` attribute, so a patient's chat opens with the treatment already written out.
Edit the text in `index.html`; the number comes from `CLINIC.whatsapp` in `js/main.js`.

---

## 📱 Notes
- Mobile-first; responsive at 640px (tablet) and 960px (desktop). No horizontal scroll on swipe.
- Videos use poster frames and `preload="none"` to stay fast on mobile data.
- The booking tool is front-end only: it gathers the patient's choices and hands off to WhatsApp.
  To wire a real backend, replace the WhatsApp hand-off in `initBooking()` (`js/main.js`).
