#! /app/.heroku/node/bin/node
const linebot = require('linebot');
const mongoose = require('mongoose');

const areas = ['1', '2', '20000200', '20000201', '50003000', '50003001', '7', '8', '9', '10', '11'];
const areasChinese = ['基隆市', '臺北市', '新北市', '新北市烏來區', '桃園市', '桃園市復興區', '新竹市', '新竹縣', '新竹縣關西鎮', '新竹縣五峰鄉', '新竹縣尖石鄉'];
const keywords = ['車道', '球場', '車場', '操場', '路口', '門口', '廣場', '路面', '道路', '柏油', '瀝青', '刨除', '停車', '農路', 'AC', '加封', '鋪面', '鋪設', '舖設', '舖面', '地坪', '面層', '整平'];

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

var NewHsinchu = mongoose.model("NewHsinchu", DataSchema);

NewHsinchu.find({}).exec(function(err, result) {
    if (!err) {
        var allStr = '',
            count = 0,
            notify = [];
        var bot = linebot({
            channelId: '1492276753',
            channelSecret: '119925bcb705cd8dba97d12dee6adcfe',
            channelAccessToken: 'szRm+qYMp2AGfYM7moTZ0KajszBAq2Bi/tBFpBfIh1l4fL+W/YZOCbD1oCnxSdsuBfFyJAZwwQoFNWnXsZS934axxx1ZPxsJ8Oay98c0fDnVMV92MuXvHRKRvwDVT6DbTFAurOFXGvjZiwzCWHvqSwdB04t89/1O/w1cDnyilFU='
        });
        for (var index in result) {
            var ans = result[index];
            for (var i = 0; i < keywords.length; i++) {
                if (ans.name.search(keywords[i]) > 0) {
                    if (allStr.length > 1500) {
                        notify.push(allStr);
                        allStr = '';
                    }
                    count++;
                    
                    allStr += count + '、' + ans.district + '\n\n';
                    allStr += ans.name + '\n\n';
                    allStr += '公告：' + ans.announcement + '\n';
                    allStr += '截止：' + ans.deadline + '\n';
                    allStr += '預算：' + ans.budget + '\n\n';
 					//allStr += '網址：' + ans.site + '\n\n';
                    allStr += '===== [' + count + ']\n\n';
                    break;
                }
            }
        }
        allStr += '地區:' + areasChinese[6] + '\n' + '共有【' + count + '】筆資料';
        notify.push(allStr);
        //console.log(notify);
        bot.push('U82bea0bcb7adb69108a9bc2a95ae6d42', notify); //我
        bot.push('Uefe53beb16bffe0519a5798dda943aa8', notify); //mother
        mongoose.connection.close();
    } else {
        // error handling
    };
});

var db = mongoose.connection;
mongoose.connect('mongodb://nick:nick@ds121999.mlab.com:21999/gov');
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {
    console.log("Database Connected.");
});