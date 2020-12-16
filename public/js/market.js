const showDisplay = async (code) => {
    $("#overlay-stock-name").text(code);
    $("#past-changes").empty();
    const stockRes = await fetch("/worth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({code}) });
    const stockJson = await stockRes.json();
    const changes = stockJson.changes;
    for (let i = 0; i < changes.length; i++) {
        let change = changes[i]
        $("#past-changes").append(`<p class="overlay-change">${change.date}: <span style="color: ${parseFloat(change.change) > 0 ? "green" : "red"};">${change.change}%</span></p>`);
    }
    $("#overlay").fadeIn(500);
}

const appendStock = (code, price, change, category) => {
    $("#market").append(`
        <div class="stock" onclick="showDisplay('${code}');">
            <h2 class="code">${code}</h2>
            <p style="color: rgba(0, 0, 0, 0.6);" class="category">${(category)}</p>
            <p class="price">$${price.toFixed(2)}</p>
            <p style="color: ${(change > 0) ? "green" : "red"}" class="change">${(change >= 0) ? "+" + change.toFixed(2) : change.toFixed(2)}%</p>
        </div>
    `)
}

var skip = 0
var limit = 15

const fetchStocks = (skipChange) => {
    skip += skipChange
    fetch(`/stocks?skip=${skip}&limit=${limit}`, {
        method: "GET"
    }).then(async (res) => {
        const json = await res.json()
        $("#market").empty()
        for (let i = 0; i < json.stocks.length; i++) {
            appendStock(json.stocks[i].code, json.stocks[i].price, json.stocks[i].change, json.stocks[i].category)
        }
        if (skip <= 0) {
            $("#prev-page").attr({"buttonDisabled": "true"})
        }
        if (!json.hasMore) {
            $("#next-page").attr({"buttonDisabled": "true"})
        }
    })
}

window.onload = () => {
    fetchStocks(0)
    $("#prev-page").click(() => {
        if ($("#prev-page").attr("buttonDisabled") == "true") {
            return
        }
        $("#next-page").attr({"buttonDisabled": "false"})
        fetchStocks(-15)
    })
    $("#next-page").click(() => {
        if ($("#next-page").attr("buttonDisabled") == "true") {
            return
        }
        $("#prev-page").attr({"buttonDisabled": "false"})
        fetchStocks(15)
    })
}