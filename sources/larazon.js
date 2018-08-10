const puppeteer = require('puppeteer');

const homeURL = 'http://www.la-razon.com';
const category = 'nacional';
const categoryURL = homeURL + '/' + category + '/';
const sourceKey = 'larazoncom';
const categoryKey = 'bolivia';

global.scrapeLaRazon = function (pagesToScrape) {

    console.log('Scraping La Razon...');

    return new Promise(async (resolve, reject) => {
        try {
            if (!pagesToScrape) {
                pagesToScrape = 1;
            }
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.goto(categoryURL, {
                timeout: 300000
            });
            let currentPage = 1;
            let posts = [];

            while (currentPage <= pagesToScrape) {
                console.log(' Page: ' + currentPage);
                let newPosts = await page.evaluate((homeURL, categoryURL, sourceKey, categoryKey) => {
                    let results = [];
                    let items = document.querySelectorAll('div.md-news');
                    items.forEach((item) => {
                        let titleH2 = item.querySelector('h2.headline');
                        let titleA = titleH2.querySelector('a');
                        let title = titleA.innerText;

                        let link = titleA.getAttribute('href');

                        let summary = null;
                        let summaryContainer = item.querySelector('p.teaser');
                        if (summaryContainer) {
                            summary = summaryContainer.innerText;
                        }

                        let img = item.querySelector('img');
                        let image = null;
                        if (img) {
                            image = homeURL + img.getAttribute('src');
                            let index = image.lastIndexOf('_');
                            image = image.substring(0, index) + '_3.jpg';
                        }

                        // let dateSpan = item.querySelector('span.date-display-single');

                        let categorySpan = item.querySelector('small.marcado');

                        results.push({
                            title: title,
                            url: homeURL + link,
                            summary: summary,
                            image: image,
                            date: Date.now(),
                            category: categoryKey,
                            source: sourceKey
                        });
                    });
                    return results;
                });

                posts = posts.concat(newPosts);
                if (currentPage < pagesToScrape) {
                    await Promise.all([
                        // await page.click('a.morelink'),
                        await page.goto(categoryURL + '?page=' + currentPage),
                        await page.waitForSelector('div.md-news')
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