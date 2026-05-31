#!/usr/bin/env bash

SCENARIO="$1"

if [ -z "$SCENARIO" ]; then
  echo "Usage: ./run-k6.sh <scenario-file>"
  echo "Example: ./run-k6.sh notification-list.js"
  exit 1
fi

ENV_FILE=".env"

if [ -f "load_test.env" ]; then
  ENV_FILE="load_test.env"
elif [ -f "load_Test.env" ]; then
  ENV_FILE="load_Test.env"
elif [ -f ".env" ]; then
  ENV_FILE=".env"
else
  echo "Missing env file. Expected one of: load_test.env, load_Test.env, .env"
  exit 1
fi

echo "Using env file: $ENV_FILE"
echo "Running scenario: $SCENARIO"

MSYS_NO_PATHCONV=1 docker run --rm -i \
  --env-file "$ENV_FILE" \
  -v "$(pwd -W):/scripts" \
  grafana/k6 run \
  --insecure-skip-tls-verify \
  "/scripts/scenarios/$SCENARIO"