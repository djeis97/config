
theme = {}
themes_dir = os.getenv("HOME") .. "/.config/awesome/themes/lcars"
theme.dir = themes_dir
--theme.wallpaper_cmd = "hsetroot"
--theme.wallpaper_cmd = "nitrogen --restore"
theme.show_widget_icon = false
theme.widget_use_text_decorations = false
theme.bg	= "#000000"
theme.fg	= "#ffcc99"
theme.alt_fg	= "#ffcc66"
theme.shiny	= "#000000"
theme.theme	= "#cc99cc"
theme.warning = "#ff9900"
theme.error	= "#ff3300"
theme.border	= "#000000"
theme.sel_border	= "#ff9900"
theme.titlebar	= "#000000"
theme.titlebar_focus	= "#000000"
theme.titlebar_focus_border = theme.sel_border
theme.color1 = '#ff9966'
theme.color2 = '#cc99cc'
theme.color3 = '#cc6666'
theme.color4 = '#99ccff'
theme.color5 = '#9999ff'
theme.color6 = '#6666ff'
theme.color7 = '#cc9966'
theme.color8 = '#6699cc'
theme.color9 = '#9966ff'
theme.color10 = '#666699'
theme.colorf = theme.fg
theme.colorb = theme.bg
theme.colorerr = theme.error
theme.colorwarn = theme.warning
theme.alt_bg	= theme.color9
theme.theme2 = theme.color1
theme.font = "Meslo LG S for Lcarsline Bold 10.5"
theme.sans_font = "PT Sans Bold 10.3"
theme.fg_normal	= theme.fg
theme.bg_normal	= theme.bg
theme.fg_focus	= theme.shiny
theme.bg_focus	= theme.theme
theme.fg_urgent	= theme.bg
theme.bg_urgent	= theme.error
theme.screen_margin	= 0
theme.border_width	= "10"
theme.border_normal	= theme.border
theme.border_focus	= theme.sel_border
theme.border_marked	= theme.error
theme.panel_bg = theme.bg
theme.panel_fg = theme.fg
theme.panel_height = 23
theme.panel_opacity	= 1.0
theme.panel_padding_bottom = 6
theme.taglist_font	= theme.font
theme.taglist_fg_occupied	= theme.theme2
theme.taglist_bg_occupied	= theme.bg
theme.taglist_fg_empty	= theme.theme
theme.taglist_bg_empty	= theme.bg
theme.taglist_fg_focus	= theme.bg
theme.taglist_bg_focus	= theme.theme2
theme.tasklist_font	= theme.sans_font
theme.tasklist_fg_focus	= theme.alt_bg
theme.tasklist_bg_focus	= theme.bg
theme.tasklist_fg_normal	= theme.fg
theme.tasklist_bg_normal	= theme.bg
theme.tasklist_fg_minimize	= theme.bg
theme.tasklist_bg_minimize	= theme.alt_bg
theme.titlebar_font	= theme.font
theme.titlebar_fg_focus	= theme.tasklist_fg_focus
theme.titlebar_fg_normal	= theme.tasklist_fg_normal
theme.titlebar_bg_focus	= theme.titlebar_focus
theme.titlebar_bg_normal	= theme.titlebar
theme.titlebar_opacity = 0.7
theme.titlebar_position = 'top'
theme.notification_opacity	= 0.8
theme.notification_font	= theme.sans_font
theme.notification_monofont	= theme.font
theme.notify_fg	= theme.fg_normal
theme.notify_bg	= theme.bg_normal
theme.notify_border	= theme.border_focus
theme.textbox_widget_margin_top	= 1
theme.awful_widget_height	= 14
theme.awful_widget_margin_top	= 2
theme.mouse_finder_color	= theme.error
theme.menu_border_width	= "3"
theme.menu_height	= "16"
theme.menu_width	= "140"
theme.player_text	= theme.color2
-- ICONS
icons_dir = theme.dir .. "/icons/"
theme.icons_dir = icons_dir
theme.menu_submenu_icon	= icons_dir .. "submenu.png"
theme.taglist_squares_sel	= icons_dir .. "square_sel.png"
theme.taglist_squares_unsel	= icons_dir .. "square_unsel.png"
theme.small_separator	= icons_dir .. "small_separator.png"
theme.arrl	= icons_dir .. "arrl.png"
theme.arrr	= icons_dir .. "arrr.png"
theme.arrlerr	= icons_dir .. "arrl_err.png"
theme.arrrerr	= icons_dir .. "arrr_err.png"
theme.arrlwarn	= icons_dir .. "arrl_warn.png"
theme.arrrwarn	= icons_dir .. "arrr_warn.png"
theme.arrl1	= icons_dir .. "arrl1.png"
theme.arrr1	= icons_dir .. "arrr1.png"
theme.arrl2	= icons_dir .. "arrl2.png"
theme.arrr2	= icons_dir .. "arrr2.png"
theme.arrl3	= icons_dir .. "arrl3.png"
theme.arrr3	= icons_dir .. "arrr3.png"
theme.arrl4	= icons_dir .. "arrl4.png"
theme.arrr4	= icons_dir .. "arrr4.png"
theme.arrl5	= icons_dir .. "arrl5.png"
theme.arrr5	= icons_dir .. "arrr5.png"
theme.arrl6	= icons_dir .. "arrl6.png"
theme.arrr6	= icons_dir .. "arrr6.png"
theme.arrl9	= icons_dir .. "arrl9.png"
theme.arrr9	= icons_dir .. "arrr9.png"
theme.widget_ac	= icons_dir .. "ac.png"
theme.widget_ac_charging	= icons_dir .. "ac_charging.png"
theme.widget_ac_charging_low	= icons_dir .. "ac_charging_low.png"
theme.widget_battery	= icons_dir .. "battery.png"
theme.widget_battery_low	= icons_dir .. "battery_low.png"
theme.widget_battery_empty	= icons_dir .. "battery_empty.png"
theme.widget_mem	= icons_dir .. "mem.png"
theme.widget_cpu	= icons_dir .. "cpu.png"
theme.widget_temp	= icons_dir .. "temp.png"
theme.widget_net	= icons_dir .. "net.png"
theme.widget_hdd	= icons_dir .. "hdd.png"
theme.widget_net_wireless	= icons_dir .. "net_wireless.png"
theme.widget_net_wired	= icons_dir .. "net_wired.png"
theme.widget_net_searching	= icons_dir .. "net_searching.png"
theme.widget_music	= icons_dir .. "note.png"
theme.widget_music_on	= icons_dir .. "note_on.png"
theme.widget_music_off	= icons_dir .. "note_off.png"
theme.widget_vol_high	= icons_dir .. "vol_high.png"
theme.widget_vol	= icons_dir .. "vol.png"
theme.widget_vol_low	= icons_dir .. "vol_low.png"
theme.widget_vol_no	= icons_dir .. "vol_no.png"
theme.widget_vol_mute	= icons_dir .. "vol_mute.png"
theme.widget_mail	= icons_dir .. "mail.png"
theme.widget_mail_on	= icons_dir .. "mail_on.png"
theme.dropdown_icon	= icons_dir .. "dropdown.png"
theme.tasklist_disable_icon = true
-- Display the taglist squares
theme.taglist_squares_sel   = "/usr/share/awesome/themes/default/taglist/squarefw.png"
theme.taglist_squares_unsel = "/usr/share/awesome/themes/default/taglist/squarew.png"

-- Variables set for theming the menu:
-- menu_[bg|fg]_[normal|focus]
-- menu_[border_color|border_width]
theme.menu_submenu_icon = "/usr/share/awesome/themes/default/submenu.png"
theme.menu_height = 15
theme.menu_width  = 100

-- You can add as many variables as
-- you wish and access them by using
-- beautiful.variable in your rc.lua
--theme.bg_widget = "#cc0000"

-- Define the image to load
theme.titlebar_close_button_normal = "/usr/share/awesome/themes/default/titlebar/close_normal.png"
theme.titlebar_close_button_focus  = "/usr/share/awesome/themes/default/titlebar/close_focus.png"

theme.titlebar_ontop_button_normal_inactive = "/usr/share/awesome/themes/default/titlebar/ontop_normal_inactive.png"
theme.titlebar_ontop_button_focus_inactive  = "/usr/share/awesome/themes/default/titlebar/ontop_focus_inactive.png"
theme.titlebar_ontop_button_normal_active = "/usr/share/awesome/themes/default/titlebar/ontop_normal_active.png"
theme.titlebar_ontop_button_focus_active  = "/usr/share/awesome/themes/default/titlebar/ontop_focus_active.png"

theme.titlebar_sticky_button_normal_inactive = "/usr/share/awesome/themes/default/titlebar/sticky_normal_inactive.png"
theme.titlebar_sticky_button_focus_inactive  = "/usr/share/awesome/themes/default/titlebar/sticky_focus_inactive.png"
theme.titlebar_sticky_button_normal_active = "/usr/share/awesome/themes/default/titlebar/sticky_normal_active.png"
theme.titlebar_sticky_button_focus_active  = "/usr/share/awesome/themes/default/titlebar/sticky_focus_active.png"

theme.titlebar_floating_button_normal_inactive = "/usr/share/awesome/themes/default/titlebar/floating_normal_inactive.png"
theme.titlebar_floating_button_focus_inactive  = "/usr/share/awesome/themes/default/titlebar/floating_focus_inactive.png"
theme.titlebar_floating_button_normal_active = "/usr/share/awesome/themes/default/titlebar/floating_normal_active.png"
theme.titlebar_floating_button_focus_active  = "/usr/share/awesome/themes/default/titlebar/floating_focus_active.png"

theme.titlebar_maximized_button_normal_inactive = "/usr/share/awesome/themes/default/titlebar/maximized_normal_inactive.png"
theme.titlebar_maximized_button_focus_inactive  = "/usr/share/awesome/themes/default/titlebar/maximized_focus_inactive.png"
theme.titlebar_maximized_button_normal_active = "/usr/share/awesome/themes/default/titlebar/maximized_normal_active.png"
theme.titlebar_maximized_button_focus_active  = "/usr/share/awesome/themes/default/titlebar/maximized_focus_active.png"

theme.wallpaper = "/usr/share/awesome/themes/default/background.png"

-- You can use your own layout icons like this:
theme.layout_fairh = "/usr/share/awesome/themes/default/layouts/fairhw.png"
theme.layout_fairv = "/usr/share/awesome/themes/default/layouts/fairvw.png"
theme.layout_floating  = "/usr/share/awesome/themes/default/layouts/floatingw.png"
theme.layout_magnifier = "/usr/share/awesome/themes/default/layouts/magnifierw.png"
theme.layout_max = "/usr/share/awesome/themes/default/layouts/maxw.png"
theme.layout_fullscreen = "/usr/share/awesome/themes/default/layouts/fullscreenw.png"
theme.layout_tilebottom = "/usr/share/awesome/themes/default/layouts/tilebottomw.png"
theme.layout_tileleft   = "/usr/share/awesome/themes/default/layouts/tileleftw.png"
theme.layout_tile = "/usr/share/awesome/themes/default/layouts/tilew.png"
theme.layout_tiletop = "/usr/share/awesome/themes/default/layouts/tiletopw.png"
theme.layout_spiral  = "/usr/share/awesome/themes/default/layouts/spiralw.png"
theme.layout_dwindle = "/usr/share/awesome/themes/default/layouts/dwindlew.png"

theme.awesome_icon = "/usr/share/awesome/icons/awesome16.png"
return theme
