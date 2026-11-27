#!/bin/sh
# reset worlds 21-22 to HEAD, apply all patches (00-20) in order, mark reviewed, re-dump
set -e
cd "$(dirname "$0")/.."
git checkout -- content/curriculum/worlds/world-21.json content/curriculum/worlds/world-22.json
node .run9-w2122/apply.mjs --mark "$@"
node .run9-w2122/dump.mjs . .run9-w2122/dump
