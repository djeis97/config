#!/usr/bin/env bash
#source ~/.profile
setxkbmap -option "ctrl:swapcaps"
xmodmap -e "keycode any = F20"
xcape -e "Alt_L=parenleft;Alt_R=parenright;#66=F20"
xinput set-prop "SYNA3099:00 06CB:CD74 Touchpad" "libinput Disable While Typing Enabled" 0
export _JAVA_AWT_WM_NONREPARENTING=1
nm-applet &
picom &
xss-lock -- slock &
dunst &
playerctld &
feh --bg-scale ~/Dropbox/AltDesktop.jpg
exec emacs -f exwm-enable
