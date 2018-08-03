const admin = require("firebase-admin");
const serviceAccount = require("./ServiceAccountKey.json");

const puppeteer = require('puppeteer');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://news-cf25c.firebaseio.com"
});

const db = admin.firestore();
const settings = {timestampsInSnapshots: true};
db.settings(settings);

function saveNews() {
    const data = {
        title: "This is a news ",
        author: "Daniel Alvarez"
    };
    db.collection("news").doc("news-1").set(data);
}

function saveFirebase(posts) {
    posts.forEach((post) => {
        console.log('Post: ' + post.title);
        const data = {
            title: post.title,
            url: post.url,
            summary: post.summary,
            image: post.image,
            date: new Date(post.date),
            category: post.category,
            source: post.source
        };
        db.collection('posts').doc().set(data);
    });
}

async function makeScreenShot(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, {
        timeout: 300000
    });
    await page.screenshot({path: 'screenshot.png'});
    browser.close();
}

function runScrapeLosTiempos(pagesToScrape) {
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
                console.log('************************************************** Page ' + currentPage);
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
                            source: 'lostiempos.com'
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
}

function runScrapePaginaSiete(pagesToScrape) {
    return new Promise(async (resolve, reject) => {
        try {
            if (!pagesToScrape) {
                pagesToScrape = 1;
            }
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.goto("https://www.paginasiete.bo/nacional/", {
                timeout: 300000
            });
            let currentPage = 1;
            let posts = [];
            while (currentPage <= pagesToScrape) {
                console.log('************************************************** Page ' + currentPage);
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
                                src = 'https://www.paginasiete.bo/' + img.getAttribute('src');
                            }
                        }

                        // let dateSpan = item.querySelector('span.date-display-single');

                        let categorySpan = item.querySelector('small.marcado');

                        results.push({
                            title: titleA.innerText,
                            url: 'https://www.paginasiete.bo' + titleA.getAttribute('href'),
                            summary: summary,
                            image: src,
                            date: Date.now(),
                            category: categorySpan.innerText,
                            source: 'paginasiete.bo'
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

// saveNews();
// run();
// runScrapeLosTiempos(1).then(value => {
//     console.log('Number of posts: ' + value.length);
//     console.log('Posts:');
//     console.log(value);
//     saveFirebase(value);
// }).catch(console.error);

runScrapePaginaSiete(1).then(value => {
    console.log('Number of posts: ' + value.length);
    console.log('Posts:');
    console.log(value);
    saveFirebase(value);
}).catch(console.error);

// makeScreenShot('https://www.paginasiete.bo/');