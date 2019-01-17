var fs = require('fs');
var _ = require("lodash");
var request = require("request");
var webdriver = require('selenium-webdriver'), By = webdriver.By, until = webdriver.until;
var driver = new webdriver.Builder().forBrowser('chrome').build();

var newsUrl = "https://news.naver.com/main/hotissue/sectionList.nhn?mid=hot&sid1=&cid=";
var newsListDB = [
    {title:"홍기자 쏘왓",cid:"1083570"},
    {title:"홍길용의 화식열전",cid:"1042886"},
    {title:"투자의창",cid:"1073596"},
    {title:"안재만의 투자노트",cid:"1073588"},
    {title:"증시 맥짚기",cid:"1073586"}
];

var NEWS = [];
function getData(page){
    if(page<newsListDB.length){
        var url = newsUrl+newsListDB[page].cid;
        driver.get(url);
        driver.sleep(1000);
        driver.executeScript(function() {
            var scriptElt = document.createElement('script');
            scriptElt.type = 'text/javascript';
            scriptElt.src = "https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js";
            document.getElementsByTagName('head')[0].appendChild(scriptElt);
        });
        driver.sleep(1000);
        driver.wait(function() {
            return driver.executeScript(function () {
                var DB = [];
                $(".hissue_cnt .cnt").each(function(){
                    DB.push({
                        title:$(this).find(" dt a").text(),
                        link:$(this).find(" dt a").attr("href"),
                        date:$(this).find(" .s em").text()
                    });
                });
                return DB;
            });
        }).then(function (sdata) {
            _.each(sdata,function(news){
                news.title = news.title.replace(/\[.+\]/gi,"");
                news.title = $.trim(news.title);
                news.title = "["+newsListDB[page].title +"] "+ news.title;
                NEWS.push(news);
            });
            getData(page+1);
        });
    }else{
        fs.writeFileSync("./news.json",JSON.stringify(NEWS) );
        driver.quit();
    };
};
getData(0);
