---
title: "Road and terrain"
type: alan
url: "/en/road-and-terrain/"
description: "The road project from the survey point to the mass haul diagram: terrain, alignment, profile, typical section, corridor and earthwork volumes in one program."
ustEtiket: "Workspace"
ozet: "The whole road project, from the survey point to the mass haul diagram, runs in the same file. Superelevation and spirals follow KGM (General Directorate of Highways)."
kapakSekil:
  dosya: "img/sekil/y01.png"
  alt: "Road corridor fitted to mountainous terrain, 3D view"
  not: "Tepe Geçidi · road fitted to mountainous terrain, with cut and fill slopes"
bolumler:
  - baslik: "Terrain"
    metin: "The terrain surface is built from the data you have. Satellite imagery and institutional background maps are placed behind the drawing."
    maddeler:
      - { ad: "Points and TIN", yazi: "Surface from survey points" }
      - { ad: "Point cloud", yazi: "LAS and LAZ files" }
      - { ad: "Background maps", yazi: "Satellite imagery and institutional background maps" }
    sekil:
      dosya: "img/sekil/g07.png"
      alt: "Triangulated surface of mountainous terrain, 3D view coloured by elevation"
      not: "Mountainous terrain · TIN surface coloured by elevation"
  - baslik: "Points and surface"
    metin: "Survey points are managed in a single table. The surface is built from whatever data you have."
    maddeler:
      - { ad: "Point editor", yazi: "Filtering, bulk elevation assignment, renumbering" }
      - { ad: "Point groups", yazi: "Groups by rule, display settings per group" }
      - { ad: "Surface sources", yazi: "Points, elevation labels, triangles, DEM and LandXML" }
      - { ad: "Surface tools", yazi: "Extracting contours and boundary lines, offsetting the surface" }
    sekil:
      dosya: "img/sekil/y04.png"
      alt: "Point editor window: point table and bulk-edit row"
      not: "Point editor · filtering, bulk elevation, renumbering"
  - baslik: "Ground investigation"
    metin: "Borehole data is brought into the drawing. Strata and groundwater appear at the boreholes' positions on the longitudinal profile."
    maddeler:
      - { ad: "Data", yazi: "From Excel, CSV and AGS4 files" }
      - { ad: "Columns on the profile", yazi: "Stratum, SPT and groundwater in each borehole column" }
      - { ad: "Stratum surface", yazi: "A stratum surface is built between boreholes" }
    sekil:
      dosya: "img/sekil/y02.png"
      alt: "Eight borehole columns on a longitudinal profile: stratum hatches, stratum boundaries between boreholes and the groundwater line"
      not: "Borehole columns on the longitudinal profile · strata and groundwater"
  - baslik: "Borehole log"
    metin: "Each borehole's log is drawn as a sheet: strata, tests and groundwater by depth on the same page."
    maddeler:
      - { ad: "Strata", yazi: "With a depth ruler and soil-class hatching" }
      - { ad: "Tests", yazi: "SPT, sample and core values" }
      - { ad: "Groundwater", yazi: "Measured levels" }
    sekil:
      dosya: "img/sekil/y05.png"
      alt: "Borehole log sheet: depth ruler, stratum column, SPT and core values"
      not: "Borehole log · strata and tests by depth"
  - baslik: "Alignment"
    metin: "Horizontal geometry is built with curves and spirals (clothoids). Superelevation and plan display follow KGM practice."
    maddeler:
      - { ad: "Curve and spiral (clothoid)", yazi: "The transition curve is a clothoid" }
      - { ad: "Superelevation", yazi: "Calculated per KGM" }
      - { ad: "Plan display", yazi: "Curve data block and superelevation band" }
    sekil:
      dosya: "img/sekil/y06.png"
      alt: "Alignment in plan: curve, sample lines, slope limit and curve data block"
      not: "Tepe Geçidi alignment · curve, sample lines and curve data block"
  - baslik: "Profile and design profile"
    metin: "The design profile is drawn on the longitudinal profile. Vertical curve values come from the KGM handbook tables."
    maddeler:
      - { ad: "Longitudinal profile", yazi: "On the terrain profile" }
      - { ad: "Design profile", yazi: "Together with the vertical curve" }
      - { ad: "Superelevation band", yazi: "Below the profile, by chainage" }
    sekil:
      dosya: "img/sekil/y08.png"
      alt: "Longitudinal profile: terrain line and design profile; below, level, chainage, horizontal and vertical geometry and superelevation bands"
      not: "Tepe Geçidi longitudinal profile · with levels, geometry and superelevation bands"
  - baslik: "Typical section"
    metin: "The road cross-section is defined piece by piece: lane, shoulder, cycle path, pavement, slope, wall. Ready-made sections come from the KGM library."
    maddeler:
      - { ad: "Library", yazi: "KGM typical section library" }
      - { ad: "Preview", yazi: "The section is redrawn as you change it" }
      - { ad: "Section from drawing", yazi: "A definition is extracted from an existing section drawing" }
    sekil:
      dosya: "img/sekil/y09.png"
      alt: "Typical section window: preview of an urban road section with a cycle path; below, the cut and fill slope gradients"
      not: "Typical section · urban road with a cycle path, slope gradients"
  - baslik: "Corridor"
    metin: "When the alignment, design profile and typical section come together, the 3D road model, the corridor, is created."
    maddeler:
      - { ad: "3D model", yazi: "Lanes, pavement, slope and wall sit on the terrain" }
      - { ad: "Intersection", yazi: "At-grade intersection and roundabout" }
      - { ad: "Corridor surface", yazi: "Surfaces and lines are extracted from the corridor" }
    sekil:
      dosya: "img/sekil/y10.png"
      alt: "Road corridor close up: lanes, cycle path, pavement, cut wall and slope"
      not: "Corridor close up · cut section with a wall"
  - baslik: "Earthwork volumes"
    metin: "Cut and fill volumes are calculated from the road model."
    maddeler:
      - { ad: "Cut and fill", yazi: "By soil class" }
      - { ad: "Mass haul diagram", yazi: "Haul-balanced" }
      - { ad: "Periodic volumes", yazi: "Delivered as an Excel file" }
      - { ad: "Volume dashboard", yazi: "All volume results in one table" }
      - { ad: "Volume between two surfaces", yazi: "Cut and fill between two surfaces" }
    sekil:
      dosya: "img/sekil/g10.png"
      alt: "Mass haul diagram: surplus cut and fill deficit"
      not: "Vadi Yolu mass haul diagram · surplus cut and fill deficit"
  - baslik: "Excavation design and site grading"
    metin: "A foundation pit, a platform or site grading is defined by a formation level and slopes; the volume is calculated right away."
    maddeler:
      - { ad: "Excavation design", yazi: "Formation level, slope gradient and benches" }
      - { ad: "Site grading", yazi: "Cut and fill for a site" }
      - { ad: "3D result", yazi: "Formation and slopes are shown on the terrain" }
    sekil:
      dosya: "img/sekil/y13.png"
      alt: "Grading platform on a hillside: slopes and benches, 3D view"
      not: "Site grading · slopes and benches"
  - baslik: "Sheets"
    metin: "The sheets to be delivered come out as DXF."
    maddeler:
      - { ad: "Longitudinal profile", yazi: "DXF" }
      - { ad: "Cross-section", yazi: "DXF" }
      - { ad: "Earthwork volume schedule", yazi: "XLSX or CSV" }
    sekil:
      dosya: "img/sekil/y11.png"
      alt: "Four stations from a cross-section sheet: cut and fill, retaining wall, cycle path; levels and areas below each section"
      not: "Tepe Geçidi cross-section sheet · cut, fill and walled sections"
ciktilar:
  - { ad: "Longitudinal profile sheet", bicim: "DXF" }
  - { ad: "Cross-section sheets", bicim: "DXF" }
  - { ad: "Earthwork volume schedule", bicim: "XLSX · CSV" }
  - { ad: "Mass haul diagram", bicim: "DXF" }
  - { ad: "Periodic volumes", bicim: "XLSX" }
  - { ad: "Alignment and surface data", bicim: "LandXML" }
yapmaz:
  - "It does not write DWG (drawings are delivered as DXF)."
  - "It does not produce a PDF of the sheets."
  - "It does not calculate retaining walls; the wall shown in a section is representative."
  - "Road rehabilitation is out of scope."
demolar: ["d07", "d08", "d10", "d11", "d12"]
sorular: ["dwg", "kurum"]
---
