#!/bin/sh
# reset worlds 29-30 to HEAD, apply all patches (00-20) in order, mark reviewed, re-dump
set -e
cd "$(dirname "$0")/.."
git checkout -- content/curriculum/worlds/world-29.json content/curriculum/worlds/world-30.json
node .run9-w2930/apply.mjs --mark "$@"
node .run9-w2930/dump.mjs . .run9-w2930/dump
