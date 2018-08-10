const puppeteer = require('puppeteer');

const homeURL = 'http://www.lostiempos.com';
const sourceKey = 'larazoncom';
const categoryKey = 'bolivia';

global.scrapeLosTiempos = function (pagesToScrape) {

    console.log('Scraping Los Tiempos...');

    return new Promise(async (resolve, reject) => {
        try {
            if (!pagesToScrape) {
                pagesToScrape = 1;
            }
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.goto("http://www.lostiempos.com/ultimas-noticias");
            let currentPage = 1;
            let posts = [];
            while (currentPage <= pagesToScrape) {
                console.log(' Page: ' + currentPage);
                let newPosts = await page.evaluate(() => {
                    let results = [];
                    let items = document.querySelectorAll('div.term-0');
                    items.forEach((item) => {
                        let titleDiv = item.querySelector('div.views-field-title');
                        let titleA = titleDiv.querySelector('a');

                        let summaryDiv = item.querySelector('div.views-field-field-noticia-sumario');
                        let summary = summaryDiv.querySelector('span.field-content');

                        let img = item.querySelector('img');

                        let dateSpan = item.querySelector('span.date-display-single');

                        let categorySpan = item.querySelector('span.views-field-seccion');

                        let image = "";
                        if (img) {
                            image = img.getAttribute('src');
                        }

                        results.push({
                            title: titleA.innerText,
                            url: 'http://www.lostiempos.com' + titleA.getAttribute('href'),
                            summary: summary.innerText,
                            image: image,
                            date: dateSpan.getAttribute('content'),
                            category: categorySpan.innerText,
                            source: LosTiemposSource
                        });
                    });
                    return results;
                });

                posts = posts.concat(newPosts);
                if (currentPage < pagesToScrape) {
                    await Promise.all([
                        // await page.click('a.morelink'),
                        await page.goto('http://www.lostiempos.com/ultimas-noticias?page=' + currentPage),
                        await page.waitForSelector('div.term-0')
                    ])
                }
                currentPage++;

            }
            browser.close();
            return resolve(posts);
        } catch (e) {
            return reject(e);
        }
    })
};