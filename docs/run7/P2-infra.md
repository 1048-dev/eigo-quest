# Phase 2 - code changes for 1,200 lessons
- Split content/curriculum/lessons.json into per-world files (content/curriculum/worlds/world-01.json ...), keep a small index (titles, stage, world). Update loaders,
  seed, worksheets generator, tests and anything that imports lessons.json. Measure client bundle sizes before/after and record them.
- Add stage/level fields (optional) and world themes for worlds 13-40 on the map (names from the plan; reuse visual styles with new color palettes).
- Monthly PDF per 20 lessons; parent overview shows: current stage/level, school English completed up to grade N, words learned.
- All tests/validation work for any number of worlds.
