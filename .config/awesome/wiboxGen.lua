-- {{{ Upper Wibox
-- Create a textclock widget
mytextclock = awful.widget.textclock()
local textbox = require("wibox.widget.textbox")
local imagebox = require("wibox.widget.imagebox")

local function mkarr (arr)
    local box = imagebox()
    box:set_image(beautiful[arr])
    return box
end

-- Create a wibox for each screen and add it
myUpperWibox = {}
mypromptbox = {}
mylayoutbox = {}
mytaglist = {}
mytaglist.buttons = awful.util.table.join(
                    awful.button({ }, 1, awful.tag.viewonly),
                    awful.button({ modkey }, 1, awful.client.movetotag),
                    awful.button({ }, 3, awful.tag.viewtoggle),
                    awful.button({ modkey }, 3, awful.client.toggletag),
                    awful.button({ }, 4, function(t) awful.tag.viewnext(awful.tag.getscreen(t)) end),
                    awful.button({ }, 5, function(t) awful.tag.viewprev(awful.tag.getscreen(t)) end)
                    )
mytasklist = {}
mytasklist.buttons = awful.util.table.join(
                     awful.button({ }, 1, function (c)
                                              if c == client.focus then
                                                  c.minimized = true
                                              else
                                                  -- Without this, the following
                                                  -- :isvisible() makes no sense
                                                  c.minimized = false
                                                  if not c:isvisible() then
                                                      awful.tag.viewonly(c:tags()[1])
                                                  end
                                                  -- This will also un-minimize
                                                  -- the client, if needed
                                                  client.focus = c
                                                  c:raise()
                                              end
                                          end),
                     awful.button({ }, 3, function ()
                                              if instance then
                                                  instance:hide()
                                                  instance = nil
                                              else
                                                  instance = awful.menu.clients({ width=250 })
                                              end
                                          end),
                     awful.button({ }, 4, function ()
                                     
         awful.client.focus.byidx(1)
                                              if client.focus then client.focus:raise() end
                                          end),
                     awful.button({ }, 5, function ()
                                              awful.client.focus.byidx(-1)
                                              if client.focus then client.focus:raise() end
                                          end))

for s = 1, screen.count() do
    -- Create a promptbox for each screen
    mypromptbox[s] = awful.widget.prompt()
    -- Create an imagebox widget which will contains an icon indicating which layout we're using.
    -- We need one layoutbox per screen.
--  mylayoutbox[s] = awful.widget.layoutbox(s)
--  mylayoutbox[s]:buttons(awful.util.table.join(
--                         awful.button({ }, 1, function () awful.layout.inc(layouts, 1) end),
--                         awful.button({ }, 3, function () awful.layout.inc(layouts, -1) end),
--                         awful.button({ }, 4, function () awful.layout.inc(layouts, 1) end),
--                         awful.button({ }, 5, function () awful.layout.inc(layouts, -1) end)))
    -- Create a taglist widget
    mytaglist[s] = awful.widget.taglist(s, awful.widget.taglist.filter.all, mytaglist.buttons)

    -- Create a tasklist widget
    mytasklist[s] = awful.widget.tasklist(s, awful.widget.tasklist.filter.currenttags, mytasklist.buttons)

    -- Create the wibox
    myUpperWibox[s] = awful.wibox({ position = "top", screen = s})
    myUpperWibox[s].height = 13

    -- Widgets that are aligned to the left
    local left_layout = wibox.layout.fixed.horizontal()
    left_layout:add(mkarr("arrl1"))
    left_layout:add(mytaglist[s])
    left_layout:add(mkarr("arrr1"))
    left_layout:add(mkarr("arrl4"))
    left_layout:add(mypromptbox[s])
    left_layout:add(mkarr("arrr4"))
    left_layout:add(mkarr("arrl"))

    -- Widgets that are aligned to the right
    local right_layout = wibox.layout.fixed.horizontal()
    right_layout:add(mkarr("arrr"))
    right_layout:add(mkarr("arrl4"))
    right_layout:add(currentLatch)
    right_layout:add(mkarr("arrr4"))
    if s == 1 then right_layout:add(mkarr("arrl1")) right_layout:add(wibox.widget.systray()) right_layout:add(mkarr("arrr1")) end
    right_layout:add(mkarr("arrl4"))
    right_layout:add(mytextclock)
    right_layout:add(mkarr("arrr4"))
--  right_layout:add(mylayoutbox[s])

    -- Now bring it all together (with the tasklist in the middle)
    local layout = wibox.layout.align.horizontal()
    layout:set_left(left_layout)
    layout:set_middle(mytasklist[s])
    layout:set_right(right_layout)
    local otherlayout = wibox.layout.fixed.horizontal

    myUpperWibox[s]:set_widget(layout)
end
-- }}}

-- {{{ Lower Wibox
--myLowerWibox = {}
--for s=1, screen.count() do
    --myLowerWibox[s] = awful.wibox({ position="bottom", screen = s})    
--end
-- }}}
