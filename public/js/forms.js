$("#register-submit").click((e) => {
    e.preventDefault()
    fetch("/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            username: $("#username").val(), 
            password: $("#password").val(), 
            reenter: $("#reenter").val()
        })
    }).then(async (res) => {
        if (!res.ok) {
            const json = await res.json()
            $("#error").text(json.error || "An unknown error occurred.").stop(0).fadeIn(500).delay(2000).fadeOut(500)
        } else {
            window.location.href = "/portfolio"
        }
    })
})

$("#login-submit").click((e) => {
    e.preventDefault()
    fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            username: $("#username").val(), 
            password: $("#password").val(),
        })
    }).then(async (res) => {
        if (!res.ok) {
            const json = await res.json()
            $("#error").text(json.error || "An unknown error occurred.").stop(0).fadeIn(500).delay(2000).fadeOut(500)
        } else {
            window.location.href = "/portfolio"
        }
    })
})