# FRONT-B6 — Notification Templates Editor

Title: Rich Text Editor for Notification Templates
Priority: B (Medium Priority - Operations)
Area: Notifications / Frontend
Owner Role: Implementer / Reviewer

Problem (Evidence):
- `/notifications` page shows templates but no rich editor
- Email templates edited as plain text
- No preview functionality
- No variable insertion helper ({{clientName}}, {{serviceName}}, etc.)
- Missing template testing (send test email)

Goal:
- Add rich text editor for email templates
- Preview mode for email/WhatsApp templates
- Variable picker for dynamic content
- Test send functionality

Scope (In/Out):
- In: Rich editor, preview, variables, test send
- Out: Template versioning (future enhancement)

Plan:
1. Integrate rich text editor (TipTap, Quill, or similar)
2. Add preview pane with sample data
3. Create variable picker component
4. Implement "Send Test" functionality
5. Add template validation (required fields)
6. Save draft functionality

Files to modify:
- apps/web/src/app/(app)/notifications/page.tsx
- Create new components:
  - TemplateEditor.tsx
  - TemplatePreview.tsx
  - VariablePicker.tsx
- apps/web/src/lib/admin-api.ts (test send endpoint)

Acceptance Criteria (Given/When/Then):
1. Given notification template, When user edits, Then rich text editor displays
2. Given template editor, When user clicks variable, Then inserts {{variable}}
3. Given template complete, When clicks preview, Then shows rendered version
4. Given template saved, When clicks "Send Test", Then receives test email

Test Evidence Required:
- Manual: Edit template with formatting (bold, links, etc.)
- Manual: Insert variables and verify they render in preview
- Manual: Send test email and verify formatting
- Manual: Test with long content to verify mobile responsiveness

Backend Requirements:
- POST /api/v1/notifications/templates/{id}/test-send
  - Body: { email: "test@example.com" }
- GET /api/v1/notifications/variables → returns available variables

UX Checks:
- [ ] Editor has formatting toolbar (bold, italic, link)
- [ ] Variable picker shows description of each variable
- [ ] Preview updates in real-time
- [ ] Test send shows success confirmation

Libraries to consider:
- TipTap (modern, React-friendly)
- Quill (proven, stable)
- Slate (highly customizable)

Status:
- Estado: DEFERRED
- Fecha: 2026-01-20
- Razón: Requiere instalación de dependencia externa (TipTap/Quill)
- Prioridad: Sprint 3 (después de B4, B5, B7, B8)

---

## Implementation Plan (Detailed)

### Step 1: Install Dependencies
```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-link
```

### Step 2: Create TemplateEditor Component
- Rich text toolbar with bold, italic, underline, link
- Variable insertion button
- Character count
- Save/Cancel buttons

### Step 3: Create VariablePicker Component
- Dropdown with all available variables
- Description tooltips
- Click to insert into editor at cursor position

### Step 4: Create TemplatePreview Component
- Render template with sample data
- Side-by-side or toggle view
- Mobile preview

### Step 5: Integrate Test Send
- Add "Send Test" button
- Email input modal
- Success/error notifications

### Files to Create:
- apps/web/src/app/components/notifications/TemplateEditor.tsx
- apps/web/src/app/components/notifications/VariablePicker.tsx
- apps/web/src/app/components/notifications/TemplatePreview.tsx

### Backend Requirements:
- POST /api/v1/notifications/templates/:id/test-send
- GET /api/v1/notifications/variables

---

## Technical Notes

Current page shows basic list of templates but editing experience is minimal.

Example variables to support:
- {{clientName}} - Client's full name
- {{clientEmail}} - Client's email
- {{serviceName}} - Booked service name
- {{therapistName}} - Assigned therapist
- {{appointmentDate}} - Formatted date
- {{appointmentTime}} - Formatted time
- {{clinicName}} - Clinic name
- {{clinicPhone}} - Clinic phone
- {{confirmationLink}} - Link to confirm/cancel
