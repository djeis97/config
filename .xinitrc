xmodmap .Xmodmap
xmodmap -e "clear lock"
exec emacs --eval "(exwm-enable)"
