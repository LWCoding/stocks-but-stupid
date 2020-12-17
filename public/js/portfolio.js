const updateNotice = () => {
    fetch("/worth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({code: $("#stock-name").text()})
    }).then(async (res) => {
        const json = await res.json()
        const stockRes = await fetch("/retrieve", {
            method: "POST"
        })
        const stockJson = await stockRes.json()
        let i = 0, found = false
        if (stockJson.stocks.length === 0) {
            if (json.exists) {
                $("#notice").css("color", "green").html("Buy Price: $" + (json.price * (parseInt($("#stock-amount").val()) || 1)).toFixed(2) + ". (You have $" + stockJson.balance.toFixed(2) + ".)").show()
                $("#stock-sell").css("opacity", 0.3)
            }
        }
        stockJson.stocks.forEach((stock) => {
            if (stock.stockCode == $("#stock-name").text()) {
                $("#stock-sell").css("opacity", 1)
                $("#notice").css("color", "green").html("Buy Price: $" + (json.price * (parseInt($("#stock-amount").val()) || 1)).toFixed(2) + ". (You have $" + stockJson.balance.toFixed(2) + ".)<br>Selling will gain you: $" + ((json.price - stock.stockInitial) * ((($("#stock-amount").val() || 1) > stock.stockCount) ? stock.stockCount : parseInt($("#stock-amount").val() || 1))).toFixed(2) + ".<br>(You have " + stock.stockCount + " of that stock.)").show()
                found = true
            }
            i += 1
            if (!found && i == stockJson.stocks.length) {
                if (json.exists) {
                    $("#notice").css("color", "green").html("Buy Price: $" + (json.price * (parseInt($("#stock-amount").val()) || 1)).toFixed(2) + ". (You have $" + stockJson.balance.toFixed(2) + ".)").show()
                    $("#stock-sell").css("opacity", 0.3)
                }
            }
        })
    })
}

const fetchStocks = () => {
    $("#all-stocks").empty()
    fetch("/retrieve", {
        method: "POST"
    }).then(async (res) => {
        const json = await res.json()
        if (json.stocks.length === 0) {
            $("#all-stocks").append("<h2 style='font-size: 26px;'>You currently don't own any stocks!</h2>")
        }
        for (let i = 0; i < json.stocks.length; i++) {
            let stock = json.stocks[i]
            const currentPriceRes = await fetch("/worth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({code: stock.stockCode})
            })
            const currentPrice = await currentPriceRes.json()
            $("#all-stocks").append(`<p style="font-size: 22px;">${stock.stockCode} x${stock.stockCount}<p style="font-size: 18px;">(Bought at $${stock.stockInitial.toFixed(2)})</p><p style="font-size: 18px;">(Currently $${currentPrice.price.toFixed(2)})</p><div style="height: 0.5em;">`)
        }
    })
}

const updateBalance = async () => {
    const userRes = await fetch("/retrieve", {
        method: "POST"
    })
    const userJson = await userRes.json()
    const worthRes = await fetch("/user-worth", {
        method: "POST"
    })
    const worthJson = await worthRes.json()
    for(let i = 0; i < 101; i++) {
        setTimeout(() => {
            $("#balance-amount").text((userJson.balance) >= 0 ? "$" + (userJson.balance * (i / 100)).toFixed(2) : "-$" + Math.abs((userJson.balance * (i / 100)).toFixed(2)))
        }, i * 10)
    }
    for(let i = 0; i < 101; i++) {
        setTimeout(() => {
            $("#worth-amount").text((worthJson.worth >= 0) ? "$" + (worthJson.worth * (i / 100)).toFixed(2) : "-$" + (Math.abs(worthJson.worth * (i / 100)).toFixed(2)))
        }, i * 10)
    }
    if (parseFloat(userJson.balance) > 0) {
        $("#balance-amount").css("color", "green")
    } else {
        $("#balance-amount").css("color", "red")
    }
    if (parseFloat(worthJson.worth) > 0 && parseFloat(worthJson.worth) >= parseFloat(userJson.balance)) {
        $("#worth-amount").css("color", "green")
    } else {
        $("#worth-amount").css("color", "red")
    }
}

window.onload = () => {
    fetchStocks()
    $("#stock-amount").on("input", () => {
        if ($("#stock-amount").val() === "") {
            $("#stock-sell").css("opacity", 0.3)
        }
        updateNotice()
    })
    $("#stock-code").on("input", () => {
        if ($("#stock-code").val().length === 0) {
            $("#stock-name").text("N/A")
            $("#stock-info").hide()
            return
        }
        if ($("#stock-code").val().length > 4) {
            $("#stock-code").val($("#stock-code").val().substr(0,4))
        }
        $("#stock-name").text($("#stock-code").val().toUpperCase())
        if ($("#stock-code").val().length === 4) {
            updateNotice()
            fetch("/worth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({code: $("#stock-name").text()})
            }).then(async (res) => {
                const json = await res.json()
                if (json.exists) {
                    $("#stock-buy").css("opacity", 1)
                    $("#stock-info").show()
                    $("#stock-price").text("$" + json.price.toFixed(2))
                    $("#stock-change").text(((json.change > 0) ? "+" : "") + json.change.toFixed(2) + "%")
                    $("#stock-category").text(json.category)
                    if (json.change > 0) {
                        $("#stock-change").css("color", "green")
                    } else {
                        $("#stock-change").css("color", "red")
                    }
                } else {
                    $("#stock-info").hide()
                    $("#notice").css("color", "red").text("Specified stock does not exist.").show()
                    $("#stock-buy").css("opacity", 0.3)
                }
            })
        } else {
            $("#stock-info").hide()
            $("#notice").css("color", "red").text("Specified stock does not exist.").hide()
            $("#stock-buy").css("opacity", 0.3)
        }
    })
    $("#stock-buy").click(() => {
        fetch("/purchase-stock", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                code: $("#stock-name").text(), 
                count: $("#stock-amount").val()
            })
        }).then(async (res) => {
            if (res.ok) {
                $("#stock-sell").css("opacity", 0.3)
                $("#stock-buy").css("opacity", 0.3)
                fetchStocks()
                updateBalance()
                $("#notice").css("color", "green").text("Successfully purchased " + $("#stock-amount").val() + " of " + $("#stock-name").text() + "!").show()
                $("#stock-amount").val("")
                $("#stock-code").val("")
            } else {
                const json = await res.json()
                $("#notice").css("color", "red").text(json.error).show()
            }
        })
    })
    $("#stock-sell").click(async () => {
        fetch("/sell-stock", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                code: $("#stock-name").text(), 
                count: $("#stock-amount").val()
            })
        }).then(async (res) => {
            if (res.ok) {
                $("#stock-sell").css("opacity", 0.3)
                $("#stock-buy").css("opacity", 0.3)
                fetchStocks()
                updateBalance()
                $("#notice").css("color", "green").text("Successfully sold " + $("#stock-amount").val() + " of " + $("#stock-name").text() + "!").show()
                $("#stock-amount").val("")
                $("#stock-code").val("")
            } else {
                const json = await res.json()
                $("#notice").css("color", "red").text(json.error).show()
            }
        })
    })
    updateBalance()
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