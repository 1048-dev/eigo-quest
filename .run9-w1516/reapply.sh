#!/bin/sh
# reset worlds 15-16 to HEAD, apply all patches (00-20) in order, mark reviewed, re-dump
set -e
cd "$(dirname "$0")/.."
git checkout -- content/curriculum/worlds/world-15.json content/curriculum/worlds/world-16.json
node .run9-w1516/apply.mjs --mark "$@"
node .run9-w1516/dump.mjs . .run9-w1516/dump
