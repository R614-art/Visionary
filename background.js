
const oneWeekInMilliseconds = 1000 * 60 * 60 * 24 * 7;
const oneWeekAgo = Date.now() - oneWeekInMilliseconds;
let history={};
let predictedUrl="";
const notiId="prediction";
const analyzeHistoryAndNotify= () =>{
    console.log("Analyzing history and notifying...");
    chrome.history.search({
    text: '',
    startTime: oneWeekAgo,
    maxResults: 1000
    }, function(results) {
    results.forEach((page) => {
        let url=getURL(page.url);
        if(!history[url])
            history[url]=[];
        history[url].push(new Date(page.lastVisitTime));
    });
    analyzeHistory(history);
    });
}
const getURL = (url) =>{
    const domain=new URL(url).hostname;
    return domain;
}
const analyzeHistory = (history) =>{
    const filteredURLs = {};
    const hour=new Date().getHours();
    Object.keys(history).forEach(url => {
        let accessTimes = history[url];
        let count=0;
        for(let i=0;i<accessTimes.length;i++)
        {
            if(accessTimes[i].getHours()===hour)
                count++;
        }
        filteredURLs[url]=count;
    })
    predictUrl(filteredURLs);
}

const predictUrl = (filteredURLs) => {
    let prediction="";
    let maxFreq=0;
    Object.keys(filteredURLs).forEach(url=>{
        let currFreq=filteredURLs[url];
        if(currFreq>maxFreq)
        {
            maxFreq=currFreq;
            prediction=url;
        }
    })
    if(maxFreq!=0)
        notify(prediction);
}

const notify = (url) => {
    predictedUrl=url;
    chrome.notifications.create(notiId,{
        type:'basic',
        iconUrl:chrome.runtime.getURL('128.png'),
        title:'Visionary',
        message:`You often visit ${url} at this time. Do you want to open it?`,
        buttons:[
            {
                title:'Open'
            },
            {
                title:'Dismiss'
            }
        ],
        priority:2
    })
}

chrome.runtime.onStartup.addListener(function(){
    analyzeHistoryAndNotify();
})

chrome.notifications.onButtonClicked.addListener(function(id,buttonIndex){
    if(buttonIndex===0)
    {
        chrome.tabs.create({
            url:"https://"+predictedUrl
        })
    }
    chrome.notifications.clear(notiId);
})
  