#!/bin/sh
# reset worlds 11-12 to HEAD, apply all patches (00-20) in order, mark reviewed, re-dump
set -e
cd "$(dirname "$0")/.."
git checkout -- content/curriculum/worlds/world-11.json content/curriculum/worlds/world-12.json
node .run9-w1112/apply.mjs --mark "$@"
node .run9-w1112/dump.mjs . .run9-w1112/dump
