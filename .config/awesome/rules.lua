require("data")
local k = require("keys")
local latches = require("latches")
return {
    -- All clients will match this rule.
    { rule = { },
      properties = { border_width = beautiful.border_width,
                     border_color = beautiful.border_normal,
                     focus = awful.client.focus.filter,
                     keys = k.clientkeys,
                     buttons = k.clientbuttons
                     }},
    { rule = { class = CONKY_CLASS },
      properties = {
          floating = true,
          sticky = true,
          maximized = true,
          size_hints_honor = false,
          skip_taskbar = true,
          border_width = 0
      } },
    { rule = { class = GIMP_CLASS },
      properties = { floating = false, tag=tags[1][1][5] } },
    { rule = { class = SKYPE_CLASS },
      properties = { tag=tags[1][1][7] } },
    { rule = { class = STEAM_CLASS },
      properties = { tag=tags[1][1][8] } },
    { rule = { name = AUDIO_COM_NAME },
      properties = { tag=tags[1][3][7] } },
    { rule = { class = JACK_EQ_CLASS },
      properties = { tag=tags[1][3][2] } },
    { rule = { class = JACK_MIXER_CLASS },
      properties = { tag=tags[1][3][3] } },
    { rule = { class = PULSE_CONTROL_CLASS }, 
      properties = { tag=tags[1][1][9] } },
    { rule = { class = JACK_CONTROL_CLASS },
      properties = { tag=tags[1][3][8] } },
    { rule = { class = FIREFOX_CLASS },
      properties = { tag=tags[1][1][4], border_width="0" } },
}
