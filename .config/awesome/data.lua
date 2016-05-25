local modality = require("modality")
local max = require("awful.layout.suit.max")
local tile = require("awful.layout.suit.tile")
local mymax = require("max")

-- Indep Constants
GIMP_CLASS = "Gimp-2.8"
AUDIO_COM_NAME = "MusicTerm"
JACK_EQ_CLASS = "Jackeq"
CONKY_CLASS = "Conky"
PULSE_CONTROL_CLASS = "Pavucontrol"
JACK_CONTROL_CLASS = "qjackctl"
JACK_MIXER_CLASS = "Jack_mixer"
SKYPE_CLASS = "Skype"
STEAM_CLASS = "Steam"
FIREFOX_CLASS = "Firefox"
LIBREOFFICE_CLASS = "libreoffice-writer"
GLOBULATION_CLASS = "glob2"

layouts =
{
    tile,
    mymax,
}

-- {{{ Data

naughtyIDs = {}

-- }}}


mainScreen = capi.screen[mouse.screen]

-- myLayout.lua
clientSkip = 0
uselessGaps = 0
windowTree = {}
clientData = {workarea={x=mainScreen.workarea.x, y=mainScreen.workarea.y, width=mainScreen.workarea.width, height=mainScreen.workarea.height}, stickies={}}


-- tags.lua
tags = {}
tagData = {}
tagGap = 5
stickyStuff = {{"h", 2, {.72}, {{}, {}}}}
stickyStuff[1][4][2].parent = stickyStuff[1]
-- globals
terminal = "terminator"
editor = os.getenv("EDITOR") or "vim"
editor_cmd = terminal .. " -e " .. editor
modkey = "Mod4"

audio_card = "1"

-- Menubar configuration
menubar.utils.terminal = terminal -- Set the terminal for applications that require it

fullscreen_count = 0
