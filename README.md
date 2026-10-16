# AURA Architecture & Luxury Construction — Interactive Showcase

A 4-section luxury architectural showcase website featuring continuous video scrubbing, GSAP blueprint image comparison, and 6 full-width scroll-scrubbed engineering panels:

1. **Section 1: Video Construction Timeline**:
   - Scroll through 240 video frames with pure scroll.
   - Compact bottom phases dock (*Earthworks → Foundation → Framing → Envelope → Completion*).
2. **Section 2: GSAP Image Comparison On Scroll**:
   - Built with **GSAP 3.12** and **ScrollTrigger** (CodePen `oNjgEjm`).
   - Pinned curtain wipe between Architectural CAD Blueprint (left) and Completed Residence (right).
3. **Section 3: Full-Width Scroll-Driven Continuous Panels**:
   - **100% full-width images (`100vw × 100vh`)** with GreenSock counter-translating parallax wipe.
   - **Tied directly to manual page scroll:** 0% to 100% scrub (zero automatic changes).
   - **6 Progressive Engineering Cards:**
     - `01 • Geotechnical Grading`: Site Topography & Earthworks
     - `02 • Subterranean Core`: Reinforced Bedrock Foundation
     - `03 • Structural Framing`: Post-Tensioned Superstructure
     - `04 • Cantilevered Volumes`: Defying Gravity with Cantilevers
     - `05 • Climate Envelope`: Frameless Acoustic Glass Facades
     - `06 • Turnkey Completion`: Completed Architectural Masterpiece
   - **Interactive Scrub Pills:** `01` to `06` pills track scroll position and allow quick jumping.
4. **Section 4: Project Consultation & Luxury Footer**:
   - Direct consultation booking form and corporate details.

---

## 🚀 Live Preview

The local development server is running:

👉 **[http://localhost:8000/index.html](http://localhost:8000/index.html)**

To start or restart the server at any time:
```powershell
python serve.py
```
