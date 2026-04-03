source ~/.xinitrc.common
xrandr --output DP-0 --primary --auto --output DP-2 --mode 1920x1080 --right-of DP-0 --output HDMI-0 --left-of DP-0 --auto
run_normal_wm
