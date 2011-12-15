#!/bin/sh

# adjust playback of squeezebox server or cmus, depending upon which one
# is currently playing =)  this is intended to be an awesome keyboard
# shortcut callback
#
# I am soooooo lazy

if [[ $# -ne 1 ]]; then
  exit 1
fi

cmus-remote -Q
if [[ $? -eq 0 ]]; then
  cmus-remote --$1
  exit 0
fi

# scriptable consumer electronics are sooooooooooooooooooo rad
# http://downbe:9000/html/docs/cli-api.html?player=#mixer%20volume
HOST=localhost
PORT=9090
player_id="00:04:20:12:97:e5"

case $1 in 
  "next")
    playlist_cmd="index +1"
    (echo "$player_id playlist index +1"; sleep 1)|telnet $HOST $PORT
    ;;
  "prev")
    (echo "$player_id playlist index -1"; sleep 1)|telnet $HOST $PORT
    ;;
  "pause")
    (echo "$player_id pause"; sleep 1)|telnet $HOST $PORT
    ;;
  *)
    exit 1
    ;;
esac
