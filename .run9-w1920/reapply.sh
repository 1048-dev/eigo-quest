#!/bin/sh
# reset worlds 19-20 to HEAD, apply all patches (00-20) in order, mark reviewed, re-dump
set -e
cd "$(dirname "$0")/.."
git checkout -- content/curriculum/worlds/world-19.json content/curriculum/worlds/world-20.json
node .run9-w1920/apply.mjs --mark "$@"
node .run9-w1920/dump.mjs . .run9-w1920/dump
