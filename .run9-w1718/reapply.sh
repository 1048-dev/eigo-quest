#!/bin/sh
# reset worlds 17-18 to HEAD, apply all patches (00-20) in order, mark reviewed, re-dump
set -e
cd "$(dirname "$0")/.."
git checkout -- content/curriculum/worlds/world-17.json content/curriculum/worlds/world-18.json
node .run9-w1718/apply.mjs --mark "$@"
node .run9-w1718/dump.mjs . .run9-w1718/dump
