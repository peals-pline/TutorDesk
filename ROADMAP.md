# Roadmap

TutorDesk is a usable local-first MVP. The next milestones focus on making the
workspace safer for real teaching records while keeping the product small and
approachable.

## v0.1 - Public MVP

- Student profiles, lesson notes, homework, recurring mistakes, and topic
  progress
- Markdown progress report generation
- JSON import and export
- Demo data for first-run exploration
- Responsive tutor-friendly dashboard

## v0.2 - Safer Local Data

- Move the storage adapter from `localStorage` to IndexedDB
- Add backup validation before import
- Show a preview of incoming backup records
- Add clearer recovery guidance for tutors storing real student data

## v0.3 - Daily Teaching Workflow

- Edit and delete controls for every record type
- Search across student notes, lessons, homework, and mistakes
- Faster filters for homework status and topics needing review
- Keyboard-friendly form improvements

## v0.4 - Reports and Sharing

- Report templates for parents, students, and self-review
- Configurable next-step sections
- Export selected student data as Markdown
- Optional print-friendly report view

## Later

- Offline/PWA support
- Optional encrypted local backups
- Multi-subject dashboard views
- Accessibility audit and Playwright smoke coverage

