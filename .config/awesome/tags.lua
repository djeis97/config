require("data")
local myLayout = require("myLayout")

-- {{{ Tags
-- Define a tag table which hold all screen tags.

tags[1] = awful.tag({ "Admin", "Files", "Docs", "FF", "GIMP", 16, "Skype", "Steam", "PulseAudio" }, 1, layouts[1])
tags[2] = awful.tag({ "Admin", 22, 23, 24, 25, 26, 27, 28, 29 }, 1, layouts[1])
tags[3] = awful.tag({ "Admin", "JackEQ", 33, 34, "Ardour", "Zyn", "AudioCmd", "Jack", "Alsa" }, 1, layouts[1])
tags.grp = 1


for t = 1, #tags[2] do
    awful.tag.setproperty(tags[2][t], "hide", true)
end

for t = 1, #tags[3] do
    awful.tag.setproperty(tags[3][t], "hide", true)
end

for n = 1,3 do
    for t = 1, #tags[n] do
        tagData[tags[n][t]] = {}
        awful.layout.set(myLayout, tags[n][t])
    end
end


tagData[tags[1][5]] = {"h", 2, {0.32}, {
                          {"v", 2, {0.5}, {
                              {}, 
                              {}}},
                          {}}}
-- }}}