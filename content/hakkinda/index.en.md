---
title: "About"
url: "/en/about/"
description: "Who develops ATA CAD, why a CAD platform was written and how the work is done."
---

I am Abdulbaki Atakan. I develop ATA CAD on my own. My background in infrastructure engineering and my experience in developing CAD software form the foundation of the program.

## Why a CAD platform

Two basic problems stood out in infrastructure projects.

The first was repetitive work: drawing a separate section for every line, removing double counting at crossings by hand, writing the quantities out by hand in the format the institution asks for, and updating all of this again at every revision.

The second was cost: these jobs should not need an expensive CAD subscription. Offices were paying every year for many features they did not use.

That is why ATA CAD is being developed as a platform that runs on its own, without needing any other CAD licence.

## Working principles

- **Direct contact.** You reach me directly, with no support team or intermediary.
- **The reply time is usually the same working day.**
- **Calculation accuracy comes first.** Results are not published before they are checked against known values and reference data.
- **Feedback is taken into account.** Requests from users directly affect the product's roadmap.

## The core was written from scratch

The core was written from scratch; no third-party CAD engine was used. Alignment, surface, profile, cross-section, earthwork volumes and LandXML exchange run on the program's own geometry and data model.

The geometry logic was separated into pure functions and verified with automated tests that do not depend on the screen. This approach caught errors that cannot be noticed from the interface: an offset link showing out-of-date data, a LandXML reader that skipped an element, and chainage marks placed wrongly on an alignment that does not start from zero were found by these tests.

[Contact →]({{< relref "/iletisim" >}})
