#! /app/bin/node
const linebot = require('linebot');
const express = require('express');
const rp = require('request-promise');
const bodyParser = require('body-parser');
const querystring = require('querystring');
const cheerio = require("cheerio");
var mongoose = require('mongoose');

const areas = ['1', '2', '20000200', '20000201', '50003000', '50003001', '7', '8', '9', '10', '11'];
const areasChinese = ['基隆市', '臺北市', '新北市', '新北市烏來區', '桃園市', '桃園市復興區', '新竹市', '新竹縣', '新竹縣關西鎮', '新竹縣五峰鄉', '新竹縣尖石鄉'];
const keywords = ['路', '道路', '柏油', '瀝青', '刨除', '停車', '農路', 'AC', '加封', '鋪面', '舖面'];

const Form = {
    method: 'search',
    searchMethod: 'true',
    searchTarget: 'TPAM',
    //tenderName:keywords[0],
    isSpdt: 'Y', //期間
    pageIndex: '1',
    location: areas[2],
};

const options = {
    method: "POST",
    uri: "https://web.pcc.gov.tw/tps/pss/tender.do?searchMode=common&searchType=advance",
    body: querystring.stringify(Form),
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
};

var Schema = mongoose.Schema;

var DataSchema = new Schema({
    id: String,
    district: String,
    name: String,
    announcement: String,
    deadline: String,
    budget: String,
    site: String,

});

var NewTaipei = mongoose.model("NewTaipei", DataSchema);
NewTaipei.collection.drop();
var index = 1;


function readGOVdata(repos, searchkeyword, index) {
    var allStr = '';
    var $ = cheerio.load(repos);

    var cases = $("#print_area tr");
    var infoCount = $("span.T11b");
    var pages = (Math.floor(infoCount.text() / 100)) + 1; //搜尋總頁數

    if (index == pages) {
        for (var i = 1; i <= (infoCount.text() % 100); i++) {

            var obj = new NewTaipei({
                id: ((index - 1) * 100 + i),
                district: cases.eq(i).find("td").eq(1).text().trim(),
                name: cases.eq(i).find("td").eq(2).find("u").text().trim(),
                announcement: cases.eq(i).find("td").eq(6).text().trim(),
                deadline: cases.eq(i).find("td").eq(7).text().trim(),
                budget: cases.eq(i).find("td").eq(8).text().trim(),
                site: 'http://web.pcc.gov.tw/tps' + ($("#print_area tr").eq(i).find("td br+ a").attr('href')).slice(2),
            });
            obj.save(function(error) {
                //console.log("Your bee has been saved!");
                if (error) {
                    console.error(error);
                }
            });
            if(i == (infoCount.text()%100))
            {setTimeout(shout,10000);}
        }
    }

    if (index < pages) {

        for (var i = 1; i <= 100; i++) {
            //console.log( ((index-1)*100+i) + '、' + cases.eq(i).find("td").eq(1).text().trim() + '\n\n');
            //console.log ( cases.eq(i).find("td").eq(2).find("u").text().trim() + '\n\n');
            //allStr += '公告: ' + cases.eq(i).find("td").eq(6).text().trim() + '\n';
            //allStr += '截止: ' + cases.eq(i).find("td").eq(7).text().trim()+ '\n';
            //allStr += '預算: ' + cases.eq(i).find("td").eq(8).text().trim() + '\n\n';
            //allStr += '網址: http://web.pcc.gov.tw/tps' + ($("#print_area tr").eq(i).find("td br+ a").attr('href')).slice(2) + '\n\n';
            //allStr += '===== [' + i + ']\n\n';
            var obj = new NewTaipei({
                id: ((index - 1) * 100 + i),
                district: cases.eq(i).find("td").eq(1).text().trim(),
                name: cases.eq(i).find("td").eq(2).find("u").text().trim(),
                announcement: cases.eq(i).find("td").eq(6).text().trim(),
                deadline: cases.eq(i).find("td").eq(7).text().trim(),
                budget: cases.eq(i).find("td").eq(8).text().trim(),
                site: 'http://web.pcc.gov.tw/tps' + ($("#print_area tr").eq(i).find("td br+ a").attr('href')).slice(2),
            });
            obj.save(function(error) {
                //console.log("Your bee has been saved!");
                if (error) {
                    console.error(error);
                }
            });
        }

        Form.pageIndex = ++index;
        options.body = querystring.stringify(Form);
        rp(options)
            .then(function(repos) {
                readGOVdata(repos, keywords[0], index);
            })
        //console.log('共有'+ (cases.length - 2)  +'筆資料')
        //allStr += '關鍵字: ' + searchkeyword + '\n' + '地區: ' + '全省' + '\n' + '共有【' + infoCount.text() + '】筆資料' ; 
        //console.log(allStr);		
    }

}

function shout(){
    mongoose.connection.close();
}

options.body = querystring.stringify(Form);
rp(options)
    .then(function(repos) {
        readGOVdata(repos, keywords[0], index);
    })


var db = mongoose.connection;
mongoose.connect('mongodb://nick:nick@ds121999.mlab.com:21999/gov');
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {
    console.log("Database Connected.");
});