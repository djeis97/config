local latches = require("latches")
local sessionControls = {}

function sessionControls.lock ()
  awful.util.spawn_with_shell("cinnamon-screensaver-command -l")
end

function sessionControls.hibernate ()
  awful.util.spawn_with_shell("gksu pm-hibernate && cinnamon-screensaver-command -l")
end

function sessionControls.suspend ()
  awful.util.spawn_with_shell("gksu pm-suspend && cinnamon-screensaver-command -l")
end

sessionControls.latch = latches.latch("Session Controls", {
                                        {n="Lock", {  }, "l", sessionControls.lock, latches.exit},
                                        {n="Suspend", {  }, "s", sessionControls.suspend, latches.exit},
                                        {n="Hibernate", {  }, "h", sessionControls.hibernate, latches.exit}})

return sessionControls
