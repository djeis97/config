#
# ~/.bashrc
#

# If not running interactively, don't do anything

if [ "$SHLVL" -gt 1 ]; then
    if [[ $PS1 =~ (.*)"\\$" ]]; then
        PS1="${BASH_REMATCH[1]} [L$SHLVL]\\\$ "
    fi
fi

function vterm_printf(){
    if [ -n "$TMUX" ]; then
        # tell tmux to pass the escape sequences through
        # (Source: http://permalink.gmane.org/gmane.comp.terminal-emulators.tmux.user/1324)
        printf "\ePtmux;\e\e]%s\007\e\\" "$1"
    elif [ "${TERM%%-*}" = "screen" ]; then
        # GNU screen (screen, screen-256color, screen-256color-bce)
        printf "\eP\e]%s\007\e\\" "$1"
    else
        printf "\e]%s\e\\" "$1"
    fi
}

if [[ "$INSIDE_EMACS" = 'vterm' ]]; then
    function clear(){
        vterm_printf "51;Evterm-clear-scrollback";
        tput clear;
    }
fi

vterm_prompt_end(){
    vterm_printf "51;A$(whoami)@$(hostname):$(pwd)"
}
PS1=$PS1'\[$(vterm_prompt_end)\]'
vterm_cmd() {
    if [ -n "$TMUX" ]; then
        # tell tmux to pass the escape sequences through
        # (Source: http://permalink.gmane.org/gmane.comp.terminal-emulators.tmux.user/1324)
        printf "\ePtmux;\e\e]51;E"
    elif [ "${TERM%%-*}" = "screen" ]; then
        # GNU screen (screen, screen-256color, screen-256color-bce)
        printf "\eP\e]51;E"
    else
        printf "\e]51;E"
    fi

    printf "\e]51;E"
    local r
    while [[ $# -gt 0 ]]; do
        r="${1//\\/\\\\}"
        r="${r//\"/\\\"}"
        printf '"%s" ' "$r"
        shift
    done
    if [ -n "$TMUX" ]; then
        # tell tmux to pass the escape sequences through
        # (Source: http://permalink.gmane.org/gmane.comp.terminal-emulators.tmux.user/1324)
        printf "\007\e\\"
    elif [ "${TERM%%-*}" = "screen" ]; then
        # GNU screen (screen, screen-256color, screen-256color-bce)
        printf "\007\e\\"
        else
            printf "\e\\"
        fi
    }

gwith ()
{
    local PACKAGES=()
    local ARGS=()

    while [[ $1 ]]
    do
        case "$1" in
            --)
                shift
                break
                ;;
            *)
                PACKAGES+=("$1")
                shift
        esac
    done

    while [[ $1 ]]
    do
        case "$1" in
            *)
                ARGS+=("$1")
                shift
        esac
    done

    if [[ $ARGS[0] ]]; then
        guix shell glibc ${PACKAGES[@]} -- sh -c "\$GUIX_ENVIRONMENT/lib/ld-linux-x86-64.so.2 --library-path \$GUIX_ENVIRONMENT/lib ${ARGS[*]}"
    else
        echo "You need a -- to indicate pacakges."
    fi
}

eval "$(direnv hook bash)"
