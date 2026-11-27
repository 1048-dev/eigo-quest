#!/bin/sh
# reset worlds 5-6 to HEAD, apply all patches, re-dump
set -e
cd "$(dirname "$0")/.."
git checkout -- content/curriculum/worlds/world-05.json content/curriculum/worlds/world-06.json
node .run9-w56/apply.mjs "$@"
node .run9-w56/dump.mjs . .run9-w56/dump
