#!/bin/bash
cd "$(dirname "$0")"
fuser -k 3000/tcp 2>/dev/null
sleep 1
rm -rf .next
npx next dev --turbopack &
echo "Waiting for server..."
for i in $(seq 1 60); do
  sleep 2
  if curl -s -o /dev/null -w "" http://localhost:3000 2>/dev/null; then
    echo "Server ready at http://localhost:3000"
    exit 0
  fi
done
echo "Server may still be starting..."
