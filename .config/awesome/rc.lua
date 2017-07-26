capi = {screen=screen, tag=tag, keygrabber=keygrabber}
-- Standard awesome library
gears = require("gears")
awful = require("awful")
awful.rules = require("awful.rules")
require("awful.autofocus")
-- Widget and layout library
wibox = require("wibox")
-- Theme handling library
beautiful = require("beautiful")
-- Notification library
naughty = require("naughty")

menubar = require("menubar")


-- My libraries

require("data")
-- utils
utils = require("util")

k = require("keys")


-- conky
local conky = require("conky")
local audio = require("audio")

require("errors")

-- {{{ Variable definitions
-- Themes define colours, icons, and wallpapers
beautiful.init("~/.config/awesome/themes/lcars/theme.lua")


-- {{{ Wallpaper
if beautiful.wallpaper then
    for s = 1, screen.count() do
        gears.wallpaper.maximized(beautiful.wallpaper, s, true)
    end
end
-- }}}

require("tags")

require("menu")

require("wiboxGen")


-- {{{ Mouse bindings
root.buttons(k.buttons)
-- }}}


-- Set keys
root.keys(k.globalkeys)
-- }}}

-- {{{ Rules
awful.rules.rules = require("rules")
-- }}}

require("signals")

require("run")
