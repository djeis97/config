xmodmap .Xmodmap
xmodmap -e "clear lock"
#cd xstarts
#exec gnome-session
awesome &
#exec qtile
#python2 -c "while True:	pass"


#sxhkd &
#terminator &
#exec bspwm
#exec startNwm
#stumpwm >.stumplog &
sleep 2
pulseaudio &
#sleep 5
#./startupScript
exec xterm
