#!/bin/sh
# reset worlds 39-40 to HEAD, apply all patches (00-20) in order, mark reviewed, re-dump
set -e
cd "$(dirname "$0")/.."
git checkout -- content/curriculum/worlds/world-39.json content/curriculum/worlds/world-40.json
node .run9-w3940/apply.mjs --mark "$@"
node .run9-w3940/dump.mjs . .run9-w3940/dump
