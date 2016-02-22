require("data")
local latches = require("latches")
local tag = awful.tag
local layout = {}


utils.tprint(clientData)
utils.tprint(clientData.workarea)

local function clientNum (tab, c)
--    naughty.notify({title="Summing", text=tab, timeout=0})
    local c = c or 0
    if #tab == 0 then
--        naughty.notify({text="Empty", timeout=0})
        c = c + (tab.numCli or 1)
    else
--        utils.tprint(tab)
        for k, v in pairs(tab) do
--            naughty.notify({title=k, text=v, timeout=0})
        end
        for i = 1, tab[2] do
            c = clientNum(tab[4][i], c)
        end
    end
--    naughty.notify({text=c, timeout=0})
    return c
end
local function set (p, section)
    print("Arranging:")
    utils.tprint(section)
--    utils.tprint(p)
    local t = tag.selected(p.screen)
    local area = p.workarea
    section.area = area
    print("Section Len: " .. #section)
    if #section == 0 then
        print("No Subs, arranging clients")
        for k, c in pairs(p.clients) do
            print(" " .. tostring(c))
            local g = {
              x = math.floor(area.x),
              y = math.floor(area.y),
              width = math.floor(area.width - c.border_width * 2),
              height = math.floor(area.height - c.border_width * 2)
            }
--            print(g.x)
--            print(g.y)
--            print(g.width)
--            print(g.height)
            c:geometry(g)
--            print("  Set Geometry")
--            print("  Setting client data")
            if not clientData[section] then clientData[section] = {} end
            if clientData[c]~=nil and clientData[c] ~= section then
--                print("   Old client")
                utils.removeByValue(clientData[clientData[c]], c)
--                print("   Removed old data")
            end
            clientData[c] = section
            if clientData[section] then
                if utils.getIndex(clientData[section], c)==0 then
                    table.insert(clientData[section], c)
                end
            else
                clientData[section] = {c}
            end
--            print("  Set client data")
        end
    else
--        naughty.notify({text=clientsNum, replaces_id=naughtyIDs.clientsNum})
        local nP = {}
        nP.clients = {}
        nP.workarea = {}
        nP.workarea.width = area.width
        nP.workarea.height = area.height
        nP.workarea.x = area.x
        nP.workarea.y = area.y
        for i = ((section.skip or 0)+1), section[2] do
            local wClientsNum = clientNum(section[4][i])
            if section[4][i].parent == nil then section[4][i].parent = section end
--            print(wClientsNum .. " " .. #p.clients)
            nP.clients = {}
            if wClientsNum <= #p.clients then
--                print("TMC " .. wClientsNum .. " " .. #p.clients)
                for j = 1, wClientsNum do
                    table.insert(nP.clients, p.clients[1])
                    table.remove(p.clients, 1)
                end
                if section[1] == "h" then
--                    print("h area")
                    nP.workarea.x = area.x + area.width * (section[3][i-1] or 0)
--                    print("new x: " .. nP.workarea.x)
                    nP.workarea.width = (area.width * (section[3][i] or 1)) - area.width * (section[3][i-1] or 0)
--                    print("new width: " .. nP.workarea.width)
                elseif section[1] == "v" then
--                    print("v area")
                    nP.workarea.y = area.y + area.height * (section[3][i-1] or 0)
--                    print("new y: " .. nP.workarea.y)
                    nP.workarea.height = (area.height * (section[3][i] or 1)) - area.height * (section[3][i-1] or 0)
--                    print("sub-height: " .. (section[3][i] or 1))
--                    print("new height: " .. nP.workarea.height)
                end
--                print("Passing: ")
--                utils.tprint(nP.clients)
--                print("To: ")
--                utils.tprint(section[4][i])
                set(nP, section[4][i])
            elseif wClientsNum > #p.clients then
--                print("NEC " .. wClientsNum .. " " .. #p.clients)
                while #p.clients > 0 do
                    table.insert(nP.clients, p.clients[1])
                    table.remove(p.clients, 1)
                end
                if section[1] == "h" then
--                    print("h area")
                    nP.workarea.x = area.x + area.width * (section[3][i-1] or 0)
--                    print("new x: " .. nP.workarea.x)
                    nP.workarea.width = (area.width * (section[3][i] or 1)) - nP.workarea.x
--                    print("new width: " .. nP.workarea.width)
                elseif section[1] == "v" then
                    nP.workarea.y = area.y + area.height * (section[3][i-1] or 0)
--                    print("new y: " .. nP.workarea.y)
                    nP.workarea.height = (area.height * (section[3][i] or 1)) - nP.workarea.y
--                    print("new width: " .. nP.workarea.width)
                end
                return set(nP, section[4][i])
            end
        end
        set(p, {parent=section})
    end
end

function layout.arrange (p)
    local nP = {}
    nP.clients = {}
    local stickies = {}
    for k, c in pairs(p.clients) do
        if c.sticky and c.class ~= "Conky" then
            table.insert(stickies, c)
        else
            table.insert(nP.clients, c)
        end
    end
    if #stickies > 0 then
        local divide = stickyStuff[1][3][1]
        print("Not Stickies")
        nP.workarea = {}
        nP.workarea.height = p.workarea.height
        nP.workarea.y = p.workarea.y
        nP.workarea.x = p.workarea.x
        nP.workarea.width = p.workarea.width * divide
        section = utils.shallowcopy(tagData[tag.selected(p.screen)])
        section.parent = stickyStuff[1]
        stickyStuff[1][4][1] = section
        set(nP, section)
        print("Stickies")
        utils.tprint(clientData.stickies)
        nP.clients = stickies
        nP.workarea = {}
        nP.workarea.height = p.workarea.height
        nP.workarea.y = p.workarea.y
        nP.workarea.x = p.workarea.x + p.workarea.width * divide
        nP.workarea.width = p.workarea.width - p.workarea.width * divide
        set(nP, stickyStuff[1][4][2])
    else
        set(p, tagData[tag.selected(p.screen)])
    end
end

local function divideV ()
    local section = clientData[client.focus]
    section[1] = "v"
    section[2] = 2
    section[3] = {0.5}
    section[4] = {{numCli=1}, {numCli=1}}
    utils.tprint(tagData[tag.selected(mouse.screen)])
    awful.layout.arrange(client.focus.screen)
end

local function divideH ()
    local section = clientData[client.focus]
    section[1] = "h"
    section[2] = 2
    section[3] = {0.5}
    section[4] = {{numCli=1}, {numCli=1}}
    awful.layout.arrange(client.focus.screen)
end

local function join ()
    local section = clientData[client.focus]
    if section.parent == stickyStuff[1] then return 0 end -- You can't "Join" the stickies with the not stickies this way
    section.parent[1] = nil
    section.parent[2] = nil
    section.parent[3] = nil
    section.parent[4] = nil
    awful.layout.arrange(client.focus.screen)
end


local function divideRecurse (s, section)
    local parent = section.parent
    if parent == nil then
        x =  {Top="y", Bottom='height', Left='x', Right='width'}
        return {clientData.workarea, x[s]}
    end
    if s == "Top" then
        if parent[1] == "v" then
            idx = utils.getIndex(parent[4], section)
            if idx ~= 1 then
                return {parent[3], idx-1}
            else
                return divideRecurse(s, parent)
            end
        else
            return divideRecurse(s, parent)
        end
    elseif s == "Bottom" then
        if parent[1] == "v" then
            idx = utils.getIndex(parent[4], section)
            if idx ~= parent[2] then
                return {parent[3], idx}
            else
                return divideRecurse(s, parent)
            end
        else
            return divideRecurse(s, parent)
        end
    elseif s == "Left" then
        if parent[1] == "h" then
            idx = utils.getIndex(parent[4], section)
            if idx ~= 1 then
                return {parent[3], idx-1}
            else
                return divideRecurse(s, parent)
            end
        else
            return divideRecurse(s, parent)
        end
    elseif s == "Right" then
        if parent[1] == "h" then
            idx = utils.getIndex(parent[4], section)
            if idx ~= parent[2] then
                return {parent[3], idx}
            else
                return divideRecurse(s, parent)
            end
        else
            return divideRecurse(s, parent)
        end
    end
end

local function getDivide (c, s)
    local section = clientData[c]
    local parent = section.parent
    if parent == nil then return divideRecurse(s, section) end
    if s == "Top" then
        if parent[1] == "v" then
            idx = utils.getIndex(parent[4], section)
            if idx ~= 1 then
                return {parent[3], idx-1}
            else
                return divideRecurse(s, section)
            end
        else
            return divideRecurse(s, section)
        end
    elseif s == "Bottom" then
        if parent[1] == "v" then
            idx = utils.getIndex(parent[4], section)
            if idx ~= parent[2] then
                return {parent[3], idx}
            else
                return divideRecurse(s, section)
            end
        else
            return divideRecurse(s, section)
        end
    elseif s == "Left" then
        if parent[1] == "h" then
            idx = utils.getIndex(parent[4], section)
            if idx ~= 1 then
                return {parent[3], idx-1}
            else
                return divideRecurse(s, section)
            end
        else
            return divideRecurse(s, section)
        end
    elseif s == "Right" then
        if parent[1] == "h" then
            idx = utils.getIndex(parent[4], section)
            if idx ~= parent[2] then
                return {parent[3], idx}
            else
                return divideRecurse(s, section)
            end
        else
            return divideRecurse(s, section)
        end
    end
end


local function getTopDivide ()
    clientData.divide = getDivide(client.focus, "Top")
    naughty.notify({text=clientData.divide[1]})
    naughty.notify({text=clientData.divide[1][clientData.divide[2]]})
end

local function getBottomDivide ()
    clientData.divide = getDivide(client.focus, "Bottom")
    naughty.notify({text=clientData.divide[1]})
    naughty.notify({text=clientData.divide[1][clientData.divide[2]]})
end

local function getLeftDivide ()
    clientData.divide = getDivide(client.focus, "Left")
    naughty.notify({text=clientData.divide[1]})
    naughty.notify({text=clientData.divide[1][clientData.divide[2]]})
end

local function getRightDivide ()
    clientData.divide = getDivide(client.focus, "Right")
    naughty.notify({text=clientData.divide[1]})
    naughty.notify({text=clientData.divide[1][clientData.divide[2]]})
end



local function incDivide ()
    if clientData.divide == -1 then return end
    div = clientData.divide[2]
    if div == "x" then 
        x = clientData.divide[1][div]+10
        if x > clientData.divide[1].width+clientData.divide[1].x then
            x = clientData.divide[1].width+clientData.divide[1].x
        else
            clientData.divide[1].width = clientData.divide[1].width - 10
        end
    elseif div == "y" then
        x = clientData.divide[1][div]+10
        if x > clientData.divide[1].height+clientData.divide[1].y then
            x = clientData.divide[1].height+clientData.divide[1].y
        else
            clientData.divide[1].height = clientData.divide[1].height - 10
        end
    elseif div == "width" then
        x = clientData.divide[1][div]+10
        if x+clientData.divide[1].x > mainScreen.workarea.width + mainScreen.workarea.x then
            x = (mainScreen.workarea.width + mainScreen.workarea.x) - clientData.workarea.x
        end
    elseif div == "height" then
        x = clientData.divide[1][div]+10
        if x+clientData.divide[1].y > mainScreen.workarea.height + mainScreen.workarea.y then
            x = (mainScreen.workarea.height + mainScreen.workarea.y) - clientData.workarea.y
        end
    else
        x = clientData.divide[1][div]+.01
        if x < (clientData.divide[1][div+1] or 1) then
            clientData.divide[1][div] = x
        end
    end
    clientData.divide[1][div] = x
    awful.layout.arrange(client.focus.screen)
end


local function decDivide ()
--    naughty.notify {text="Decreasing"}
    if clientData.divide == -1 then return end
    div = clientData.divide[2]
    x = 0
    if div == "x" then
        x = clientData.divide[1][div]-10
        if x < 0  then
            x = 0
        else
            clientData.divide[1].width = clientData.divide[1].width + 10
        end
    elseif div == "y" then
        x = clientData.divide[1][div]-10
        if x < 0 then
            x = 0
        else
            clientData.divide[1].height = clientData.divide[1].height + 10
        end
    elseif div == "width" then
--        naughty.notify {text="Width"}
        x = clientData.divide[1][div]-10
        if x < clientData.workarea.x then
            x = clientData.workarea.x
        end
--        naughty.notify {title="To: ", text=x}
    elseif div == "height" then
        x = clientData.divide[1][div]-10
        if x < clientData.workarea.y then
            x = clientData.workarea.y
        end
    else
        x = clientData.divide[1][div]-.01
        if x < (clientData.divide[1][div-1] or 1) then
            clientData.divide[1][div] = x
        end
    end
--    naughty.notify {text="Setting"}
    clientData.divide[1][div] = x
    awful.layout.arrange(client.focus.screen)
end

local function resetDivide ()
    clientData.divide = -1
end

local function incDivides ()
    local section = clientData[client.focus]
    local parent = section.parent
    parent[2] = parent[2] + 1
    fraction = 1/parent[2]
    parent[4] = {}
    for i = 1, parent[2] do
        parent[4][i] = {}
    end
    for i = 1, parent[2]-1 do
        parent[3][i] = fraction + (parent[3][i-1] or 0)
    end
    awful.layout.arrange(client.focus.screen)
end

local function decDivides ()
    local section = clientData[client.focus]
    local parent = section.parent
    parent[2] = parent[2] - 1
    if parent[2] == 0 then join() end
    fraction = 1/parent[2]
    parent[3] = {}
    parent[4] = {}
    for i = 1, parent[2] do
        parent[4][i] = {}
    end
    for i = 1, parent[2]-1 do
        parent[3][i] = fraction + (parent[3][i-1] or 0)
    end
    awful.layout.arrange(client.focus.screen)
end
layout.name = "myLayout"

local function incClientsInSection ()
    local section = clientData[client.focus]
    section.numCli = (section.numCli or 0) + 1
    awful.layout.arrange(client.focus.screen)
end

local function decClientsInSection ()
    local section = clientData[client.focus]
    section.numCli = section.numCli - 1
    if section.numCli == 0 then
        section.numCli = 1
        decDivides()
    end
    awful.layout.arrange(client.focus.screen)
end

local function incSkip ()
    local section = clientData[client.focus]
    local parent = section.parent
    parent.skip = (parent.skip or 0) +1
    awful.layout.arrange(client.focus.screen)
end

local function decSkip ()
    local section = clientData[client.focus]
    local parent = section.parent
    parent.skip = (parent.skip or 0) -1
    if parent.skip < 0 then
        parent.skip = 0
    end
    awful.layout.arrange(client.focus.screen)
end


layout.latch = latches.latch("layout controls", {
    {n="Split", {}, "s", latches.latch("Split", {
          {n="Vertical", {}, "v", divideV, latches.exit},
          {n="Horizontal", {}, "h", divideH, latches.exit}})},
    {n="Join", {}, "j", join, latches.exit},
    {n="Top Divide", {}, "Up", getTopDivide, latches.continue, esc=resetDivide},
    {n="Bottom Divide", {}, "Down", getBottomDivide, latches.continue, esc=resetDivide},
    {n="Left Divide", {}, "Left", getLeftDivide, latches.continue, esc=resetDivide},
    {n="Rught Divide", {}, "Right", getRightDivide, latches.continue, esc=resetDivide},
    {n="Inc Divide", {}, "=", incDivide, latches.continue},
    {n="Dec Divide", {}, "-", decDivide, latches.continue},
    {n="Inc Divides", {"Control"}, "=", incDivides, latches.continue},
    {n="Inc Divides", {"Control"}, "-", decDivides, latches.continue},
    {n="Inc Space", {"Mod1"}, "=", incClientsInSection, latches.continue},
    {n="Dec Space", {"Mod1"}, "-", decClientsInSection, latches.continue},
    {n="Inc Skip", {modkey}, "=", incSkip, latches.continue},
    {n="Dec Skip", {modkey}, "-", decSkip, latches.continue}})
return layout
