require("data")
local latches = require("latches")
-- {{ audio stuff

utils.run_once("pulseaudio")
local audio = {}
audio.pulseaudioMax = 655.36
audio.pulseStep = 2
audio.alsaStep = 1
audio.MPDStep = 2

-- }}

function audio.getPulseVolume ()
    volume = tonumber(io.popen('pacmd list-sinks | grep "volume" | sed "s|^.*: \\([0-9]*\\).*|\\1|" |head -n 1'):read())
    volume = volume/audio.pulseaudioMax
    return volume
end

function audio.getAlsaVolume ()
    return tonumber(io.popen('amixer -c ' .. audio_card .. ' | grep "^  Mono" | head -n 1 | sed "s|.*\\[\\([0-9]*\\)%\\].*|\\1|"'):read())
end

function audio.getMPDVolume ()
    return tonumber(io.popen('mpc volume | sed "s|.*:\\([0-9 ]*\\)%.*|\\1|"'):read())
end

function audio.setPulseVolume (vol)
    io.popen("pacmd set-sink-volume jack_out " .. tostring(math.ceil(vol*audio.pulseaudioMax)))
end


function audio.setMPDvolume (vol)
    awful.util.spawn_with_shell("mpc volume " .. tostring(vol))
end

function audio.report (title, vol)
    naughtyIDs.vol = naughty.notify({title=title, text="Volume: " .. tostring(math.ceil(vol)) .. "%", replaces_id=naughtyIDs.vol}).id
end

function audio.reportMPDState ()
    local status = io.popen('mpc | head -n 2 | tail -n 1 | sed "s|^\\[\\(.*\\)\\].*|\\1|"'):read()
    local song = io.popen('mpc | head -n 1'):read()
    naughtyIDs.MPDState = naughty.notify({title=status, text=song, replaces_id=naughtyIDs.MPDState, icon=io.popen("mpdCurrentAlbumArt 2>/dev/null"):read()}).id
end

local prefix = ""

function audio.MPDCommand (command)
    local out = io.popen(prefix .. command .. "&2>1"):read("*a")
    naughtyIDs.MPDCommand = naughty.notify({
        text=out,
        replaces_id=naughtyIDs.MPDCommand,
        timeout=30,
        icon=io.popen("mpdCurrentAlbumArt 2>/dev/null"):read()}).id
end

function audio.MPDCommandKeypress (mod, key, command)
    if mod.Control then
        if key == "n" then return true, command .. " | cat -n" end
        if key == "g" then return true, command .. " | grep " end
        if key == "a" then return true, command .. " | mpc add" end
    else
        return false
    end
end

function audio.MPDPrompt (pre)
    prefix = pre or "mpc "
    awful.prompt.run({ prompt="Run: " .. prefix},
        mypromptbox[mouse.screen].widget,
        function (command) audio.MPDCommand(command, prefix) end,
        nil,
        awful.util.getdir("cache") .. "/" .. prefix .. "eval",
        nil, nil, nil,
        audio.MPDCommandKeypress)
end

function audio.incPulse ()
    local vol = audio.getPulseVolume() + audio.pulseStep
    audio.setPulseVolume(vol)
    vol = audio.getPulseVolume()
    audio.report("Pulseaudio volume", vol)
end

function audio.decPulse ()
    local vol = audio.getPulseVolume() - audio.pulseStep
    audio.setPulseVolume(vol)
    vol = audio.getPulseVolume()
    audio.report("Pulseaudio volume", vol)
end

function audio.mutePulse ()
    io.popen("pactl set-sink-mute 0 toggle")
    os.execute("sleep .01")
    naughtyIDs.mutePulse = naughty.notify({text=io.popen("pacmd list-sinks | grep muted | head -n 1 | sed 's|.*\\(muted: .*\\)|\\1|'"):read(), replaces_id=naughtyIDs.mutePulse}).id
end

function audio.incAlsa ()
    local vol = audio.getAlsaVolume() + audio.alsaStep
    io.popen("amixer -c " .. audio_card .. " set Master " .. tostring(audio.alsaStep) .. "%+")
    vol = audio.getAlsaVolume()
    audio.report("Alsa volume", vol)
end

function audio.decAlsa ()
    local vol = audio.getAlsaVolume() - audio.alsaStep
    io.popen("amixer -c " .. audio_card .. " set Master " .. tostring(audio.alsaStep) .. "%-")
    vol = audio.getAlsaVolume()
    audio.report("Alsa volume", vol)
end

function audio.incMPD ()
    local vol = audio.getMPDVolume() + audio.MPDStep
    audio.setMPDvolume(vol)
    vol = audio.getMPDVolume()
    audio.report("MPD volume", vol)
end

function audio.decMPD ()
    local vol = audio.getMPDVolume() - audio.MPDStep
    audio.setMPDvolume(vol)
    vol = audio.getMPDVolume()
    audio.report("MPD volume", vol)
end

function audio.MPDControlFunc (var, report)
    if report then
        function ret ()
            io.popen("mpc " .. var)
            os.execute("sleep .01")
            var = utils.strSplit(var, " ")
            var = var[1]
            naughtyIDs.MPDReport = naughty.notify({text=io.popen('mpc | tail -n 1 | sed "s|.*\\(' .. var ..': ...\\).*|\\1|"'):read(), replaces_id=naughtyIDs.MPDReport, icon=io.popen("mpdCurrentAlbumArt 2>/dev/null"):read()}).id
        end
    else
        function ret ()
            io.popen("mpc " .. var)
        end
    end
    return ret
end
audio.MPDNext = audio.MPDControlFunc("next")
audio.MPDPrev = audio.MPDControlFunc("prev")
audio.MPDRepeatOn = audio.MPDControlFunc("repeat on")
audio.MPDRepeatOff = audio.MPDControlFunc("repeat off")
audio.MPDRepeatTog = audio.MPDControlFunc("repeat", true)
audio.MPDRandomOn = audio.MPDControlFunc("random on")
audio.MPDRandomOff = audio.MPDControlFunc("random off")
audio.MPDRandomTog = audio.MPDControlFunc("random", true)
audio.MPDLoopOn = audio.MPDControlFunc("single on")
audio.MPDLoopOff = audio.MPDControlFunc("single off")
audio.MPDLoopTog = audio.MPDControlFunc("single", true)



local jackLatch = latches.latch("Sound-Jack", {
                  { n="qjackctl", {		}, "q", utils.keyspawn("qjackctl"), latches.continue},
                  { n="a2jmidid", {   }, "m", utils.keyspawn("a2jmidid -e"), latches.continue},
                  { n="Setup", {   }, "b", function ()
                                    awful.util.spawn_with_shell("alsa_in -j MPDD -d mpdtojack")
                                    awful.util.spawn_with_shell("alsa_in -j MPDW -d mpdtojackwireless")
                                    awful.util.spawn_with_shell("alsa_in -j cloop -d cloop")
                                    awful.util.spawn_with_shell("alsa_out -j ploop -d ploop")
                                end, latches.continue}})
local programsLatch = latches.latch("Sound-Programs", {
                  { n="zyn", {   }, "z", utils.keyspawn("zynaddsubfx"), latches.exit}})

local alsaLatch = latches.latch("Sound-Alsa", {
                  { n="Mixer", {   }, "m", utils.keyspawn('terminator -e "alsamixer -c ' .. audio_card .. '"'), latches.exit}})

local soundsLatch = latches.latch("Sound-Sounds", {
                  { n= "Easy", {   }, "e", utils.keyspawn("cvlc /home/jay/Downloads/Easy.ogg vlc://quit"), latches.exit}})
              
local MPDControlLatch = latches.latch("MPD Control", {
    { n="command", {}, "c", audio.MPDPrompt, latches.continue},
    { n="playlist", {}, "l", function () audio.MPDPrompt("mpc playlist ") end, latches.continue},
    { n="search", {}, "s", function () audio.MPDPrompt("mpc search ") end, latches.continue},
    { n="play", {}, "p", function () audio.MPDPrompt("mpc play ") end, latches.continue},
    { n="listall", {}, "a", function () audio.MPDPrompt("mpc listall ") end, latches.continue},
})

audio.latch = latches.latch("Sound", {
                { n="Jack", {   }, "j", jackLatch},
                { n="Programs", {   }, "p", programsLatch},
                { n="Alsa", {		}, "a", alsaLatch},
                { n="Sounds", {   }, "s", soundsLatch},
                { n="incAlsa", { modkey }, "XF86AudioRaiseVolume", audio.incAlsa, latches.continue},
                { n="decAlsa", { modkey }, "XF86AudioLowerVolume", audio.decAlsa, latches.continue},
                { n="alsaMute", { modkey }, "XF86AudioMute", utils.keyspawn("amixer -c " .. audio_card .. " set Master toggle"), latches.continue},
                { n="incMPD", { "Control" }, "XF86AudioRaiseVolume", audio.incMPD, latches.continue},
                { n="decMPD", { "Control" }, "XF86AudioLowerVolume", audio.decMPD, latches.continue},
                { n="MPD State", { "Control" }, "s", audio.reportMPDState, latches.exit},
                { n="MPDMute", { "Control" }, "XF86AudioPlay", utils.keyspawn("mpc toggle"), latches.continue},
                { n="MPDNext", { "Control" }, "XF86AudioNext", audio.MPDNext, latches.continue},
                { n="MPDPrev", { "Control" }, "XF86AudioPrev", audio.MPDPrev, latches.continue},
                { n="MPDRepeat", { "Control" }, "r", audio.MPDRandomTog, latches.continue},
                { n="MPDLoop", { "Control" }, "l", audio.MPDLoopTog, latches.continue},
                { n="MPDControl", { "Control" }, "c", MPDControlLatch, latches.continue},
                { n="incPulse", { "Mod1" }, "XF86AudioRaiseVolume", audio.incPulse, latches.continue},
                { n="decPulse", { "Mod1" }, "XF86AudioLowerVolume", audio.decPulse, latches.continue},
                { n="mutePulse", { "Mod1" }, "XF86AudioMute", audio.mutePulse, latches.continue}
            })
return audio
