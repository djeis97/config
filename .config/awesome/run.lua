local function voidMap (func, list)
    for x in list do
        func(unpack(x))
    end
end

-- Run


-- Run once

utils.run_once("conky")
