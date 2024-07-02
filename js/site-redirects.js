const URLs = [
    {
        Old: "/games/",
        New: "/places/"
    },

    {
        Old: "/shop/",
        New: "/store/"
    },

    {
        Old: "/my/referrals",
        New: "/my/settings/referrals"
    },

    {
        Old: "/create/?t=",
        New: "/create/"
    },

    {
        Old: "/user/",
        New: "/users/"
    },

    {
        Old: "/library/",
        New: "/models/"
    }
]

let Matches = URLs.filter((x) => window.location.pathname.startsWith(x.Old))
if (Matches.length > 0) {
    let Match = Matches[0]
    window.location.pathname = window.location.pathname.replace(Match.Old, Match.New)
}