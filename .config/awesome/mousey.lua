local beautiful = require("beautiful")
local cairo = require("lgi").cairo
local color = require("gears.color")
local debug = require("gears.debug")
local object = require("gears.object")
local sort = require("gears.sort")
local surface = require("gears.surface")
local wibox = require("wibox")
local capi = {keygrabber=keygrabber}
-- Mouse keys

local current = {}
local coords = {}
local step = {}
local wiboxes = {}
local draging = false
local dragkey = nil
local oldCoords = {}



local function draw () 
    wiboxes.Top:geometry({
        x=coords.x-2,
        y=(coords.y-math.floor(step.y/2))-2,
        height=5,
        width=5})
    wiboxes.Bottom:geometry({
        x=coords.x-2,
        y=(coords.y+math.floor(step.y/2))-2,
        height=5,
        width=5})
    wiboxes.Left:geometry({
        x=(coords.x-math.floor(step.x/2))-2,
        y=coords.y-2,
        height=5,
        width=5})
    wiboxes.Right:geometry({
        x=(coords.x+math.floor(step.x/2))-2,
        y=coords.y-2,
        height=5,
        width=5})
    wiboxes.TopEdge:geometry({
        x=(coords.x-step.x)-2,
        y=(coords.y-step.y)-2,
        height=5,
        width=step.x*2})
    wiboxes.BottomEdge:geometry({
        x=(coords.x-step.x)-2,
        y=(coords.y+step.y)-2,
        height=5,
        width=step.x*2})
    wiboxes.LeftEdge:geometry({
        x=(coords.x-step.x)-2,
        y=(coords.y-step.y)-2,
        height=step.y*2,
        width=5})
    wiboxes.RightEdge:geometry({
        x=(coords.x+step.x)-2,
        y=(coords.y-step.y)-2,
        height=step.y*2,
        width=5})
end

local function init (c, dragging)
    print("Initializing the sub-system...")
    scr = mouse.screen
    if c then
        print "Got a Client!"
        g = c:geometry()
        current = {startx=g.x, starty=g.y, x=g.width, y=g.height}
    else
        current = {startx=0, starty=0, x=1920, y=1080}
    end
    step = {x = math.floor(current.x/2), y = math.floor(current.y/2)}
    coords = {x = math.floor(current.x/2 + current.startx), y = math.floor(current.y/2 + current.starty)}
    -- wibox stuffs
    guides = {"Top", "Bottom", "Left", "Right", "TopEdge", "BottomEdge", "LeftEdge", "RightEdge"}
    if wiboxes.Top == nil then
       print "Geting Here..."
        for i, guide in ipairs(guides) do
            wiboxes[guide] = wibox({type="notification", bg="#ff0000"})
            wiboxes[guide].screen=scr
            wiboxes[guide].ontop=true
            wiboxes[guide].visible=true
            wiboxes[guide].opacity=1
        end
    end
    draw()
    -- end wibox stuffs
    if dragging ~= true then 
        mouse.coords(coords, true)
        print("Should have moved the mouse...")
    end
end

local function check_coords ()
    print("Checking Coords: ")
    print("X: ")
    print(coords.x)
    print(mouse.coords().x)
    print("Y: ")
    print(coords.y)
    print(mouse.coords().y)
    if not (mouse.coords().x == coords.x and mouse.coords().y == coords.y) then
        init()
    end
end

local function guideMove (dir, mul)
    print("Moving")
    mul = mul or 1
    if dir == "Up" then
        coords = {x = coords.x, y = (coords.y - math.floor(step.y*mul))}
    elseif dir == "Up-Left" then
        coords = {x=(coords.x - math.floor(step.x*mul)), y = (coords.y - math.floor(step.y*mul))}
    elseif dir == "Up-Right" then
        coords = {x=(coords.x + math.floor(step.x*mul)), y = (coords.y - math.floor(step.y*mul))}
    elseif dir == "Down" then
        coords = {x=coords.x, y=(coords.y + math.floor(step.y*mul))}
    elseif dir == "Down-Left" then
        coords = {x=(coords.x - math.floor(step.x*mul)), y=(coords.y + math.floor(step.y*mul))}
    elseif dir == "Down-Right" then
        coords = {x=(coords.x + math.floor(step.x*mul)), y=(coords.y + math.floor(step.y*mul))}
    elseif dir == "Left" then
        coords = {x=(coords.x - math.floor(step.x*mul)), y=coords.y}
    elseif dir == "Right" then
        coords = {x=(coords.x + math.floor(step.x*mul)), y=coords.y}
    end
    draw()
end

local function realMove (dir, mul)
    check_coords()
    guideMove(dir, mul)
    mouse.coords(coords)
end


local move = realMove

local function cut (dir)
    check_coords()
    if dir == "Up" or dir == "Down" then
        step = {x=math.floor(step.x), y = math.floor(step.y/2)}
    elseif dir == "Left" or dir == "Right" then
        step = {x=math.floor(step.x/2), y = math.floor(step.y)}
    else
        step = {x=math.floor(step.x/2), y = math.floor(step.y/2)}
    end
    move(dir)
end

local function unicut (dir)
    step = {x=math.floor(step.x/2), y = math.floor(step.y/2)}
    move(dir)
end

local function inc ()
    step = {x=step.x*2, y=step.y*2}
    draw()
end

local function dec ()
    step = {x=math.floor(step.x/2), y = math.floor(step.y/2)}
    draw()
end


-- Draging

local function drag (key)
    key = key or "1"
    print "Dragging"
    naughty.notify({text="dragging"})
    if draging == false then
        draging = true
        dragkey = key
        old_coords = mouse.coords()
    else
        naughty.notify({text="From (" .. old_coords.x .. ", " .. old_coords.y ..") to (" .. coords.x .. ", " .. coords.y .. ")"})
        draging = false
        mouse.coords(old_coords)
        awful.util.spawn_with_shell("xdotool mousedown " .. key)
        os.execute("sleep .01")
        mouse.coords(coords)
        awful.util.spawn_with_shell("xdotool mouseup " .. dragkey)
        dragkey = nil
    end
end

-- end Draging

local function click (key)
    if draging and dragkey==key then
        drag(key)
    else
        awful.util.spawn_with_shell("xdotool click " .. key)
    end
end

init()

return {move=move, init=init, cut=cut, inc=inc, dec=dec, unicut=unicut, drag=drag, click=click}
