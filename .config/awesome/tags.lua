require("data")
local max = require("awful.layout.suit.max")
local mymax = require("max")

-- {{{ Tags
-- Define a tag table which hold all screen tags.

for s = 1, screen.count() do
    -- Each screen has its own tag table.
tags[s] = {}
tags[s][1] = awful.tag({ "Code", "Files", "Docs", "FF", 15, 16, "Skype", "Steam", "PulseAudio" }, s, max)
tags[s][2] = awful.tag({ "Admin", 22, 23, 24, 25, 26, 27, 28, 29 }, s, max)
tags[s][3] = awful.tag({ "Admin", "JackEQ", 33, 34, "Ardour", "Zyn", "AudioCmd", "Jack", "Alsa" }, s, max)
tags[s].grp = 1

for t = 1, #tags[s][2] do
    awful.tag.setproperty(tags[s][2][t], "hide", true)
end

for t = 1, #tags[s][3] do
    awful.tag.setproperty(tags[s][3][t], "hide", true)
end

tagData[tags[s][1][5]] = {"h", 2, {0.32}, {
                          {"v", 2, {0.5}, {
                              {},
                              {}}},
                          {}}}
end
-- }}}
