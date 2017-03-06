#! /app/.heroku/node/bin/node
var request = require("request");
var querystring = require('querystring');
var cheerio = require("cheerio");
var fs = require("fs");
var shorturl = require('google-url');

googleUrl = new shorturl({ key: 'AIzaSyB8hZzhsPOgQF_BNWGgMgLqob90TKf4uJ0' });

const LineBot = require('@3846masa/linebot/lib/LineBot').LineBot;

const TextMessage = require('@3846masa/linebot/lib/LineMessages').TextMessage;



const bot = new LineBot({

    channelSecret: '119925bcb705cd8dba97d12dee6adcfe',

    channelToken: 'szRm+qYMp2AGfYM7moTZ0KajszBAq2Bi/tBFpBfIh1l4fL+W/YZOCbD1oCnxSdsuBfFyJAZwwQoFNWnXsZS934axxx1ZPxsJ8Oay98c0fDnVMV92MuXvHRKRvwDVT6DbTFAurOFXGvjZiwzCWHvqSwdB04t89/1O/w1cDnyilFU=',

});





var areas = ['1', '2', '20000200', '20000201', '50003000', '50003001', '7', '8', '9', '10', '11'];

var areasChinese = ['苗栗', '台中', '臺中', '彰化', '雲林', '嘉義', '臺南', '台南', '南投', '高雄', '屏東', '澎湖', '金門', '宜蘭', '花蓮', '台東', '臺東', '第二區', '第三區', '第四區', '第五區', '第六區', '第七區', '第八區', '第九區', '第十區', '第十一區'];

var keywords = ['道路', '路面', '柏油', '瀝青', '刨除', '停車', '農路', 'AC', '加封', '鋪面', '舖面'];

if (fs.existsSync("result.txt")) {

    fs.unlink("result.txt");

}


request({

    url: "http://web.pcc.gov.tw/pishtml/todaytender.html",

    headers: {
        'content-type': 'application/x-www-form-urlencoded'
    },



    method: "POST"

}, function(error, response, body) {

    if (error || !body) {

        return;

    }

    // 爬完網頁後要做的事情





    var $ = cheerio.load(body);



    var GovNames = $("br+ table td:nth-child(2) font"); //機關名稱

    var CaseNames = $("br+ table td:nth-child(3) font"); //標 案 名 稱

    var DateLines = $("br+ table td:nth-child(5) font"); //截 止 投 標

    var Links = $("br+ table td:nth-child(4) a"); //連結





    var doOnce = function(i, gl, kl, al) {


        googleUrl.shorten("http://web.pcc.gov.tw" + Links.eq(i).attr('href'), function(err, shortUrl) {
            var reapeat = true;
            var reapeat2 = true;

            for (var y = 0; y < al; y++) {
                if (GovNames.eq(i).text().search(areasChinese[y]) >= 0 || CaseNames.eq(i).text().search(areasChinese[y]) >= 0)
                    reapeat2 = false;
            }
            for (var x = 0; x < kl; x++)
                if (CaseNames.eq(i).text().search(keywords[x]) >= 0 && reapeat && reapeat2) {
                    reapeat = false;
                    var allStr = '';

                    allStr += GovNames.eq(i).text() + '\n\n';

                    allStr += CaseNames.eq(i).text() + '\n\n';

                    allStr += '截止：' + DateLines.eq(i).text() + '\n\n';

                    allStr += '網址：' + shortUrl + '\n\n';

                    allStr += '關鍵字：' + keywords[x];

                    console.log(allStr);
                    const message = new TextMessage({
                        text: allStr,
                    });
                    bot.push('U82bea0bcb7adb69108a9bc2a95ae6d42', message); //我
                    bot.push('Uefe53beb16bffe0519a5798dda943aa8', message); //媽
                    bot.push('U87a28584b8d0f7c235a9eb304165a7e2', message); //秋亭
                    fs.appendFile("result.txt", allStr);
                }



            if (i < gl)
                setTimeout(function() { doOnce(i + 1, gl, kl, al) }, 100);

        });



    }
    doOnce(0, GovNames.length, keywords.length, areasChinese.length);




    //bot.push('U82bea0bcb7adb69108a9bc2a95ae6d42', message); //我

    //bot.push('Uefe53beb16bffe0519a5798dda943aa8', message); //媽





});
