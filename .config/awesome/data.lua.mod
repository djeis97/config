local modality = require("modality")

-- Indep Constants
GIMP_CLASS = "Gimp-2.8"
AUDIO_COM_NAME = "MusicTerm"
JACK_EQ_CLASS = "Jackeq"
CONKY_CLASS = "Conky"
PULSE_CONTROL_CLASS = "Pavucontrol"
FIREFOX_CLASS = "Firefox"
LIBREOFFICE_CLASS = "libreoffice-writer"
LIBREOFFICE_KEYSTBL = {selector="Shift",
                     {modality.MOTION, {}, "h", {}, "Left"}, -- press h, sends Left
                     {modality.MOTION, {}, "j", {}, "Down"},
	     	     {modality.MOTION, {}, "k", {}, "Up"},
	             {modality.MOTION, {}, "l", {}, "Right"},
		     {modality.MOTION, {}, "w", { "Control" }, "Right"},
		     {modality.MOTION, {}, "b", { "Control" }, "Left"},
	             {modality.OPERATION, {}, "c", function (c) modality.sendKey({}, "Delete")(c) modality.modeSwitch("Insert")(c) end}, -- press c, waits for motion/selection, presses Delete and switches mode to Insert
		     {modality.OPERATION, {}, "d", modality.sendKey({}, "Delete")},
	             {modality.COMMAND, {}, "i", modality.modeSwitch("Insert")}, -- press i, switch to insert mode
	             {modality.COMMAND, {}, "a", function (c) modality.sendKey({}, "Right")(c) modality.modeSwitch("Insert")(c) end},
		     {modality.COMMAND, {"Shift"}, "a", function (c) modality.sendKey({}, "End")(c) modality.modeSwitch("Insert")(c) end },
		     {modality.COMMAND, {}, "v", modality.modeSwitch("Visual")},
		     {modality.MODE, "Insert", {
			     {modality.COMMAND, { "Control" }, "c", modality.modeSwitch()}
		     }}, -- Secondary modes, where the third value is a table of alternate keybindings
		     {modality.SUB, {}, "g", {
			     {modality.MOTION, {}, "g", {"Control"}, "Home"} -- press gg, goes to start of document
		     }}
	     } 
GLOBULATION_CLASS = "glob2"
GLOBULATION_KEYSTBL = {selector="",
			{modality.MOTION, {}, "a", {}, "Left"},
			{modality.MOTION, {}, "s", {}, "Down"},
			{modality.MOTION, {}, "d", {}, "Up"},
			{modality.MOTION, {}, "f", {}, "Right"},
			{modality.COMMAND, {}, "z", function (c) modality.modeSwitch("Build") end},
			{modality.MODE, "Build", {
				{modality.COMMAND, {}, }
			}},
			{modality.MODE, "Zone", {

			}},

		}

layouts =
{
    awful.layout.suit.floating,
    awful.layout.suit.max
--	myLayout
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
stickyStuff = {{"h", 2, {.72}, {{}, {}}}}
stickyStuff[1][4][2].parent = stickyStuff[1]
-- globals
terminal = "terminator"
editor = os.getenv("EDITOR") or "nano"
editor_cmd = terminal .. " -e " .. editor
modkey = "Mod4"

audio_card = "1"

-- Menubar configuration
menubar.utils.terminal = terminal -- Set the terminal for applications that require it




