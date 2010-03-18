#!/bin/sh

xrdb -merge $HOME/.Xdefaults

#xscreensaver -no-splash &
#gnome-power-manager&

gnome-settings-daemon&
autocutsel -selection CLIPBOARD -fork
autocutsel -selection PRIMARY -fork

#exec wmii
#exec startkde
#exec awesome
exec gnome-session
