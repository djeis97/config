source $HOME/.profile
setxkbmap -option "ctrl:swapcaps"
xrdb ~/.Xresources
xmodmap -e "keycode any = F20"
xcape -e "Alt_L=parenleft;Alt_R=parenright;#66=F20"
export XMODIFIERS=@im=exim
export GTK_IM_MODULE=xim
export QT_IM_MODULE=xim
export CLUTTER_IM_MODULE=xim
export _JAVA_AWT_WM_NONREPARENTING=1
feh --bg-scale ~/Dropbox/AltDesktop.jpg
#xset m 4 0
#xinput set-prop 12 'Coordinate Transformation Matrix' 1.0 0.0 0.0 0.0 1.5 0.0 0.0 0.0 1.0
#xinput set-prop 12 'Device Accel Constant Deceleration' 6
xrandr --output HDMI-0 --mode 1920x1080 --rate 60 --primary --output DP-5 --right-of HDMI-0 --auto --output DVI-D-0 --left-of HDMI-0 --auto
# xmodmap -e "clear lock"
#cd xstarts
#exec qtile
#python2 -c "while True:	pass"
#systemctl --user start remotemouse
picom &


#sxhkd &
#terminator &
#exec bspwm
#exec startNwm
#stumpwm >.stumplog &
# sleep 2
# pulseaudio &
#sleep 5
#./startupScript
# exwm-start
#exec xterm
exec emacs -eval "(exwm-enable)"
# exec gnome-session
# exec awesome
