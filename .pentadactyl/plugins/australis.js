group.options.add(["australis-gui", "agi"],
    "Turn on the australis gui settings",
    "boolean",
    false,
    {
        setter: function (value) {
			document.getElementById("main-window").setAttribute("dactyl-australis", value);
			return value;
        }
    }
);

