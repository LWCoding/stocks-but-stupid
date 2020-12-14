window.onload = () => {
    fetch("/retrieve", { method: "POST" }).then(async (res) => {
        const json = await res.json()
        let worth = json.balance
        for (let i = 0; i < json.stocks.length; i++) {
            let stock = json.stocks[i]
            fetch("/worth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({code: stock.stockCode})
            }).then(async (res) => {
                const stockJson = await res.json()
                worth += (stockJson.price - stock.stockInitial) * stock.stockCount
                i += 1
                if (i == json.stocks.length) {
                    for(let i = 0; i < 101; i++) {
                        setTimeout(() => {
                            $("#balance-amount").text((json.balance) >= 0 ? "$" + (json.balance * (i / 100)).toFixed(2) : "-$" + Math.abs((json.balance * (i / 100)).toFixed(2)))
                        }, i * 10)
                    }
                    for(let i = 0; i < 101; i++) {
                        setTimeout(() => {
                            $("#worth-amount").text((worth >= 0) ? "$" + (worth * (i / 100)).toFixed(2) : "-$" + (Math.abs(worth * (i / 100)).toFixed(2)))
                        }, i * 10)
                    }
                    if (parseInt(json.balance) > 0) {
                        $("#balance-amount").css("color", "green")
                    } else {
                        $("#balance-amount").css("color", "red")
                    }
                    if (parseInt(worth) >= parseInt(json.balance)) {
                        $("#worth-amount").css("color", "green")
                    } else {
                        $("#worth-amount").css("color", "red")
                    }
                }
            })
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