#!/bin/sh
# reset worlds 25-26 to HEAD, apply all patches (00-20) in order, mark reviewed, re-dump
set -e
cd "$(dirname "$0")/.."
git checkout -- content/curriculum/worlds/world-25.json content/curriculum/worlds/world-26.json
node .run9-w2526/apply.mjs --mark "$@"
node .run9-w2526/dump.mjs . .run9-w2526/dump
