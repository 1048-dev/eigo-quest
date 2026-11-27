#!/bin/sh
# reset worlds 13-14 to HEAD, apply all patches (00-20) in order, mark reviewed, re-dump
set -e
cd "$(dirname "$0")/.."
git checkout -- content/curriculum/worlds/world-13.json content/curriculum/worlds/world-14.json
node .run9-w1314/apply.mjs --mark "$@"
node .run9-w1314/dump.mjs . .run9-w1314/dump
