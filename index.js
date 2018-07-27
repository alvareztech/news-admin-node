const admin = require("firebase-admin");
const serviceAccount = require("./ServiceAccountKey.json");

const puppeteer = require('puppeteer');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://news-cf25c.firebaseio.com"
});

const db = admin.firestore();

function saveNews() {
    const data = {
        title: "This is a news ",
        author: "Daniel Alvarez"
    };
    db.collection("news").doc("news-1").set(data);
}

saveNews();

const url = "https://alvarez.tech";
if (!url) {
    throw "Please provide a URL as the first argument";
}

async function run () {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    await page.screenshot({path: 'screenshot.png'});
    browser.close();
}
run();
