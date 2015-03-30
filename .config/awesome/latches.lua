local textbox = require("wibox.widget.textbox")
local capi = {keygrabber=keygrabber}
local keygrabber = require("awful.keygrabber")



latches = {running=false, grabberFunc=nil}
latches["global"] = {}

stack = {position=0}


currentLatch = textbox()
currentLatch:set_markup("none")



local function notifyLatch ()
    print("Stuffs")
    if latches.running == false then return end
    text = ""
    for i, bind in ipairs(latches[latches.running]) do
        text = text .. string.format("%-15s%1s", bind.n, bind[2])  .. "\n"
    end
    text = text .. "Exit\t\tEsc\nHelp\t\tSpace\n"
    naughtyIDs.latch = naughty.notify({ title=latches.running, text=text, replaces_id=naughtyIDs.latch }).id
end

local function exit ()
    latches.running = false
    stack.position = 0
    currentLatch:set_markup("None")
    keygrabber.stop(latches.grabberFunc)
end

local function pop ()
    stack.position = stack.position-1
    if stack.position < 1 then
        exit()
    else
        latches.running = stack[stack.position]
    end
    currentLatch:set_markup(latches.running)
end

local function keygrab (modifiers, key, evtype, stackPos, altName)
    print("Got A " .. key .. " " .. evtype)
    stackPos = stackPos or stack.position
    name = altName or stack[stackPos] or latches.running
    print(name)
    gotOne = false
    continue = false
    if evtype == "release" then return false end
    if #modifiers > 0 then print(modifiers[1]) end
    if key == "Escape" then
        if #modifiers == 0 then
            exit()
        elseif modifiers[1] == "Shift" then
            pop()
        end
        gotOne = true
    end
    for i, bind in ipairs(latches[name]) do
        if (#bind[1] + #modifiers == 0 or utils.tableEqual(bind[1], modifiers)) and bind[2] == key and gotOne ~= true then
            bind[3]()
            gotOne = true
            if bind[4] then bind[4]() end
            if bind.esc then esc = bind.esc end
        end
    end
--    if gotOne ~= true then
--        for i, bind in pairs(globalBindings) do
--            if (#bind[1] + #modifiers == 0 or utils.tableEqual(bind[1], modifiers)) and bind[2] == key and gotOne ~= true then
--                bind[3]()
--                gotOne = true
--                if bind[4] then bind[4]() end
--            end
--        end
--    end
    if gotOne == false and stackPos > 0 then
      print("Inception! :D")
      print(stack[stackPos-1])
      gotOne = keygrab(modifiers, key, evtype, stackPos-1) or true
    end
--    if gotOne == false and stackPos>0 then
--      gotOne = keygrab(modifiers, key, evtype, 0, "global") or true
--    end
    if (key == " " and evtype ~= "release") then notifyLatch() end
    if gotOne == false then
      return false 
    end
end





local function latch (name, table)
    latches[name] = table
    local function ret ()
        print("Entered " .. name)
        currentLatch:set_markup(name)
        if capi.keygrabber.isrunning()==false then latches.grabberFunc=keygrabber.run(keygrab) end
        latches.running = name
        stack.position = stack.position + 1
        stack[stack.position] = name
    end
    latches[name].func = ret
    return ret
end

local function clatch (name, table)
    latches[name] = table
    local function ret (c)
        print("Entered ".. name)
        if capi.keygrabber.isrunning()==false then latches.grabberFunc=keygrabber.run(keygrab) end
        latches.running = name
        stack.position = stack.position + 1
        stack[stack.position] = name
	latches[name].cli = c
    end
    latches[name].func = ret
    return ret

end

globalLatch = latch("global", {})

local function addGlobalLatch (tbl)
    table.insert(latches["global"], tbl)
end

addGlobalLatch({{}, "t", function () naughty.notify({text="Test"}) end, continue})

stack[0] = "global"



local function continue ()
end


return {latch=latch, clatch=clatch, exit=exit, pop=pop, continue=continue, addGlobalLatch=addGlobalLatch, latches=latches}
