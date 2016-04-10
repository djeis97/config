require("data")
local latches = require("latches")
local surface = require("gears.surface")
local cairo = require("lgi").cairo

local utils = {}

function utils.getIndex (list, o)
    for i=1, #list do
        if list[i] == o then return i end
    end
    return 0
end

function utils.shallowcopy (orig)
    local orig_type = type(orig)
    local copy
    if orig_type == 'table' then
        copy = {}
        for orig_key, orig_value in pairs(orig) do
            copy[orig_key] = orig_value
        end
    else -- number, string, boolean, etc
        copy = orig
    end
    return copy
end

function utils.run_once(prg,arg_string,pname,screen)
    if not prg then
        do return nil end
    end

    if not pname then
       pname = prg
    end

    if not arg_string then 
        awful.util.spawn_with_shell("pgrep -f -u jay -x '" .. pname .. "' || (" .. prg .. ")",screen)
    else
        awful.util.spawn_with_shell("pgrep -f -u jay -x '" .. pname .. " ".. arg_string .."' || (" .. prg .. " " .. arg_string .. ")",screen)
    end
end



function utils.grab_focus(idx)
    if idx == nil then idx = -1 end
    awful.client.focus.byidx(idx)
    if client.focus.class == "Conky" then
        awful.client.focus.byidx(idx)
    end
    client.focus:raise()
    client.focus:raise()
end



function utils.tiledClientCycle(clockwise, screen)
    local screen = screen or mouse.screen
    local cls = awful.client.tiled(screen)
    -- We can't rotate without at least 2 clients, buddy.
    if #cls >= 2 then
        local c = client.focus
        if clockwise then
            for i = #cls, 1, -1 do
                if not awful.client.floating.get(cls[i]) then
                    c:swap(cls[i])
                end
            end
        else
            for _, rc in pairs(cls) do
                if not awful.client.floating.get(cls[i]) then
                    c:swap(rc)
                end
            end
        end
    end
end

function utils.tiledClientSubSectionCycle (clockwise, screen)
    local screen = screen or mouse.screen
    local cls = awful.client.tiled(screen)
    -- We can't rotate without at least 2 clients, buddy.
    if #cls >= 2 then
        local c = client.focus
        if clockwise then
            for i = #cls, 1, -1 do
                if getIndex(clientData[clientData[c]], cls[i]) ~= 0 then
                    c:swap(cls[i])
                end
            end
        else
            for _, rc in pairs(cls) do
                if getIndex(clientData[clientData[c]], rc) ~= 0 then
                    c:swap(rc)
                end
            end
        end
    end
end

function utils.tiledClientSectionCycle (clockwise, screen)
    local screen = screen or mouse.screen
    local cls = awful.client.tiled(screen)
    -- We can't rotate without at least 2 clients, buddy.
    if #cls >= 2 then
        local c = client.focus
        if clockwise then
            for i = #cls, 1, -1 do
                if clientData[c].parent == clientData[cls[i]].parent then
                    c:swap(cls[i])
                end
            end
        else
            for _, rc in pairs(cls) do
                if clientData[c].parent == clientData[rc].parent then
                    c:swap(rc)
                end
            end
        end
    end
end

function utils.tiledClientSectionFocusByIdx (idx, screen)
    local screen = screen or mouse.screen
    local cls = awful.client.tiled(screen)
    c = client.focus
    if #cls >= 2 then
        local sc = {}
        for i = 1, #cls do
            if clientData[clientData[c]].parent == clientData[clientData[cls[i]]].parent then
                table.insert(sc, cls[i])
            end
        end
        k = getIndex(sc, c) + idx
        k = k % #sc
        client.focus = sc[k]
    end
end

function utils.tiledClientSubSectionFocusByIdx (idx, screen)
    local screen = screen or mouse.screen
    local cls = awful.client.tiled(screen)
    c = client.focus
    if #cls >= 2 then
        local sc = {}
        for i = 1, #cls do
            if clientData[clientData[c]] == clientData[clientData[cls[i]]] then
                table.insert(sc, cls[i])
            end
        end
        k = getIndex(sc, c) + idx
        k = k % #sc
        client.focus = sc[k]
    end
end

function utils.tiledClientFocusByidx (idx)
    awful.client.focus.byidx(idx)
    while awful.client.floating.get(client.focus) do
       awful.client.focus.byidx(idx)
    end
end

function utils.cycleClockwise (screen)
    screen = screen or awful.client.focus.screen
    if awful.client.floating.get(client.focus) then
        naughty.notify({text="You can't cycle a floating window!"})
	return 0
    end
    utils.tiledClientCycle(true, screen)
    utils.tiledClientFocusByidx(-1)
    client.focus:raise()
end

function utils.cycleCounterClockwise (screen)
    screen = screen or awful.client.focus.screen
    if awful.client.floating.get(client.focus) then
        naughty.notify({text="You can't cycle a floating window!"})
	return 0
    end
    utils.tiledClientCycle(false, screen)
    utils.tiledClientFocusByidx(1)
    client.focus:raise()
end

function utils.sectionCycleClockwise (screen)
    screen = screen or awful.client.focus.screen
    if awful.client.floating.get(client.focus) then
        naughty.notify({text="You can't cycle a floating window!"})
    end
    utils.tiledClientSectionCycle(true, screen)
    utils.tiledClientSectionFocusByIdx(-1)
    client.focus:raise()
end

function utils.subSectionCycleClockwise (screen)
    screen = screen or awful.client.focus.screen
    if awful.client.floating.get(client.focus) then
        naughty.notify({text="You can't cycle a floating window!"})
    end
    utils.tiledClientSubSectionCycle(true, screen)
    utils.tiledClientSubSectionFocusByIdx(-1)
    client.focus:raise()
end

function utils.sectionCycleCounterClockwise (screen)
    screen = screen or awful.client.focus.screen
    if awful.client.floating.get(client.focus) then
        naughty.notify({text="You can't cycle a floating window!"})
    end
    utils.tiledClientSectionCycle(false, screen)
    utils.tiledClientSectionFocusByIdx(1)
    client.focus:raise()
end

function utils.subSectionCycleCounterClockwise (screen)
    screen = screen or awful.client.focus.screen
    if awful.client.floating.get(client.focus) then
        naughty.notify({text="You can't cycle a floating window!"})
    end
    utils.tiledClientSubSectionCycle(false, screen)
    utils.tiledClientSubSectionFocusByIdx(1)
    client.focus:raise()
end

function utils.nextTagGrp ()
    for t = 1, #tags[mouse.screen][tags[mouse.screen].grp] do
        awful.tag.setproperty(tags[mouse.screen][tags[mouse.screen].grp][t], "hide", true)
    end
    tags[mouse.screen].grp = tags[mouse.screen].grp + 1
    if tags[mouse.screen].grp > 3 then tags[mouse.screen].grp = 1 end
    for t = 1, #tags[mouse.screen][tags[mouse.screen].grp] do
        awful.tag.setproperty(tags[mouse.screen][tags[mouse.screen].grp][t], "hide", false)
    end
end

function utils.prevTagGrp ()
    for t = 1, #tags[mouse.screen][tags[mouse.screen].grp] do
        awful.tag.setproperty(tags[mouse.screen][tags[mouse.screen].grp][t], "hide", true)
    end
    tags[mouse.screen].grp = tags[mouse.screen].grp - 1
    if tags[mouse.screen].grp < 1 then tags[mouse.screen].grp = 3 end
    for t = 1, #tags[mouse.screen][tags[mouse.screen].grp] do
        awful.tag.setproperty(tags[mouse.screen][tags[mouse.screen].grp][t], "hide", false)
    end
end


function utils.keyspawn (cmd)
    return function () awful.util.spawn_with_shell(cmd) end
end

function utils.subList (list, first, last)
    local new = {}
    for i = first, last do
        table.insert(new, list[i])
    end
    return new
end

function utils.tprint (tbl, indent)
    if not indent then indent = 0 end
    if #tbl == 0 and indent == 0 then print(tostring(tbl)) end
    for k, v in pairs(tbl) do
        formatting = string.rep(" ", indent) .. tostring(k) .. ": "
        if type(v) == "table" then
            print(formatting .. tostring(v))
            if k == "parent" then return end
            if v == tbl then print(formatting .. " LOOP!!!") return end
            utils.tprint(v, indent+1)
        elseif type(v) == 'boolean' then
            print(formatting .. tostring(v))	
        else
            print(formatting .. tostring(v) .. " - " .. tostring(pcall(function () return v.class end)))
        end
    end
end


function utils.tableEqual (a, b)
    if #a ~= #b then return false end
    local flag = false
    for i = 1, #a do
        for j = 1, #b do
            if a[i] == b[j] then
                flag = true
            end
        end
        if flag then
            flag = false
        else
            return false
        end
    end
    return true
end

function utils.fillRed (drawable, r, g ,b)
    local r = r or 1
    local g = g or 0
    local b = b or 0
    local surf = surface(drawable.surface)
    cr = cairo.Context(surf)
    cr:save()
    cr:set_source_rgb(r, g, b)
    cr:paint()
    cr:restore()
    drawable:refresh()
end

function utils.key (mods, key, press, release)
    local nKey = awful.key(mods, key, press, release)
    if key:sub(1,1) == "#" then key = tostring(tonumber(key:sub(2))-9) end
    local nnKey = {mods, key, press, latches.continue}
--    print("Adding " .. tostring(nnKey) .. "  " .. nnKey[2])
--    pcall(function () utils.tprint(nnKey) end)
--    print("To globals")
--    table.insert(globalBinds, {nnkey})
--    pcall(function () utils.tprint(globalBinds) end)
    latches.addGlobalLatch(nnKey)
    return nKey
end

-- Compatibility: Lua-5.1
function utils.strSplit(str, pat)
   local t = {}  -- NOTE: use {n = 0} in Lua-5.0
   local fpat = "(.-)" .. pat
   local last_end = 1
   local s, e, cap = str:find(fpat, 1)
   while s do
      if s ~= 1 or cap ~= "" then
	 table.insert(t,cap)
      end
      last_end = e+1
      s, e, cap = str:find(fpat, last_end)
   end
   if last_end <= #str then
      cap = str:sub(last_end)
      table.insert(t, cap)
   end
   return t
end

function utils.printLatch (name)
    utils.tprint(latches.latches[name])
end

function utils.removeByValue (tbl, value)
    print("    " .. tostring(tbl))
    utils.tprint(tbl, 4)
    for i, item in ipairs(tbl) do
        if item==value then
            table.remove(tbl, i)
            break
        end
    end
end

function utils.clientSendKey (c, key)
  io.popen("xdotool key --window " .. tostring(c.window) .. " " .. key)
end

function utils.summonAll(from, to)
  local newclients = from:clients()
  local screen = awful.tag.getscreen(to)
  for i, client in ipairs(newclients) do
    client.screen = screen
    client:tags({ to })
  end
end

function utils.updateTransparency (c)
  if not c then
    for s=1,screen.count() do
      for i,client in ipairs(awful.client.visible(1)) do
        utils.updateTransparency(client)
      end
    end
    return nil
  end
  if capi.keygrabber.isrunning() then
    c.opacity = 0.5
    return nil
  end
  if c == client.focus then
    c.opacity = 0.95
  elseif c.sticky then
    c.opacity = 0.95
  elseif c.fullscreen then
    c.opacity = 0.95
  else
    c.opacity = 0.7
  end
end
function utils.updateDPMS ()
  if fullscreen_count > 0 then
    awful.util.spawn_with_shell("xset s off -dpms")
  else
    awful.util.spawn_with_shell("xset s on +dpms")
  end
end
return utils
