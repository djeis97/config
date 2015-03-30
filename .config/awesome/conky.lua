function get_conky()
    local clients = client.get()
    local conky = nil
    local i = 1
    while clients[i]
    do
        if clients[i].class == "Conky"
        then
            conky = clients[i]
        end
        i = i + 1
    end
    return conky
end

function raise_conky()
    local conky = get_conky()
    if conky
    then
        conky.ontop=true
        conky:raise()
        conky:raise()
    end
end
function lower_conky()
    local conky = get_conky()
    if conky
    then
        conky.ontop=false
        conky:lower()
        conky:lower()
    end
end
function toggle_conky()
    local conky = get_conky()
    if conky
    then
        if conky.ontop
        then
            lower_conky()
        else
            raise_conky()
        end
    end
end


return {get=get_conky, raise=raise_conky, lower=lower_conky, toggle=toggle_conky}