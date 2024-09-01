source $HOME/.profile
setxkbmap -option "ctrl:swapcaps"
xrdb ~/.Xresources
xmodmap -e "keycode any = F20"
xcape -e "Alt_L=parenleft;Alt_R=parenright;#66=F20"
export _JAVA_AWT_WM_NONREPARENTING=1
xrandr --output HDMI-0 --mode 1920x1080 --rate 60 --primary --output DP-5 --right-of HDMI-0 --auto --output DVI-D-0 --left-of HDMI-0 --auto
picom &
xss-lock -- slock &
dunst &
playerctld &
feh --bg-scale ~/Dropbox/AltDesktop.jpg
exec emacs -f exwm-enable
