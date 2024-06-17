#!/usr/bin/env bash
source ~/.profile
setxkbmap -option "ctrl:swapcaps"
xmodmap -e "keycode any = F20"
xcape -e "Alt_L=parenleft;Alt_R=parenright;#66=F20"
xinput set-prop "SYNA3099:00 06CB:CD74 Touchpad" "libinput Disable While Typing Enabled" 0
#export XMODIFIERS=@im=exwm-xim
#export GTK_IM_MODULE=xim
#export QT_IM_MODULE=xim
#export CLUTTER_IM_MODULE=xim
export _JAVA_AWT_WM_NONREPARENTING=1
export LD_LIBRARY_PATH=/home/jay/.guix-home/profile/lib
picom &
feh --bg-scale ~/Dropbox/AltDesktop.jpg
exec emacs -f exwm-enable
# exec xterm
# exec awesome
# exec gnome-session
# exec emacs -q --eval "(require 'exwm)" --eval "(require 'exwm-config)" -f exwm-config-example
# exec emacs -Q -L .emacs.d/.local/straight/repos/exwm -L .emacs.d/.local/straight/repos/xelb/ --eval (require 'exwm) --eval (require 'exwm-config) --eval (exwm-config-example)
# exec emacs -Q -L /home/jay/.emacs.d/.local/straight/repos/xelb/ -L /home/jay/.emacs.d/.local/straight/repos/exwm --eval "(require 'exwm)" --eval "(require 'exwm-config)" -f exwm-config-example -f exwm-enable
