window.onload = async () => {
    const allNewsRes = await fetch("/get-news", { method: "POST" })
    const allNewsJSON = await allNewsRes.json()
    const allNews = allNewsJSON.news
    for (let i = 0; i < allNews.length; i++) {
        let article = allNews[i]
        $("#news").append(`
        <div class="article">
            <h3 class="title">${article.title}</h3>
            <p class="date">${article.date}</p>
            <p class="description">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
        </div>`)
    }
}