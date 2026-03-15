# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static personal portfolio website for Sharath Chandra Reddy Dumpali. It has no build system, package manager, or framework — just plain HTML and CSS served directly in a browser.

## Development

**To view the site:** Open `index.html` directly in a browser, or use any static file server:
```
python3 -m http.server 8000
```

There are no build steps, linting tools, or tests.

## Structure

- `index.html` — single-page portfolio with all sections (About, Skills, Projects, Certifications, Experience, Education, Blogs, Contact)
- `style.css` — all styles; sections are color-coded with distinct background palettes
- `images/` — profile photos used in About and Projects sections
- `test.html` — empty scratch file, not part of the live site

## Architecture Notes

The page is a single scrollable HTML file with anchor-based navigation. Each section has both a semantic `id` (used for `<a href="#...">` nav links) and a wrapper `div` with a class-based id (e.g., `id="project-section-class"`). The nav links target the inner wrapper ids, not the outer `<section>` ids.

The contact form submits to Formspree (`https://formspree.io/f/xyzgqjva`) with `target="_blank"`, so submissions open in a new tab rather than redirecting the page.

Color palette per section:
- Header/nav: Indigo (`#3F51B5`)
- Hero: Orange-to-amber gradient
- About/Skills: Teal/cyan tones (`#E0F7FA`)
- Projects: Amber (`#FFF3E0`)
- Certifications/Experience: Indigo-light (`#E8EAF6`)
- Education: Green (`#E8F5E9`)
- Blogs/Contact: Purple (`#F3E5F5`)
- Footer: Dark blue-grey (`#263238`)
