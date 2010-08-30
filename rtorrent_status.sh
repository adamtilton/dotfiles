#!/bin/sh

self=$(basename $0)
rtorrent_pid=$(ps fuax|grep rtorrent|grep -v "grep\|$self")

if [[ -z "$rtorrent_pid" ]]; then
  echo "not running"
else
  echo "running"
fi
