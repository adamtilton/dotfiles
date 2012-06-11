# Lines configured by zsh-newuser-install
HISTFILE=~/.histfile
HISTSIZE=100000
SAVEHIST=100000
setopt appendhistory autocd extendedglob nomatch notify
unsetopt beep
bindkey -v
# End of lines configured by zsh-newuser-install
# The following lines were added by compinstall
zstyle :compinstall filename '/home/atilton2/.zshrc'

autoload -Uz compinit
compinit
# End of lines added by compinstall

# Add a python path for my source 
export PYTHONPATH=/home/atilton2/src/python:$PYTHONPATH

# Grab my aliases
source ~/.zsh/01_aliases
