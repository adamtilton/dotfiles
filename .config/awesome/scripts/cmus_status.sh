#!/bin/bash

cmus_remote_q=$(cmus-remote -Q 2>&1)
IFS=$'\n'
CMUS=($cmus_remote_q)

declare -A status_symbols=(
        ['status playing']='>'
        ['status stopped']='.'
        ['status paused']='='
)
status_symbol="${status_symbols[${CMUS[0]}]}"

play_stub(){
  artist=${CMUS[4]}
  album=${CMUS[5]}
  title=${CMUS[6]}
  echo -n $(echo "$artist .. $album .. $title" | \
    sed s'/tag \(artist\|album\|title\)[[:space:]]//g' | recode ..html)
}

progress(){
  position=$(echo ${CMUS[3]} | sed 's/position //')
  duration=$(echo ${CMUS[2]} | sed 's/duration //')
  percentage=$(echo "scale=2;$position/$duration" | bc)
  scaled_percentage=$(echo "(20 * $percentage)/1" | bc)
  fill=
  for i in $(seq 1 $scaled_percentage); do 
    fill="$fill#"
  done
  printf "[%-20s] $(echo "($percentage*100)/1" | bc)%% " $fill

}

status() {
  if [[ $cmus_remote_q != "cmus-remote: cmus is not running" ]]; then
    if [[ "$status_symbol" == 'status stopped' ]]; then
      echo $status_symbol
    else
      progress
      echo -n "$status_symbol "
      play_stub
      echo
    fi
  else
    echo 'not running'
  fi
}

status
