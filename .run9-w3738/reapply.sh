#!/bin/sh
# reset worlds 37-38 to HEAD, apply all patches (00-20) in order, mark reviewed, re-dump
set -e
cd "$(dirname "$0")/.."
git checkout -- content/curriculum/worlds/world-37.json content/curriculum/worlds/world-38.json
node .run9-w3738/apply.mjs --mark "$@"
node .run9-w3738/dump.mjs . .run9-w3738/dump
