window.onload = () => {
    fetch("/retrieve", { method: "POST" }).then(async (res) => {
        const json = await res.json()
        $("#balance-amount").text((json.balance) >= 0 ? "$" + json.balance : "-$" + Math.abs(json.balance))
        $("#worth-amount").text((json.balance) >= 0 ? "$" + json.balance : "-$" + Math.abs(json.balance))
        if (parseInt(json.balance) > 0) {
            $("#balance-amount").css("color", "green")
        } else {
            $("#balance-amount").css("color", "red")
        }
        if (parseInt(json.worth) > 0) {
            $("#worth-amount").css("color", "green")
        } else {
            $("#worth-amount").css("color", "red")
        }
    })
    $(".bone").css("opacity", 1)
    $(".done").show()
    $(".bone").click(() => {
        $(".btwo").css("opacity", 0.5)
        $(".bthree").css("opacity", 0.5)
        $(".bone").css("opacity", 1)
        $(".done").show()
        $(".dtwo").hide()
        $(".dthree").hide()
    })
    $(".btwo").click(() => {
        $(".bone").css("opacity", 0.5)
        $(".bthree").css("opacity", 0.5)
        $(".btwo").css("opacity", 1)
        $(".done").hide()
        $(".dtwo").show()
        $(".dthree").hide()
    })
    $(".bthree").click(() => {
        $(".bone").css("opacity", 0.5)
        $(".btwo").css("opacity", 0.5)
        $(".bthree").css("opacity", 1)
        $(".done").hide()
        $(".dtwo").hide()
        $(".dthree").show()
    })
}