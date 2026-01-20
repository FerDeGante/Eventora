# FRONT-B7 — Marketplace Enhancement

Title: Enhance Clinic Marketplace with Search & Filters
Priority: C (Lower Priority - Discovery)
Area: Marketplace / Frontend
Owner Role: Implementer / Reviewer

Problem (Evidence):
- `/marketplace` page shows clinics but basic functionality
- Uses fallback data when API fails
- Search only by name (no location, service type filters)
- No map view of clinics
- Missing "featured" or "recommended" sections

Goal:
- Improve search with multiple filters
- Add location-based search
- Consider map view for clinic discovery
- Highlight featured clinics

Scope (In/Out):
- In: Enhanced filters, location search, featured section
- Out: Ratings/reviews system (future phase)

Plan:
1. Add filter options:
   - Location (city, neighborhood)
   - Service type (spa, fisio, quiro, etc.)
   - Price range
   - Availability (has slots today/this week)
2. Implement location-based search (distance from user)
3. Add "Featured Clinics" section
4. Consider map view (Google Maps integration)
5. Improve clinic card with more details

Files to modify:
- apps/web/src/app/(app)/marketplace/page.tsx
- apps/web/src/lib/admin-api.ts (enhanced search endpoint)
- Create FilterPanel component

Acceptance Criteria (Given/When/Then):
1. Given marketplace, When user searches by location, Then shows nearby clinics
2. Given filters applied, When user selects service type, Then updates results
3. Given user location, When loads marketplace, Then sorts by distance
4. Given featured clinics exist, When page loads, Then displays at top

Test Evidence Required:
- Manual: Search by location and verify results
- Manual: Apply multiple filters simultaneously
- Manual: Test with/without geolocation permission

Backend Requirements:
- GET /api/v1/clinics/search?q={query}&location={lat,lng}&serviceType={type}&radius={km}
- GET /api/v1/clinics/featured → returns featured clinics

UX Checks:
- [ ] Filter panel is mobile-friendly
- [ ] Clear "active filters" display
- [ ] "Reset filters" button
- [ ] Loading state during search

Optional enhancements:
- Map view toggle (list/map)
- "Save favorite clinics" for logged-in users
- "Share clinic" functionality

Status:
- Estado: TODO
- Fecha: 2026-01-20

---

## Technical Notes

Current implementation (lines 10-27) uses fallback clinics.
API call exists but filter functionality is limited.

Consider using:
- Google Maps JavaScript API for map view
- Geolocation API for user location
- Distance calculation (Haversine formula or backend)
