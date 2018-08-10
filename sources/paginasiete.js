const puppeteer = require('puppeteer');

global.scrapePaginaSiete = function (pagesToScrape) {

    console.log('Scraping Pagina Siete...');

    return new Promise(async (resolve, reject) => {
        try {
            if (!pagesToScrape) {
                pagesToScrape = 1;
            }
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.goto(PaginaSieteNacionalURL, {
                timeout: 300000
            });
            let currentPage = 1;
            let posts = [];
            while (currentPage <= pagesToScrape) {
                console.log(' Page: ' + currentPage);
                let newPosts = await page.evaluate(() => {
                    let results = [];
                    let items = document.querySelectorAll('article');
                    items.forEach((item) => {
                        let titleDiv = item.querySelector('h2.titulo');
                        let titleA = titleDiv.querySelector('a');

                        let summary = null;
                        let summaryContainer = item.querySelector('p.resumen');
                        if (summaryContainer) {
                            summary = summaryContainer.innerText;
                        }

                        let picture = item.querySelector('picture');
                        let src = null;
                        if (picture) {
                            let img = picture.querySelector('img');
                            if (img) {
                                src = PaginaSieteURL + img.getAttribute('src');
                            }
                        }

                        // let dateSpan = item.querySelector('span.date-display-single');

                        let categorySpan = item.querySelector('small.marcado');

                        results.push({
                            title: titleA.innerText,
                            url: PaginaSieteURL + titleA.getAttribute('href'),
                            summary: summary,
                            image: src,
                            date: Date.now(),
                            category: categorySpan.innerText,
                            source: PaginaSieteSource
                        });
                    });
                    return results;
                });

                posts = posts.concat(newPosts);
                // if (currentPage < pagesToScrape) {
                //     await Promise.all([
                //         // await page.click('a.morelink'),
                //         await page.goto('http://www.lostiempos.com/ultimas-noticias?page=' + currentPage),
                //         await page.waitForSelector('div.term-0')
                //     ])
                // }
                currentPage++;

            }
            browser.close();
            return resolve(posts);
        } catch (e) {
            return reject(e);
        }
    })
}