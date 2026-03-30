#!/bin/zsh

cd "/Users/joel.nziza/Desktop/The Matrix/Test 1" || exit 1

PORT=4173

python3 -m http.server "$PORT" >/tmp/snake-game-server.log 2>&1 &
SERVER_PID=$!

sleep 1
open "http://127.0.0.1:${PORT}/"

echo "Snake kjører på http://127.0.0.1:${PORT}/"
echo "Trykk Ctrl+C i dette vinduet når du vil stoppe serveren."

cleanup() {
  kill "$SERVER_PID" >/dev/null 2>&1
}

trap cleanup EXIT INT TERM
wait "$SERVER_PID"
