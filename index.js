require('./constants');
require('./sources/larazon');
require('./sources/lostiempos');
require('./sources/paginasiete');

const admin = require("firebase-admin");
const serviceAccount = require("./ServiceAccountKey.json");

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
        db.collection('posts').where('url', '==', data.url).get().then((snapshot) => {
            if (snapshot.empty) {
                db.collection('posts').doc().set(data);
            }
        }).catch(err => {
            console.error('Error getting posts', err);
        });
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


// saveNews();
// run();
// scrapeLosTiempos(1).then(value => {
//     console.log('Number of posts: ' + value.length);
//     console.log('Posts:');
//     console.log(value);
//     saveFirebase(value);
// }).catch(console.error);

// runScrapePaginaSiete(1).then(value => {
//     console.log('Number of posts: ' + value.length);
//     console.log('Posts:');
//     console.log(value);
//     saveFirebase(value);
// }).catch(console.error);

scrapeLaRazon(1).then(value => {
    console.log('LA RAZON');
    console.log(' Number of posts: ' + value.length);
    console.log(' Posts:');
    console.log(value);
    saveFirebase(value);
}).catch(console.error);

// makeScreenShot('https://www.paginasiete.bo/');
// makeScreenShot('http://www.la-razon.com/nacional/');