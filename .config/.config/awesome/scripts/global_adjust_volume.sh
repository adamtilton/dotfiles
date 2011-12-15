#!/bin/sh

# adjust either desktop PCM or stereo system volume (via squeezebox
# server) depending upon which one is currently playing =)  this is
# intended to be an awesome keyboard shortcut callback
#
# yes, I am lazy

if [[ $# -ne 1 ]]; then
  exit 1
fi

cmus-remote -Q
if [[ $? -eq 0 ]]; then
  amixer -q set Master 1%+
  amixer -q set Master 1%-
fi
        
# http://downbe:9000/html/docs/cli-api.html?player=#mixer%20volume
HOST=localhost
PORT=9090
VOL_STEP=5

# scriptable consumer electronics are sooooooooooooooooooo rad

#player_id=$((echo "player id ?"; sleep 1)|telnet $HOST $PORT|sed 's/player id %3F //')
#echo "$player_id"
player_id="00:04:20:12:97:e5"
(echo "$player_id mixer volume $1${VOL_STEP}"; sleep 1)|telnet $HOST $PORT
