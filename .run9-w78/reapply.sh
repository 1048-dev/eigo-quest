#!/bin/sh
# reset worlds 7-8 to HEAD, apply all patches, re-dump
set -e
cd "$(dirname "$0")/.."
git checkout -- content/curriculum/worlds/world-07.json content/curriculum/worlds/world-08.json
node .run9-w78/apply.mjs "$@"
node .run9-w78/extra.mjs
node .run9-w78/dump.mjs . .run9-w78/dump
