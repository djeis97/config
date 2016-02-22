local conky = require("conky")
local latches = require("latches")
local modality = require("modality")
local audio = require("audio")
local mousey = require("mousey")
local tag = require("awful.tag")
--local myLayout = require("myLayout")
local keygrabber = require("awful.keygrabber")

buttons = awful.util.table.join(
    awful.button({ }, 3, function () mymainmenu:toggle() end),
    awful.button({ }, 4, awful.tag.viewnext),
    awful.button({ }, 5, awful.tag.viewprev)
)



globalkeys = awful.util.table.join(
    utils.key({ modkey,           }, "Left",   awful.tag.viewprev       ),
    utils.key({ modkey,           }, "Right",  awful.tag.viewnext       ),
    utils.key({ modkey, "Control" }, "Up", function () awful.client.focus.bydirection("up") end),
    utils.key({ modkey, "Control" }, "Down", function () awful.client.focus.bydirection("down") end),
    utils.key({ modkey, "Control" }, "Left", function () awful.client.focus.bydirection("left") end),
    utils.key({ modkey, "Control" }, "Right", function () awful.client.focus.bydirection("right") end),
    utils.key({ modkey,           }, "Escape", awful.tag.history.restore),
    utils.key({ modkey,           }, "j", utils.cycleClockwise),
    utils.key({ modkey,           }, "k", utils.cycleCounterClockwise),
    utils.key({ modkey, "Control" }, "j", utils.sectionCycleClockwise),
    utils.key({ modkey, "Control" }, "k", utils.sectionCycleCounterClockwise),
    utils.key({ modkey, "Control", "Shift" }, "j", utils.subSectionCycleClockwise),
    utils.key({ modkey, "Control", "Shift" }, "k", utils.subSectionCycleCounterClockwise),
    utils.key({ modkey,           }, "w", function () mymainmenu:show() end),

    -- Layout manipulation
    utils.key({ modkey, "Shift"   }, "j", function () awful.client.swap.byidx(  1)    end),
    utils.key({ modkey, "Shift"   }, "k", function () awful.client.swap.byidx( -1)    end),
    utils.key({ modkey,           }, "u", awful.client.urgent.jumpto),
    utils.key({ modkey,           }, "Tab",
        function ()
            utils.grab_focus(1)
        end),
    utils.key({ modkey, "Shift"   }, "Tab",
        function ()
            utils.grab_focus(-1)
        end),

    -- Standard program
    utils.key({ modkey,           }, "Return", utils.keyspawn(terminal)),
    utils.key({ modkey, "Shift"   }, "q", awesome.quit),

    utils.key({ modkey,           }, "l",     function () awful.tag.incmwfact( 0.05)    end),
    utils.key({ modkey,           }, "h",     function () awful.tag.incmwfact(-0.05)    end),
    utils.key({ modkey, "Shift"   }, "h",     function () awful.tag.incnmaster( 1)      end),
    utils.key({ modkey, "Shift"   }, "l",     function () awful.tag.incnmaster(-1)      end),
    utils.key({ modkey, "Control" }, "h",     function () awful.tag.incncol( 1)         end),
    utils.key({ modkey, "Control" }, "l",     function () awful.tag.incncol(-1)         end),
    utils.key({ modkey,           }, "space", function () awful.layout.inc(layouts,  1) end),
    utils.key({ modkey, "Shift"   }, "space", function () awful.layout.inc(layouts, -1) end),

    utils.key({ modkey, "Control" }, "n", awful.client.restore),

    -- Prompt
    utils.key({ modkey },            "r",     function () mypromptbox[mouse.screen]:run() end),

    utils.key({ modkey }, "x",
              function ()
                  awful.prompt.run({ prompt = "Run Lua code: " },
                  mypromptbox[mouse.screen].widget,
                  awful.util.eval, nil,
                  awful.util.getdir("cache") .. "/history_eval")
              end),
    -- Menubar
    utils.key({ modkey }, "p", function() menubar.show() end),

    -- Conky
    utils.key({}, "F10", conky.toggle),
    
    -- tag Groups
    utils.key({ modkey, "Shift"   }, "n", utils.nextTagGrp),
    utils.key({ modkey, "Shift"   }, "p", utils.prevTagGrp),
    -- audio
    utils.key({ "Mod3"      }, "p", latches.latch("Programs",  {
                { n="Browsers", {   }, "b", latches.latch("Programs-Browsers", {
                  { n="Firefox", {		}, "f", utils.keyspawn("firefox"), latches.exit},
                  { n="Chrome", {   }, "c", utils.keyspawn("chromium"), latches.exit}})}})),
    utils.key({ "Mod3"      }, "a", latches.latch("Administration", {
                { n="Term", {		}, "t", utils.keyspawn("terminator"), latches.exit}})),
    utils.key({ "Mod3"      }, "s", audio.latch),
    utils.key({ "Mod3"      }, "i", latches.latch("Info", {
                { n="Tag", {   }, "t", function ()
                                          print("getting here")
                                          naughty.notify({text=tag.selected(mouse.screen), timeout=0})
                                       end, latches.exit}})),
    utils.key({ modkey, "Control" }, "r", audio.MPDPrompt),
--    utils.key({ "Mod3"      }, "l", myLayout.latch),
    utils.key({ modkey, "Mod1"}, "r", function () 
        awful.prompt.run ({prompt="Super Run: "},
                           mypromptbox[mouse.screen].widget,
                           function (command) 
                             x = io.popen(command)
                             output = x:read("*a")
                             naughty.notify {text=output}
                           end)end))

commandkeys = {
  {{}, "F20", latches.exit},
  {{}, "o", function () awful.screen.focus_relative(1) end},
  {{}, "s", audio.latch},
  {{          }, "Left",   awful.tag.viewprev       ,},
  {{          }, "Right",  awful.tag.viewnext       ,},
  {{"Control" }, "Up", function () awful.client.focus.bydirection("up") end,},
  {{"Control" }, "Down", function () awful.client.focus.bydirection("down") end,},
  {{"Control" }, "Left", function () awful.client.focus.bydirection("left") end,},
  {{"Control" }, "Right", function () awful.client.focus.bydirection("right") end,},
  {{          }, "Escape", awful.tag.history.restore,},
  {{          }, "w", function () mymainmenu:show() end,},
  {{"Shift"   }, "j", function () awful.client.swap.byidx(  1)    end,},
  {{"Shift"   }, "k", function () awful.client.swap.byidx( -1)    end,},
  {{          }, "u", awful.client.urgent.jumpto,},
  {{          }, "Tab",
    function ()
      utils.grab_focus(1)
    end,},
  {{"Shift"   }, "Tab",
    function ()
      utils.grab_focus(-1)
    end,},
  {{          }, "Return", utils.keyspawn(terminal),},
  {{"Shift"   }, "q", awesome.quit,},
  {{          }, "l",     function () awful.tag.incmwfact( 0.05)    end,},
  {{          }, "h",     function () awful.tag.incmwfact(-0.05)    end,},
  {{"Shift"   }, "h",     function () awful.tag.incnmaster( 1)      end,},
  {{"Shift"   }, "l",     function () awful.tag.incnmaster(-1)      end,},
  {{"Control" }, "h",     function () awful.tag.incncol( 1)         end,},
  {{"Control" }, "l",     function () awful.tag.incncol(-1)         end,},
  {{          }, " ", function () awful.layout.inc(layouts,  1) end,},
  {{"Shift"   }, " ", function () awful.layout.inc(layouts, -1) end,},
  {{"Control" }, "n", awful.client.restore,},
  {{  },            "r",     function () mypromptbox[mouse.screen]:run() end,},
  {{  }, "x",
    function ()
      awful.prompt.run({ prompt = "Run Lua code: " },
        mypromptbox[mouse.screen].widget,
        awful.util.eval, nil,
        awful.util.getdir("cache") .. "/history_eval")
    end,},
  {{    }, "n", utils.nextTagGrp},
  {{    }, "p", utils.prevTagGrp},
  {{ "Shift"   }, "C", function ()
      client.focus:kill() end},
  {{ "Mod1"}, "r", function ()
      awful.prompt.run ({prompt="Super Run: "},
        mypromptbox[mouse.screen].widget,
        function (command)
          x = io.popen(command)
          output = x:read("*a")
          naughty.notify {text=output}
  end)end},
  {{   }, "b", latches.latch("Programs-Browsers", {
           {n="Firefox", {	 }, "f", utils.keyspawn("firefox")},
           {n="Chrome", {   }, "c", utils.keyspawn("chromium")}})},
  {{  }, "e", utils.keyspawn("emacsclient -c")},
  {{  }, "c", latches.latch("Programs-Communication", {
                              {n="Skype", {   }, "s", utils.keyspawn("skype")},
                              {n="Telegram", {   }, "t", utils.keyspawn("/home/jay/installs/Telegram/Telegram")}})},
  {{  }, "g", latches.latch("Programs-Gaming", {
                              {n="Steam", {  }, "s", utils.keyspawn("steam")},
                              {n="feedthebeast", {  }, "f", utils.keyspawn("feedthebeast")}})}
}

mousekeys = awful.util.table.join(
  utils.key({             }, "KP_Up", function () mousey.cut("Up") end ),
  utils.key({             }, "KP_Left", function () mousey.cut("Left") end ),
  utils.key({             }, "KP_Down", function () mousey.cut("Down") end ),
  utils.key({             }, "KP_Right", function () mousey.cut("Right") end ),
  utils.key({             }, "KP_Home", function () mousey.cut("Up-Left") end ),
  utils.key({             }, "KP_Prior", function () mousey.cut("Up-Right") end ),
  utils.key({             }, "KP_End", function () mousey.cut("Down-Left") end ),
  utils.key({             }, "KP_Next", function () mousey.cut("Down-Right") end ),
  utils.key({"Shift", "Mod1"}, "KP_Up", function () mousey.unicut("Up") end ),
  utils.key({"Shift", "Mod1"}, "KP_Left", function () mousey.unicut("Left") end ),
  utils.key({"Shift", "Mod1"}, "KP_Down", function () mousey.unicut("Down") end ),
  utils.key({"Shift", "Mod1"}, "KP_Right", function () mousey.unicut("Right") end ),
  utils.key({"Shift", "Mod1"}, "KP_Home", function () mousey.unicut("Up-Left") end ),
  utils.key({"Shift", "Mod1"}, "KP_Prior", function () mousey.unicut("Up-Right") end ),
  utils.key({"Shift", "Mod1"}, "KP_End", function () mousey.unicut("Down-Left") end ),
  utils.key({"Shift", "Mod1"}, "KP_Next", function () mousey.unicut("Down-Right") end ),
  utils.key({"Control"    }, "KP_Up", function () mousey.move("Up", 2) end ),
  utils.key({"Control"    }, "KP_Left", function () mousey.move("Left", 2) end ),
  utils.key({"Control"    }, "KP_Down", function () mousey.move("Down", 2) end ),
  utils.key({"Control"    }, "KP_Right", function () mousey.move("Right", 2) end ),
  utils.key({"Control"    }, "KP_Home", function () mousey.move("Up-Left", 2) end ),
  utils.key({"Control"    }, "KP_Prior", function () mousey.move("Up-Right", 2) end ),
  utils.key({"Control"    }, "KP_End", function () mousey.move("Down-Left", 2) end ),
  utils.key({"Control"    }, "KP_Next", function () mousey.move("Down-Right", 2) end ),    
  utils.key({"Control", "Mod1"}, "KP_Up", function () mousey.move("Up", .5) end ),
  utils.key({"Control", "Mod1"}, "KP_Left", function () mousey.move("Left", .5) end ),
  utils.key({"Control", "Mod1"}, "KP_Down", function () mousey.move("Down", .5) end ),
  utils.key({"Control", "Mod1"}, "KP_Right", function () mousey.move("Right", .5) end ),
  utils.key({"Control", "Mod1"}, "KP_Home", function () mousey.move("Up-Left", .5) end ),
  utils.key({"Control", "Mod1"}, "KP_Prior", function () mousey.move("Up-Right", .5) end ),
  utils.key({"Control", "Mod1"}, "KP_End", function () mousey.move("Down-Left", .5) end ),
  utils.key({"Control", "Mod1"}, "KP_Next", function () mousey.move("Down-Right", .5) end ),
  utils.key({"Shift"      }, "KP_Up", function () mousey.move("Up") end ),
  utils.key({"Shift"      }, "KP_Left", function () mousey.move("Left") end ),
  utils.key({"Shift"      }, "KP_Down", function () mousey.move("Down") end ),
  utils.key({"Shift"      }, "KP_Right", function () mousey.move("Right") end ),
  utils.key({"Shift"      }, "KP_Home", function () mousey.move("Up-Left") end ),
  utils.key({"Shift"      }, "KP_Prior", function () mousey.move("Up-Right") end ),
  utils.key({"Shift"      }, "KP_End", function () mousey.move("Down-Left") end ),
  utils.key({"Shift"      }, "KP_Next", function () mousey.move("Down-Right") end ),
  utils.key({             }, "KP_Add", mousey.inc),
  utils.key({             }, "KP_Subtract", mousey.dec)
)

clickkeys = awful.util.table.join(
  utils.key({             }, "KP_Insert", function () mousey.click("1") end),
  utils.key({             }, "KP_Delete", function () mousey.click("2") end),
  utils.key({             }, "KP_Enter", function () mousey.click("3") end),
  utils.key({             }, "KP_Begin", function () mousey.click("1") end),
  utils.key({"Shift"      }, "KP_Begin", function () mousey.click("3") end),
  utils.key({"Mod1", "Control"}, "KP_Insert", function () mousey.drag("1") end),
  utils.key({"Mod1", "Control"}, "KP_Delete", function () mousey.drag("2") end),
  utils.key({"Mod1", "Control"}, "KP_Enter", function () mousey.drag("3") end),
  utils.key({"Mod1", "Control"}, "KP_Begin", function () mousey.drag("1") end),
  utils.key({ "Mod3"      }, "KP_Begin", mousey.init)
)
dragkeys = awful.util.table.join(
  utils.key({             }, "KP_Insert", function () mousey.drag("1") end),
  utils.key({             }, "KP_Delete", function () mousey.drag("2") end),
  utils.key({             }, "KP_Enter", function () mousey.drag("3") end),
  utils.key({             }, "KP_Begin", function () mousey.drag("1") end),
  utils.key({ "Mod3"      }, "KP_Begin", mousey.reset)
)


globalkeys = awful.util.table.join(globalkeys
                                   ,mousekeys
                                   ,clickkeys
)
altglobalkeys = awful.util.table.join(globalkeys, mousekeys, dragkeys)

clientkeys = awful.util.table.join(
  awful.key({ modkey,           }, "f",      function (c) c.fullscreen = not c.fullscreen  end),
  awful.key({ modkey, "Shift"   }, "c",      function (c) c:kill()                         end),
  awful.key({ modkey, "Control" }, "space",  awful.client.floating.toggle                     ),
  awful.key({ modkey, "Control" }, "Return", function (c) c:swap(awful.client.getmaster()) end),
  awful.key({ "Control",        }, "o",      awful.client.movetoscreen                        ),
  awful.key({ modkey,           }, "t",      function (c) c.ontop = not c.ontop            end),
  awful.key({ modkey,           }, "n",
    function (c)
      -- The client currently has the input focus, so it cannot be
      -- minimized, since minimized clients can't have the focus.
      c.minimized = true
  end),
  awful.key({ modkey,           }, "m",
    function (c)
      c.maximized_horizontal = not c.maximized_horizontal
      c.maximized_vertical   = not c.maximized_vertical
  end),
  awful.key({ modkey, "Mod3"    }, "KP_Begin", mousey.init),
  awful.key({ modkey, "Mod3"    }, "k", function (c) 
      c:keys(awful.util.table.join(clientkeys, awful.key({  }, "r", function (c) c:keys(clientkeys) naughty.notify {text="Works"}
                                       utils.clientSendKey(c, "r") end)))
  end),
  awful.key({ modkey }, "s", function (c) c.sticky = not c.sticky end),

  awful.key({ "Mod1" }, "x", function (c) 
      awful.client.floating.toggle(c)
      c.sticky = awful.client.floating.get(c)
      c.ontop = awful.client.floating.get(c)
  end),
  awful.key({ modkey }, "x", function (c) 
      awful.client.floating.toggle(c)
      c.sticky = awful.client.floating.get(c)
      c.ontop = awful.client.floating.get(c)
  end)
)



for i, k in ipairs({1, 2, 3, 4, 5, 6, 7, 8, 9}) do
  commandkeys = awful.util.table.join(commandkeys,
                                      {{{  }, "" .. i,
                                          function ()
                                            local tag = tags[mouse.screen][tags[mouse.screen].grp][i]
                                            local neighbortag = tags[(mouse.screen%2)+1][tags[mouse.screen].grp][i]
                                            utils.summonAll(neighbortag, tag)
                                            if tag then
                                              awful.tag.viewonly(tag)
                                            end
                                          end,},
                                        {{"Mod1" }, "" .. i,
                                          function ()
                                            if client.focus then
                                              local tag = tags[mouse.screen][tags[mouse.screen].grp][i]
                                              if tag then
                                                awful.client.movetotag(tag)
                                              end
                                            end
                                          end,},
                                        {{"Control"}, "" .. i,
                                          function ()
                                            utils.prevTagGrp()
                                            local tag = tags[mouse.screen][tags[mouse.screen].grp][i]
                                            local neighbortag = tags[(mouse.screen%2)+1][tags[mouse.screen].grp][i]
                                            utils.summonAll(neighbortag, tag)
                                            if tag then
                                              awful.tag.viewonly(tag)
                                            end
  end}})
end


globalkeys = awful.util.table.join(
    mousekeys,
    utils.key({"Mod1" }, "w", latches.latch("Command-Mode", commandkeys)),
    utils.key({ }, "F20", latches.latch("Command-Mode", commandkeys)))

clientbuttons = awful.util.table.join(
    awful.button({ }, 1, function (c) client.focus = c; c:raise() end),
    awful.button({ modkey }, 1, awful.mouse.client.move),
    awful.button({ modkey }, 3, awful.mouse.client.resize))



return {globalkeys=globalkeys, clientkeys=clientkeys, buttons=buttons, clientbuttons=clientbuttons}
