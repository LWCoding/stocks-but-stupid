window.onload = async () => {
    const winnerRes = await fetch("/richest", {method: "POST"})
    const winner = await winnerRes.json()
    $("#first").animate({
        opacity: 1
    }, 500)
    $("#second").delay(250).animate({
        opacity: 1
    }, 500)
    $("#third").delay(500).animate({
        opacity: 1
    }, 500)
    $("#winner").text(winner.length > 0 ? winner[0].username : "Nobody")
    $("#winner-cash").text(winner.length > 0 ? winner[0].balance : "N/A")
    $("#second-place").text(winner.length > 1 ? winner[1].username : "Nobody")
    $("#second-place-cash").text(winner.length > 1 ? winner[1].balance : "N/A")
    $("#third-place").text(winner.length > 2 ? winner[2].username : "Nobody")
    $("#third-place-cash").text(winner.length > 2 ? winner[2].balance : "N/A")
}