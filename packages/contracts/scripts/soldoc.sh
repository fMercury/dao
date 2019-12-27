#!/usr/bin/env bash

# Exit script as soon as a command fails.
set -o errexit

# Executes cleanup function at script exit.
trap cleanup EXIT

cleanup() {
  rm -rf .flattened
}

rm -rf .flattened
mkdir .flattened
rm -f docs/Dao.md
npx truffle-flattener contracts/Dao.sol > .flattened/Dao.sol
npx solmd .flattened/Dao.sol --dest docs/Dao.md
