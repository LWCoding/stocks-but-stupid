window.onload = async () => {
    const userRes = await fetch("/retrieve", {method: "POST"})
    const user = await userRes.json()
    $("#username").text(user.username || "Not found")
    $("#total-stocks").text(user.totalStocks || 0)
    $("#highest-money").text(("$" + user.highestMoney) || 0)
    $("#highest-worth").text(("$" + user.highestWorth) || 0)
}