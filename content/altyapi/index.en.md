---
title: "Infrastructure"
type: alan
url: "/en/infrastructure/"
description: "Build, check and draw up sheets for sewer, stormwater and water supply networks in one drawing, from the manhole to the trench volumes."
ustEtiket: "Workspace"
ozet: "Sewer, stormwater and water supply networks are built in the same drawing, from the manhole to the trench volumes. Levels come from the institution's rules and errors are fixed with one click."
kapakSekil:
  dosya: "img/sekil/g02.png"
  alt: "Pipes and manholes of three utility networks, 3D view with the terrain hidden"
  not: "Three networks in one drawing · manhole and pipe bodies, 3D view with the terrain hidden"
bolumler:
  - baslik: "Building the network"
    metin: "The manhole and pipe network is built in the drawing. Levels are taken from the rules of the institution you choose. Several networks sit side by side in the same drawing."
    maddeler:
      - { ad: "Manholes and pipes", yazi: "Manholes and pipes are placed along the line" }
      - { ad: "Levels", yazi: "Invert levels come from the institution's rules" }
      - { ad: "Several networks", yazi: "Sewer, stormwater and water supply in the same drawing" }
      - { ad: "Catalogue", yazi: "Manhole and pipe products are chosen from a catalogue" }
    sekil:
      dosya: "img/sekil/a01.png"
      alt: "Utility network in plan: manholes, pipes and their labels"
      not: "Network plan · with manhole and pipe labels"
  - baslik: "Network from existing data"
    metin: "There is no need to redraw the network from scratch. It is built from the data you already have."
    maddeler:
      - { ad: "Old drawing", yazi: "The network is extracted from the lines and text of an old drawing" }
      - { ad: "Field survey", yazi: "From GSI, CSV and Excel files" }
      - { ad: "LandXML", yazi: "From the pipe network in a LandXML file" }
    sekil:
      dosya: "img/sekil/a02.png"
      alt: "Manhole and pipe network built over the lines of an old drawing"
      not: "Network built from an old drawing"
  - baslik: "Rule check"
    metin: "The network is checked against the rules of the selected institution. What is non-compliant is listed; errors are fixed with one click."
    maddeler:
      - { ad: "Slope and cover", yazi: "Compared with the rule limits" }
      - { ad: "Velocity and drop", yazi: "Compared with the rule limits" }
      - { ad: "Manhole spacing", yazi: "Compared with the rule limits" }
      - { ad: "Network records", yazi: "Manholes and pipes in a table; findings listed by heading" }
    sekil:
      dosya: "img/sekil/a03.png"
      alt: "Findings in the network records window: category, heading and rows with severity colours"
      not: "Findings · non-compliant manholes and pipes"
  - baslik: "3D and clashes"
    metin: "Manhole and pipe bodies are visible in 3D below the terrain. The x-ray view lets you read what is inside the ground."
    maddeler:
      - { ad: "X-ray view", yazi: "The network is visible below the terrain" }
      - { ad: "Show or hide network by network", yazi: "Each network is switched on and off separately" }
      - { ad: "Clashes", yazi: "Crossings between networks are marked in 3D and added to the findings list" }
    sekil:
      dosya: "img/sekil/a04.png"
      alt: "Where two networks cross, 3D view; the clash is marked and its explanation appears on hover"
      not: "Clashes between networks · marked in 3D"
  - baslik: "Trench volumes"
    metin: "Trench excavation, bedding, surround, manholes and backfill are calculated separately. Several networks in the same trench are handled together."
    maddeler:
      - { ad: "Items", yazi: "Excavation, bedding, surround, manholes, backfill" }
      - { ad: "Shared trench", yazi: "Including benches and sloping ground" }
      - { ad: "Network table", yazi: "Delivered as an Excel file" }
    sekil:
      dosya: "img/sekil/g03.png"
      alt: "Shared trench cross-section on a slope: the water pipe in its own bench, the manhole at the trench bottom; area table below"
      not: "Shared trench cross-section on a slope · Ø250 water pipe in its own bench, manhole at the bottom · km 0+000"
  - baslik: "Longitudinal profile"
    metin: "The pipeline's longitudinal profile is drawn as a sheet together with the terrain, pipe and manholes."
    maddeler:
      - { ad: "Terrain and pipe", yazi: "On the same profile" }
      - { ad: "Manholes", yazi: "With their positions and levels" }
      - { ad: "Output", yazi: "DXF" }
    sekil:
      dosya: "img/sekil/a05.png"
      alt: "Longitudinal profile sheet of a pipeline: terrain, pipe, manholes and level bands"
      not: "Longitudinal profile sheet"
  - baslik: "Trench cross-section and manhole detail"
    metin: "The trench cross-section and the manhole detail come out of the drawing as sheets."
    maddeler:
      - { ad: "Trench cross-section", yazi: "Cross-section sheet of the trench" }
      - { ad: "Manhole detail", yazi: "Sections, plan and parts list" }
      - { ad: "Output", yazi: "DXF" }
    sekil:
      dosya: "img/sekil/g05.png"
      alt: "Manhole detail sheet: two sections, plan and parts list"
      not: "Manhole detail sheet · sections A-A and B-B, plan, parts list"
ciktilar:
  - { ad: "Longitudinal profile sheet", bicim: "DXF" }
  - { ad: "Trench cross-section · manhole detail", bicim: "DXF" }
  - { ad: "Utility network table", bicim: "XLSX" }
  - { ad: "Alignment and surface data", bicim: "LandXML" }
yapmaz:
  - "It does not calculate pipe diameter or flow (there is no hydraulic calculation)."
  - "There is no catchment calculation."
  - "It does not produce institutional payment schedules."
demolar: ["d09", "v-sogutlu"]
sorular: ["kurum", "dwg"]
---
