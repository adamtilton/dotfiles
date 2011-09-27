---------------------------
-- downbe awesome theme --
---------------------------

config_dir = awful.util.getdir("config")

theme = {}

theme.font          = "liberation mono 9"

-- default color
--
--  text color of selected stuff
theme.bg_normal     = "#141414"
--  background color of selected stuff
theme.fg_normal     = "#d3d3d3"

-- urgent color
theme.fg_urgent     = "#ffffff"
theme.bg_urgent     = "#ff0000"

-- minimized window
theme.bg_minimize   = "#444444"
theme.fg_minimize   = "#000000"

-- borders
theme.border_width  = "1"
-- unfocused window
theme.border_normal = "#000000"
-- focused window
theme.border_focus  = "#141414"
theme.border_marked = "#ff0000"

-- taskbar (overrides theme.*_normal
-- theme.tasklist_bg_focus = "#ff0000"
-- theme.tasklist_fg_focus = "#ee0000"

-- the selected tag
theme.taglist_bg_focus = "#3465a4"
theme.taglist_fg_focus = "#ffffff"

-- urgent tag
theme.taglist_bg_urgent = "#ff0000"
theme.taglist_fg_urgent = "#ffffff"

-- There are other variable sets
-- overriding the default one when
-- defined, the sets are:
-- [taglist|tasklist]_[bg|fg]_[focus|urgent]
-- titlebar_[bg|fg]_[normal|focus]
-- tooltip_[font|opacity|fg_color|bg_color|border_width|border_color]
-- mouse_finder_[color|timeout|animate_timeout|radius|factor]
-- Example:
--theme.taglist_bg_focus = "#ff0000"

-- Display the taglist squares
theme.taglist_squares_sel   = config_dir .. "/themes/downbe/taglist/squarefw.png"
theme.taglist_squares_unsel = config_dir .. "/themes/downbe/taglist/squarew.png"
theme.tasklist_floating_icon = config_dir .. "/themes/downbe/tasklist/floatingw.png"

-- Variables set for theming the menu:
-- menu_[bg|fg]_[normal|focus]
-- menu_[border_color|border_width]
theme.menu_submenu_icon = config_dir .. "/themes/downbe/submenu.png"
theme.menu_height = "15"
theme.menu_width  = "100"

-- You can add as many variables as
-- you wish and access them by using
-- beautiful.variable in your rc.lua
--theme.bg_widget = "#cc0000"

-- Define the image to load
theme.titlebar_close_button_normal = config_dir .. "/themes/downbe/titlebar/close_normal.png"
theme.titlebar_close_button_focus  = config_dir .. "/themes/downbe/titlebar/close_focus.png"

theme.titlebar_ontop_button_normal_inactive = config_dir .. "/themes/downbe/titlebar/ontop_normal_inactive.png"
theme.titlebar_ontop_button_focus_inactive  = config_dir .. "/themes/downbe/titlebar/ontop_focus_inactive.png"
theme.titlebar_ontop_button_normal_active = config_dir .. "/themes/downbe/titlebar/ontop_normal_active.png"
theme.titlebar_ontop_button_focus_active  = config_dir .. "/themes/downbe/titlebar/ontop_focus_active.png"

theme.titlebar_sticky_button_normal_inactive = config_dir .. "/themes/downbe/titlebar/sticky_normal_inactive.png"
theme.titlebar_sticky_button_focus_inactive  = config_dir .. "/themes/downbe/titlebar/sticky_focus_inactive.png"
theme.titlebar_sticky_button_normal_active = config_dir .. "/themes/downbe/titlebar/sticky_normal_active.png"
theme.titlebar_sticky_button_focus_active  = config_dir .. "/themes/downbe/titlebar/sticky_focus_active.png"

theme.titlebar_floating_button_normal_inactive = config_dir .. "/themes/downbe/titlebar/floating_normal_inactive.png"
theme.titlebar_floating_button_focus_inactive  = config_dir .. "/themes/downbe/titlebar/floating_focus_inactive.png"
theme.titlebar_floating_button_normal_active = config_dir .. "/themes/downbe/titlebar/floating_normal_active.png"
theme.titlebar_floating_button_focus_active  = config_dir .. "/themes/downbe/titlebar/floating_focus_active.png"

theme.titlebar_maximized_button_normal_inactive = config_dir .. "/themes/downbe/titlebar/maximized_normal_inactive.png"
theme.titlebar_maximized_button_focus_inactive  = config_dir .. "/themes/downbe/titlebar/maximized_focus_inactive.png"
theme.titlebar_maximized_button_normal_active = config_dir .. "/themes/downbe/titlebar/maximized_normal_active.png"
theme.titlebar_maximized_button_focus_active  = config_dir .. "/themes/downbe/titlebar/maximized_focus_active.png"

-- You can use your own command to set your wallpaper
-- theme.wallpaper_cmd = { "awsetbg /drum/misc/img/pool_balls.jpg" }
-- theme.wallpaper_cmd = { "feh --bg-fill /home/atilton2/eyecandy/wallpapers/arch-black.svg" }
-- while true;
-- do
--   awsetbg -r /home/atilton2/eyecandy/wallpapers
--   sleep 1m 
-- done &
-- You can use your own layout icons like this:
theme.layout_fairh = config_dir .. "/themes/downbe/layouts/fairhw.png"
theme.layout_fairv = config_dir .. "/themes/downbe/layouts/fairvw.png"
theme.layout_floating  = config_dir .. "/themes/downbe/layouts/floatingw.png"
theme.layout_magnifier = config_dir .. "/themes/downbe/layouts/magnifierw.png"
theme.layout_max = config_dir .. "/themes/downbe/layouts/maxw.png"
theme.layout_fullscreen = config_dir .. "/themes/downbe/layouts/fullscreenw.png"
theme.layout_tilebottom = config_dir .. "/themes/downbe/layouts/tilebottomw.png"
theme.layout_tileleft   = config_dir .. "/themes/downbe/layouts/tileleftw.png"
theme.layout_tile = config_dir .. "/themes/downbe/layouts/tilew.png"
theme.layout_tiletop = config_dir .. "/themes/downbe/layouts/tiletopw.png"
theme.layout_spiral  = config_dir .. "/themes/downbe/layouts/spiralw.png"
theme.layout_dwindle = config_dir .. "/themes/downbe/layouts/dwindlew.png"

-- theme.awesome_icon = config_dir .. "/icons/n0ah16.png"
theme.awesome_icon = config_dir .. "/themes/downbe/nktvansface_16x16.png"

return theme

-- vim: filetype=lua:expandtab:shiftwidth=4:tabstop=8:softtabstop=4:textwidth=80
