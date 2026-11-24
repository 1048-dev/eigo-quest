# Phase 6 - monthly PDF worksheets for parents
1. pip install -r worksheets/requirements.txt (reportlab). If python is missing, record it and stop this phase.
2. Add a "monthly bundle" mode to worksheets/generate_worksheets.py: one PDF per world (30 lessons = about one month) with a cover page for parents
   (how to print, which pages to use each day, answer keys at the end). Add "npm run worksheets:month -- --world N" and "--all".
3. Generate all 12 bundles into worksheets/out/ (do NOT commit the PDFs; make sure the folder is gitignored). Open-check page counts and record them.
