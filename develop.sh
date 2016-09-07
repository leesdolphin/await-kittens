#!/usr/bin/env bash


CleanUp() {
  kill %1;
  kill %2;
  kill %3;
}

trap CleanUp EXIT SIGINT SIGTERM

python3 -m http.server 2>/dev/null &
cd presentation/; compass watch &
cd custom_plugin; scss --watch . &

wait %1 %2 %3;
