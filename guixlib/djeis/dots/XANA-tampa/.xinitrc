setxkbmap -option "ctrl:swapcaps"
xrdb ~/.Xresources
xmodmap -e "keycode any = F20"
xcape -e "#66=F20"
export _JAVA_AWT_WM_NONREPARENTING=1
xrandr --output DP-0 --primary --auto --output DP-2 --mode 1920x1080 --right-of DP-0 --output HDMI-0 --left-of DP-0 --auto
picom &
xss-lock -- slock &
dunst &
playerctld &
feh --bg-scale ~/Dropbox/AltDesktop.jpg
exec emacs -f exwm-enable
