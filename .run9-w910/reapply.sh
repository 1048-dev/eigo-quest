#!/bin/sh
# reset worlds 9-10 to HEAD, apply all patches, re-dump
set -e
cd "$(dirname "$0")/.."
git checkout -- content/curriculum/worlds/world-09.json content/curriculum/worlds/world-10.json
node .run9-w910/apply.mjs "$@"
node .run9-w910/dump.mjs . .run9-w910/dump
