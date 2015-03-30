-- Enables modal keybindings for clients (gets in between client and keyboard
-- to remap existing client keystrokes to modal ones)
local clientData = {}
local modality = {}

local textbox = require("wibox.widget.textbox")
currentMode = textbox()


modality.MODE=1 -- secondary group of keybindings, no nesting (yet)
modality.OPERATION=2 -- action applied to a selection
modality.COMMAND=3 -- action
modality.MOTION=4 -- moves cursor, transformed into selection by "selector" property
modality.GROUP=5 -- nestable keybinding group, exits to last mode on first op/command/motion (used for key chaining)


function modality.modeSwitch (mode) -- sets keybinding to that of "mode", called with current mode to exit from group
    local function ret (c)
        if mode == nil or mode == "Main" then
          c:keys(modality.genKeys(c))
          clientData[c].m = "Main"
          currentMode:set_markup("Main")
        else
          for t,k in ipairs(clientData[c].tbl) do
            if k[1] == modality.MODE and k[2] == mode then
              c:keys(modality.genKeys(c, k[3]))
              clientData[c].m = mode
              currentMode:set_markup(mode)
              return
            end
          end
          naughty.notify {text="That's not a mode!", title=mode}
          c:keys(modality.genKeys(c, {}))
          return
        end
    end
    return ret
end

function modality.sendKey (mods, key)
    local modTrans = {Control="Control", Shift="Shift", Mod1="Alt"}
    local compKey = ""
    if mods == {} then
	compKey = key
    else
	for k,i in ipairs(mods) do 
            compKey = compKey .. i .. "+"
	end
	compKey = compKey .. key
    end
    return function (c)
	awful.util.spawn_with_shell("xdotool key --window " .. tostring(c.window) .. " " .. compKey)
    end
end

-- Based on a Libreoffice Keybinding
modality.exampleData = {selector="Shift",
                     {modality.MOTION, {}, "h", {}, "Left"}, -- press h, sends Left
                     {modality.MOTION, {}, "j", {}, "Down"},
	     	     {modality.MOTION, {}, "k", {}, "Up"},
	             {modality.MOTION, {}, "l", {}, "Right"},
	             {modality.OPERATION, {}, "c", function (c) modality.sendKey({}, "Delete")(c) modality.modeSwitch("Insert")(c) end}, -- press c, waits for motion/selection, presses Delete and switches mode to Insert
		     {modality.OPERATION, {}, "d", modality.sendKey({}, "Delete")},
	             {modality.COMMAND, {}, "i", modality.modeSwitch("Insert")}, -- press i, switch to insert mode
	             {modality.COMMAND, {}, "a", function (c) modality.sendKey({}, "Right")(c) modality.modeSwitch("Insert")(c) end},
		     {modality.COMMAND, {"Shift"}, "a", function (c) modality.sendKey({}, "End")(c) modality.modeSwitch("Insert")(c) end },
		     {modality.COMMAND, {}, "v", modality.modeSwitch("Visual")},
		     {modality.MODE, "Insert", {
			     {modality.COMMAND, {}, "Escape", modality.modeSwitch()}
		     }}, -- Secondary modes, where the third value is a table of alternate keybindings
		     {modality.SUB, {}, "g", {
			     {modality.MOTION, {}, "g", {"Control"}, "Home"} -- press gg, goes to start of document
		     }}}

function modality.registerClient (c, tbl)
	clientData[c] = {tbl=tbl, m="Main", s=0, c=nil}
	c:keys(modality.genKeys(c))
end



function modality.genKeys (c, tbl)
	local tbl = tbl or clientData[c].tbl
	local keystbl = {}
	local function motion (mods, k)
		return function (c)
			if clientData[c].s == 1 then -- Motion from operation
				modality.sendKey(awful.util.table.join({clientData[c].tbl.selector}, mods), k)(c)
				clientData[c].c()
				clientData[c].s = 0
			else
				modality.sendKey(mods, k)(c)
			end
			modality.modeSwitch(clientData[c].m)(c)
		end
	end
	local function operation (f)
		return function (c)
			if clientData[c].s == 1 then clientData[c].s = 0 return end
			clientData[c].s = 1
			clientData[c].c = function ()
				naughty.notify {title="OPN callback", text=tostring(f)}
				f(c)
			end
			modality.modeSwitch(clientData[c].m)(c)
		end
	end
	local function command (f)
		return function (c)
			if clientData[c].s == 1 then clientData[c].s = 0 return end
			f(c)
			modality.modeSwitch(clientData[c].m)(c)
		end
	end

	local function sub (tbl)
		return function (c)
			c:keys(modality.genKeys(c, tbl))
		end
	end

	for t,k in ipairs(tbl) do
		if k[1] == modality.MOTION then
			keystbl = awful.util.table.join(keystbl, awful.key(k[2], k[3], motion(k[4], k[5])))
		end
		if k[1] == modality.OPERATION then
			keystbl = awful.util.table.join(keystbl, awful.key(k[2], k[3], operation(k[4])))
		end
		if k[1] == modality.COMMAND then
			keystbl = awful.util.table.join(keystbl, awful.key(k[2], k[3], command(k[4])))
		end
		if k[1] == modality.SUB then
			keystbl = awful.util.table.join(keystbl, awful.key(k[2], k[3], sub(k[4])))
		end
	end
	return awful.util.table.join(keystbl, clientkeys)
end

modality.clientData = clientData

return modality
