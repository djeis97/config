PATH=~/.pyenv/bin:~/bin:$PATH
export SSH_AUTH_SOCK=/run/user/1000/keyring/ssh
eval "$(pyenv init -)"
eval "$(pyenv virtualenv-init -)"

