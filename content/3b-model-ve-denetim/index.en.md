---
title: "3D model and compliance check"
type: alan
url: "/en/3d-model-and-compliance/"
description: "Building, services and landscape in one 3D model. The model is checked against a rule set; what is non-compliant appears in red. The first rule set is landscape."
ustEtiket: "Workspace"
ozet: "Building, services and landscape are drawn in one model. The model is checked against a rule set; every rule carries its source and article number."
kapakSekil:
  dosya: "img/sekil/g12.png"
  alt: "Two towers, podium and landscape; ATA CAD 3D model"
  not: "Erguvan · two towers, 96 apartments, podium and landscape"
bolumler:
  - baslik: "Structure"
    metin: "Building elements are drawn in 3D and distributed over the storeys."
    maddeler:
      - { ad: "Load-bearing", yazi: "Wall, slab, column, beam" }
      - { ad: "Vertical and top", yazi: "Stair and roof" }
      - { ad: "Storey", yazi: "Elements are organised storey by storey" }
      - { ad: "Openings", yazi: "Door, window, opening and shaft" }
      - { ad: "Space", yazi: "Room and area" }
    sekil:
      dosya: "img/sekil/m01.png"
      alt: "Ground floor of the villa opened by a section: walls, stairs, furniture, garage and terrace"
      not: "Zeytinli Ev · ground floor, opened by a section"
  - baslik: "Services"
    metin: "In-building service lines are part of the model."
    maddeler:
      - { ad: "Water", yazi: "Clean water and waste water lines" }
      - { ad: "Rainwater", yazi: "Rainwater lines" }
      - { ad: "Heating", yazi: "Heating lines" }
  - baslik: "Export"
    metin: "The model is delivered in open formats so that it can be opened in other programs."
    maddeler:
      - { ad: "IFC 4.3", yazi: "Building information model format" }
      - { ad: "glTF", yazi: "3D viewing format" }
  - baslik: "Massing and components"
    metin: "The building starts from a mass and goes down to detail. Ready-made components are placed in the model; outside models are imported."
    maddeler:
      - { ad: "Massing", yazi: "A prism is drawn, its faces are pushed and pulled" }
      - { ad: "Component library", yazi: "Furniture, trees and fixtures are placed" }
      - { ad: "Model import", yazi: "glTF, OBJ and STL files" }
      - { ad: "Extraction from plan", yazi: "Walls, columns and openings from a floor plan drawing" }
    sekil:
      dosya: "img/sekil/m03.png"
      alt: "Components in the model: a furnished house, trees, a car, a bench and lighting"
      not: "Components in the model · furniture, trees and fixtures"
  - baslik: "Landscape"
    metin: "Road, car park, green area, play and sports areas sit on the terrain."
    sekil:
      dosya: "img/sekil/g14.png"
      alt: "Tree-lined footpath, green area and podium square in front of the towers; 3D view"
      not: "Erguvan landscape · tree-lined footpath, green area, square"
  - baslik: "Compliance check"
    metin: "The model is checked against a rule set. The rules are in a data file, not in the program code. What is non-compliant appears in red."
    maddeler:
      - { ad: "Source", yazi: "Every rule carries its source, article number and date" }
      - { ad: "Landscape rule set", yazi: "Parking Regulation (Otopark Yönetmeliği), Zoning Regulation for Planned Areas (Planlı Alanlar İmar Yönetmeliği) and two guidelines" }
      - { ad: "Report", yazi: "The compliance report is delivered as XLSX, PDF and DXF" }
      - { ad: "Type mapping", yazi: "The drawing's layers are mapped to object types" }
    sekil:
      dosya: "img/sekil/m04.png"
      alt: "Compliance result: non-compliant in red, warnings in orange; measured value, limit and source on the same row"
      not: "Compliance result · non-compliant in red"
  - baslik: "Section, floor plan, construction sequence animation"
    metin: "Section, floor plan and construction sequence animation are produced from the same model."
    sekil:
      dosya: "img/sekil/g16.png"
      alt: "Building opened by a horizontal section: walls, columns, doors and windows seen from inside"
      not: "Building opened by a section · wall, column, door and window"
ciktilar:
  - { ad: "3D model", bicim: "IFC 4.3 · glTF" }
  - { ad: "Compliance report", bicim: "XLSX · PDF · DXF" }
yapmaz:
  - "It does not perform structural (static) calculations."
  - "It does not import IFC files."
  - "It does not replace the responsible engineer: the check result is submitted for the engineer's approval."
demolar: ["d01", "d02", "d03", "d04", "d05", "d06"]
sorular: ["kurum", "dwg"]
---
