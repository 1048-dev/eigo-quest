#!/bin/sh
# reset worlds 33-34 to HEAD, apply all patches (00-20) in order, mark reviewed, re-dump
set -e
cd "$(dirname "$0")/.."
git checkout -- content/curriculum/worlds/world-35.json content/curriculum/worlds/world-36.json
node .run9-w3536/apply.mjs --mark "$@"
node .run9-w3536/dump.mjs . .run9-w3536/dump
