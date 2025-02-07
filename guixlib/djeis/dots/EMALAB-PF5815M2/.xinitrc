#!/usr/bin/env bash
#source ~/.profile
#setxkbmap -option "ctrl:swapcaps"
#xmodmap -e "keycode any = F20"
#xcape -e "Alt_L=parenleft;Alt_R=parenright;#66=F20"
export _JAVA_AWT_WM_NONREPARENTING=1
nm-applet &
picom --backend=xrender &
xss-lock -- slock &
dunst &
playerctld &
feh --bg-scale ~/AltDesktop.jpg
exec emacs -f exwm-enable
