-- Standard awesome library
local gears = require("gears")
local awful = require("awful")
awful.rules = require("awful.rules")
require("awful.autofocus")
-- Theme handling library
local beautiful = require("beautiful")
-- Notification library
local naughty = require("naughty")
local vicious = require("vicious")
local menubar = require("menubar")
-- Widget and layout library
local wibox = require("wibox")
-- }}}

-- {{{ Variable definitions
local home   = os.getenv("HOME")
local exec   = awful.util.spawn_with_shell
local sexec  = awful.util.spawn_with_shell

-- Themes define colours, icons, and wallpapers
-- beautiful.init("~/.config/awesome/themes/default/theme.lua")
-- beautiful.init("/usr/share/awesome/themes/sky/theme.lua")
beautiful.init("/home/atilton2/.config/awesome/themes/sky/theme.lua")

-- This is used later as the default terminal and editor to run.
terminal = "urxvtc"
editor = "vim" 
editor_cmd = terminal .. " -e " .. editor

-- {{{ Error handling
-- Check if awesome encountered an error during startup and fell back to
-- another config (This code will only ever execute for the fallback config)
if awesome.startup_errors then
    naughty.notify({ preset = naughty.config.presets.critical,
                     title = "Oops, there were errors during startup!",
                     text = awesome.startup_errors })
end

-- Handle runtime errors after startup
do
    local in_error = false
    awesome.connect_signal("debug::error", function (err)
        -- Make sure we don't go into an endless error loop
        if in_error then return end
        in_error = true

        naughty.notify({ preset = naughty.config.presets.critical,
                         title = "Oops, an error happened!",
                         text = err })
        in_error = false
    end)
end
-- }}}

-- Default modkey.
-- Usually, Mod4 is the key with a logo between Control and Alt.
-- If you do not like this or do not have such a key,
-- I suggest you to remap Mod4 to another key using xmodmap or other tools.
-- However, you can use another modifier like Mod1, but it may interact with others.
modkey = "Mod1"

-- Table of layouts to cover with awful.layout.inc, order matters.
layouts =
{
    awful.layout.suit.tile,             --1
    awful.layout.suit.tile.left,        --2
    awful.layout.suit.tile.bottom,      --3
    awful.layout.suit.tile.top,         --4
    awful.layout.suit.fair,             --5
    awful.layout.suit.fair.horizontal,  --6
    awful.layout.suit.spiral,           --7
    awful.layout.suit.spiral.dwindle,   --8
    awful.layout.suit.max,              --9
    awful.layout.suit.max.fullscreen,   --10
    awful.layout.suit.magnifier,        --11
    awful.layout.suit.floating          --12
}
-- }}}

-- {{{ Tags
-- Define a tag table which hold all screen tags.
tags = {}
for s = 1, screen.count() do
    -- Each screen has its own tag table.
    tags[s] = awful.tag({ 
     "1 systerm", "2 sysweb", "3 workterm", 
     "4 workweb"}, s,
    {layouts[3], layouts[1], layouts[1], -- Tags: 1, 2, 3
     layouts[1]
    })
end
-- }}}

-- {{{ Menu
-- Create a laucher widget and a main menu
myawesomemenu = {
   { "manual", terminal .. " -e man awesome" },
   { "edit config", editor_cmd .. " " .. awesome.conffile },
   { "restart", awesome.restart },
   { "quit", awesome.quit }
}

mymainmenu = awful.menu({ items = { { "awesome", myawesomemenu, beautiful.awesome_icon },
                                    { "open terminal", terminal }
                                  }
                        })

mylauncher = awful.widget.launcher({ image = beautiful.awesome_icon,
                                     menu = mymainmenu })

-- Menubar configuration
menubar.utils.terminal = terminal -- Set the terminal for applications that require it
-- }}}

-- {{{ Wibox
-- {{{ Widgets configuration
-- {{{ Reusable separators
local spacer         = wibox.widget.textbox(" ")
local separator      = wibox.widget.textbox(" <span foreground='red'></span> ")
-- }}}

-- {{{ CPU load 
local cpuwidget = wibox.widget.textbox()
vicious.register(cpuwidget, vicious.widgets.cpu," <span foreground='#e2eeea'>load: </span><span foreground='#2e3436'>$2%</span><span foreground='#e2eeea'> - </span><span foreground='#2e3436'>$3%</span><span foreground='#e2eeea'> - </span><span foreground='#2e3436'>$4%</span><span foreground='#e2eeea'> - </span><span foreground='#2e3436'>$5%</span><span foreground='#e2eeea'> - </span><span foreground='#2e3436'>$6%</span><span foreground='#e2eeea'> - </span><span foreground='#2e3436'>$7%</span>")
-- }}}
 
-- {{{ CPU temperature
local thermalwidget  = wibox.widget.textbox()
vicious.register(thermalwidget, vicious.widgets.thermal, " <span foreground='#e2eeea'>temp: </span> <span foreground='#2e3436'>$1°C</span>", 20, { "coretemp.0", "core"} )
-- }}}

-- {{{ Date and time
local datewidget = wibox.widget.textbox()
vicious.register(datewidget, vicious.widgets.date, "<span foreground='#2e3436'>%a, %m.%d.%y - %H:%M</span>", 5)
-- }}}

-- {{{ Volume widget
local volwidget = wibox.widget.textbox()
vicious.register(volwidget, vicious.widgets.volume, "<span foreground='#e2eeea'>vol: </span><span foreground='#2e3436'>$1%</span>", 1, 'Master')
-- }}}

-- {{{ System tray
systray = wibox.widget.textbox()
-- }}}

-- {{{ Uptime Widget
local uptimewidget = wibox.widget.textbox()
  vicious.register(uptimewidget, vicious.widgets.uptime,
    function (widget, args)
      return string.format("<span foreground='#e2eeea'>uptime: </span><span foreground='#2e3436'>%2dd %02d:%02d</span> ", args[1], args[2], args[3], args[4])
    end, 61)
-- }}}

-- {{{ Pacman Widget
local pacwidget = wibox.widget.textbox()
pacwidget_t = awful.tooltip({ objects = { pacwidget},})
vicious.register(pacwidget, vicious.widgets.pkg,
                function(widget,args)
                    local io = { popen = io.popen }
                    local s = io.popen("pacman -Qu")
                    local str = ''

                    for line in s:lines() do
                        str = str .. line .. "\n"
                    end
                    pacwidget_t:set_text(str)
                    s:close()
                    return string.format("<span foreground='#e2eeea'>updates: </span><span foreground='#2e3436'>%d</span>", args[1])
                end, 60, "Arch")

                --'1800' means check every 30 minutes
-- }}}

-- {{{ Top Box
local mywibox     = {}
local mypromptbox = {}
local mylayoutbox = {}
local mytaglist   = {}

mytaglist.buttons = awful.util.table.join(
                    awful.button({ }, 1, awful.tag.viewonly),
                    awful.button({ modkey }, 1, awful.client.movetotag),
                    awful.button({ }, 3, awful.tag.viewtoggle),
                    awful.button({ modkey }, 3, awful.client.toggletag),
                    awful.button({ }, 4, awful.tag.viewnext),
                    awful.button({ }, 5, awful.tag.viewprev))

local mytasklist = {}
mytasklist.buttons = awful.util.table.join(
                awful.button({ }, 1,
                        function(c)
                                if not c:isvisible() then
                                        awful.tag.viewonly(c:tags()[1])
                                end
                                client.focus = c
                                c:raise()
                        end),
                 awful.button({ }, 3,
                        function()
                                if instance then
                                        instance:hide()
                                        instance = nil
                                else
                                        instance = awful.menu.clients({ width = 250 })
                                end
                        end),
                 awful.button({ }, 4,
                        function()
                                awful.client.focus.byidx(1)
                                if client.focus then
                                        client.focus:raise()
                                end
                        end),
                 awful.button({ }, 5,
                        function()
                                awful.client.focus.byidx(-1)
                                if client.focus then
                                        client.focus:raise()
                                end
                end)
)

for s = 1, screen.count() do
    -- Create a promptbox
    mypromptbox[s] = awful.widget.prompt()
    -- Create a layoutbox
    mylayoutbox[s] = awful.widget.layoutbox(s)
    mylayoutbox[s]:buttons(awful.util.table.join(
                           awful.button({ }, 1, function () awful.layout.inc(layouts, 1) end),
                           awful.button({ }, 3, function () awful.layout.inc(layouts, -1) end),
                           awful.button({ }, 4, function () awful.layout.inc(layouts, 1) end),
                           awful.button({ }, 5, function () awful.layout.inc(layouts, -1) end)
    ))

    -- Create a taglist widget
    mytaglist[s] = awful.widget.taglist(s, awful.widget.taglist.filter.all, mytaglist.buttons)

    -- Create a tasklist widget
    mytasklist[s] = awful.widget.tasklist(s, awful.widget.tasklist.filter.currenttags, mytasklist.buttons)

    -- Create the wibox
    mywibox[s] = awful.wibox({
        -- Change screen = 1/2 to switch screens, or s for both
        position = "top", screen = s,
        fg = beautiful.fg_normal, bg = beautiful.bg_normal, height=beautiful.widget_height
    })
    --
    -- Widgets that are aligned to the left
    local left_layout = wibox.layout.fixed.horizontal()
    left_layout:add(mylauncher)
    left_layout:add(mytaglist[s])
    left_layout:add(mylayoutbox[s])
    left_layout:add(mypromptbox[s])
    
    -- Widgets that are aligned to the right
    local right_layout = wibox.layout.fixed.horizontal()
    if s == 1 then right_layout:add(wibox.widget.systray()) end
    right_layout:add(spacer)
    right_layout:add(datewidget)
    right_layout:add(separator)
    right_layout:add(volwidget)
    right_layout:add(separator)
    right_layout:add(cpuwidget)
    right_layout:add(separator)
    right_layout:add(thermalwidget)
    
    -- Now bring it all together (with the tasklist in the middle)
    local layout = wibox.layout.align.horizontal()
    layout:set_left(left_layout)
    right_layout:add(spacer)
    layout:set_middle(mytasklist[s])
    right_layout:add(separator)
    layout:set_right(right_layout)
    --

    mywibox[s]:set_widget(layout)
end
-- }}}

-- {{{ Bottom Box
local mybottomwibox = {}

-- Change to s = 1 or 2 to switch between screens
for s = 2, screen.count() do
    -- Create the wibox
    mybottomwibox[s] = awful.wibox({
        position = "bottom", screen = 2,
        fg = beautiful.fg_normal, bg = beautiful.bg_normal, height=beautiful.widget_height
    })

    -- Widgets that are aligned to the left
    local bottom_left_layout = wibox.layout.fixed.horizontal()
    bottom_left_layout:add(spacer)
    bottom_left_layout:add(uptimewidget)
    bottom_left_layout:add(separator)
    bottom_left_layout:add(pacwidget)
    -- Add widgets to the wibox
    mybottomwibox[s]:set_widget(bottom_left_layout)
end

-- }}}
-- }}}
-- }}}

-- {{{ Mouse bindings
root.buttons(awful.util.table.join(
    awful.button({ }, 3, function () mymainmenu:toggle() end),
    awful.button({ }, 4, awful.tag.viewnext),
    awful.button({ }, 5, awful.tag.viewprev)
))
-- }}}

-- {{{ Key bindings
globalkeys = awful.util.table.join(
    awful.key({}, "XF86AudioMute", function() sexec("amixer sset Master toggle") end ),
    awful.key({}, "XF86AudioRaiseVolume", function() sexec("amixer set Master 2%+") end ),
    awful.key({}, "XF86AudioLowerVolume", function() sexec("amixer set Master 2%-") end ),
    awful.key({}, "XF86AudioNext", function() sexec("cmus-remote --next") end ),
    awful.key({}, "XF86AudioPrev", function() sexec("cmus-remote --prev") end ),
    awful.key({}, "XF86AudioPlay", function() sexec("cmus-remote --pause") end ),
    awful.key({}, "XF86HomePage", function() sexec("xlock -mode blank") end ),                   --fn - f2
    -- awful.key({}, "XF86AudioStop", function() sexec("scrot -e 'mv $f ~/bilder/screenshots'") end ), --fn - up
    -- awful.key({}, "XF86Tools", function() sexec("") end ),
    -- awful.key({}, "XF86Calculator", function() sexec("") end ),
    -- awful.key({}, "XF86Launch1", function() sexec("") end ),    --ThinkVantage
    -- awful.key({}, "XF86Sleep", function() sexec("sudo pm-suspend") end ),                           --fn - f4
    -- awful.key({}, "XF86WebCam", function() sexec("~/bin/bluetooth-toggle.sh") end ),                --fn - f6
    -- awful.key({}, "XF86Display", function() sexec("") end ),                       --fn - f7
    --awful.key({}, "XF86TouchpadToggle", function() sexec("~/bin/touchpad-toggle.sh") end ),         --fn - f8
   -- awful.key({}, "XF86MyComputer", function() sexec(commands.fileman) end ),
   -- awful.key({}, "XF86Mail", function() sexec(commands.mail) end ),
   -- awful.key({}, "XF86HomePage", function() sexec(commands.browser) end ),
   -- awful.key({}, "XF86Sleep", function() sexec(commands.lock) end ),
   -- awful.key({"Control", "Mod1"}, "l", function() sexec(commands.lock) end ),

    --default bindings
    awful.key({ modkey, "Control" }, "Left",   awful.tag.viewprev       ),
    awful.key({ modkey, "Control" }, "Right",  awful.tag.viewnext       ),
    awful.key({ modkey,           }, "Escape", awful.tag.history.restore),

    awful.key({ modkey,           }, "n",
        function ()
            awful.client.focus.byidx( 1)
            if client.focus then client.focus:raise() end
        end),
    awful.key({ modkey,           }, "k",
        function ()
            awful.client.focus.byidx(-1)
            if client.focus then client.focus:raise() end
        end),
    awful.key({ modkey,           }, "w", function () mymainmenu:show(true)        end),

    -- Layout manipulation
    awful.key({ modkey, "Shift"   }, "n", function () awful.client.swap.byidx(  1)    end),
    awful.key({ modkey, "Shift"   }, "k", function () awful.client.swap.byidx( -1)    end),
    awful.key({ modkey, "Control" }, "n", function () awful.screen.focus_relative( 1) end),
    awful.key({ modkey, "Control" }, "k", function () awful.screen.focus_relative(-1) end),
    awful.key({ modkey,           }, "u", awful.client.urgent.jumpto),
    awful.key({ modkey,           }, "Tab",
        function ()
            awful.client.focus.history.previous()
            if client.focus then
                client.focus:raise()
            end
        end),

    -- Standard program
    awful.key({ modkey,           }, "Return", function () exec(terminal) end),
    awful.key({ modkey, "Control" }, "r", awesome.restart),
    awful.key({ modkey, "Shift"   }, "q", awesome.quit),
    awful.key({ modkey,           }, "l",     function () awful.tag.incmwfact( 0.05)    end),
    awful.key({ modkey,           }, "h",     function () awful.tag.incmwfact(-0.05)    end),
    awful.key({ modkey, "Shift"   }, "h",     function () awful.tag.incnmaster( 1)      end),
    awful.key({ modkey, "Shift"   }, "l",     function () awful.tag.incnmaster(-1)      end),
    awful.key({ modkey, "Control" }, "h",     function () awful.tag.incncol( 1)         end),
    awful.key({ modkey, "Control" }, "l",     function () awful.tag.incncol(-1)         end),
    awful.key({ modkey,           }, "space", function () awful.layout.inc(layouts,  1) end),
    awful.key({ modkey, "Shift"   }, "space", function () awful.layout.inc(layouts, -1) end),

    -- Prompt
    awful.key({ modkey },     "p",     function () mypromptbox[mouse.screen]:run() end),
    -- Run stuff in a Terminal
    awful.key({ modkey }, "x", 
    function ()
     awful.prompt.run({ prompt = "Run in Terminal: " }, 
     mypromptbox[mouse.screen].widget,
     function (prog)
      sexec(terminal .. " -name " .. prog .. " -e /bin/zsh -c " .. prog)
     end)
    end)
)

clientkeys = awful.util.table.join(
    awful.key({ modkey,           }, "f",      function (c) c.fullscreen = not c.fullscreen  end),
    awful.key({ modkey, "Shift"   }, "c",      function (c) c:kill()                         end),
    awful.key({ modkey, "Control" }, "space",  awful.client.floating.toggle                     ),
    awful.key({ modkey, "Control" }, "Return", function (c) c:swap(awful.client.getmaster()) end),
    awful.key({ modkey,           }, "o",      awful.client.movetoscreen                        ),
    awful.key({ modkey, "Shift"   }, "r",      function (c) c:redraw()                       end),
    awful.key({ modkey,           }, "j",      function (c) c.minimized = not c.minimized    end),
    awful.key({ modkey,           }, "m",
        function (c)
            c.maximized_horizontal = not c.maximized_horizontal
            c.maximized_vertical   = not c.maximized_vertical
        end),


    -- Two Screen Full Screen
    awful.key({ modkey, "Shift" }, "f",        

           function (c)
               awful.client.floating.toggle(c)
               if awful.client.floating.get(c) then
                   local clientX = screen[1].workarea.x
                   local clientY = screen[1].workarea.y
                   local clientWidth = 0
                   -- look at http://www.rpm.org/api/4.4.2.2/llimits_8h-source.html
                   local clientHeight = 2147483640
                   for s = 1, screen.count() do
                       clientHeight = math.min(clientHeight, screen[s].workarea.height)
                       clientWidth = clientWidth + screen[s].workarea.width
                   end
                   local t = c:geometry({x = clientX, y = clientY, width = clientWidth, height = clientHeight})
               else
                   --apply the rules to this client so he can return to the right tag if there is a rule for that.
                   awful.rules.apply(c)
               end
               -- focus our client
               client.focus = c
           end)

)

-- Compute the maximum number of digit we need, limited to 9
keynumber = 0
for s = 1, screen.count() do
   keynumber = math.min(9, math.max(#tags[s], keynumber));
end

-- Bind all key numbers to tags.
-- Be careful: we use keycodes to make it works on any keyboard layout.
-- This should map on the top row of your keyboard, usually 1 to 9.
for i = 1, keynumber do
    globalkeys = awful.util.table.join(globalkeys,
        awful.key({ modkey }, "#" .. i + 9,
                  function ()
                        local screen = mouse.screen
                        if tags[screen][i] then
                            awful.tag.viewonly(tags[screen][i])
                        end
                  end),
        awful.key({ modkey, "Control" }, "#" .. i + 9,
                  function ()
                      local screen = mouse.screen
                      if tags[screen][i] then
                          awful.tag.viewtoggle(tags[screen][i])
                      end
                  end),
        awful.key({ modkey, "Shift" }, "#" .. i + 9,
                  function ()
                      if client.focus and tags[client.focus.screen][i] then
                          awful.client.movetotag(tags[client.focus.screen][i])
                      end
                  end),
        awful.key({ modkey, "Control", "Shift" }, "#" .. i + 9,
                  function ()
                      if client.focus and tags[clent.focus.screen][i] then
                          awful.client.toggletag(tags[client.focus.screen][i])
                      end
                  end))
end

clientbuttons = awful.util.table.join(
    awful.button({ }, 1, function (c) client.focus = c; c:raise() end),
    awful.button({ modkey }, 1, awful.mouse.client.move),
    awful.button({ modkey }, 3, awful.mouse.client.resize))

-- Set keys
root.keys(globalkeys)
-- }}}

-- {{{ Rules
awful.rules.rules = {
    -- All clients will match this rule.
    { rule = { },
      properties = { border_width = beautiful.border_width,
                     border_color = beautiful.border_normal,
                     focus = true,
                     keys = clientkeys,
                     buttons = clientbuttons } },
    { rule = { class = "MPlayer" },
      properties = { floating = true } },
    { rule = { class = "pinentry" },
      properties = { floating = true } },
    { rule = { class = "gimp" },
      properties = { floating = true } },
    -- Set Firefox to always map on tags number 2 of screen 1.
    -- { rule = { class = "Firefox" },
    --   properties = { tag = tags[1][2] } },
}
-- }}}

-- {{{ Signals
-- Signal function to execute when a new client appears.
client.add_signal("manage", function (c, startup)
    -- Add a titlebar
    -- awful.titlebar.add(c, { modkey = modkey })

    -- Enable sloppy focus
    c:add_signal("mouse::enter", function(c)
        if awful.layout.get(c.screen) ~= awful.layout.suit.magnifier
            and awful.client.focus.filter(c) then
            client.focus = c
        end
    end)

    if not startup then
        -- Set the windows at the slave,
        -- i.e. put it at the end of others instead of setting it master.
        -- awful.client.setslave(c)

        -- Put windows in a smart way, only if they does not set an initial position.
        if not c.size_hints.user_position and not c.size_hints.program_position then
            awful.placement.no_overlap(c)
            awful.placement.no_offscreen(c)
        end
    end
end)

client.add_signal("focus", function(c) c.border_color = beautiful.border_focus end)
client.add_signal("unfocus", function(c) c.border_color = beautiful.border_normal end)
-- }}}
