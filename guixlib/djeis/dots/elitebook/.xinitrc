#!/usr/bin/env sh
#source ~/.profile
source ~/.xinitrc.common
xinput set-prop "SYNA3099:00 06CB:CD74 Touchpad" "libinput Disable While Typing Enabled" 0
nm-applet &
run_normal_wm
