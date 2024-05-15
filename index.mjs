import puppeteer from 'puppeteer';
import fs from 'node:fs';
import path from 'node:path';
// DATA TO SCRAP AND SHOW : Scrape data of last 5 seasons for
// Top 10 players who deserves orange cap in each season with their runs
// Top 10 players who hit most 4's in each season
// Top 10 players who hit most 6's in each season
// Top 10 players who hit most centuries in each season
// Top 10 players who hit most 50's in each season
let scrapedData = {};

function consoleLogFile(data){
  return new Promise((resolve, rejected)=>{
    data = "\n" + data;
    fs.appendFileSync('consoleLog.txt', data);
    resolve(true);
  });
}


// help me providing some time to load web page, and then begin scraping
  let customWait = (delay)=> new Promise((resolve, reject)=>{
    setTimeout(()=>{resolve()}, delay);
  });



// the Engine

async function init(){
  let URL = 'https://www.iplt20.com/stats/2024';
  const browser = await puppeteer.launch({headless: false});
  try {
    // launch a browser and open a new blank tab
      const page = await browser.newPage();

    // set the screen size
        await page.setViewport({width: 1920, height: 1080});
    
    // open a url inside that new tab
      await page.goto(URL);


    // process each filter list item    
    let selectorTableMostFourInnings ="";

    let overAllScrapedData = {}, scrapedData;
    let requiredFilters = [
      'Orange Cap',
      'Most Fours (Innings)',
      'Most Sixes (Innings)',
      'Most Centuries',
      'Fastest Fifties'
    ];

    for(let filter of requiredFilters){
      // click on filter
        clickOnSpecificFilter(page, filter);
        // now fetch the table containing the results of most four innings
        selectorTableMostFourInnings  = 'table.st-table.statsTable.ng-scope';
        scrapedData = await scrapeTableData(selectorTableMostFourInnings, page);
        overAllScrapedData[filter] = scrapedData;
    }

    // The result is
    console.log(overAllScrapedData);
    writeDataIntoFile('season2024.json', overAllScrapedData);
      
    
  } catch (error) {
    console.log('There is an error, ', error);
  }finally{
    // closing the browser
      setTimeout(async ()=>{

        await browser.close();
      },5000)
  }


}

async function clickOnSpecificFilter(page=null, filterName=null){
  if(page==null || filterName ==null ){
    return;
  }   

  // click on orange cap menu
      let orangeCapFilterMenu = 'div.col-lg-3.col-md-3.col-sm-12.statsFilter';
      await page.waitForSelector(orangeCapFilterMenu); // Wait for the season selector to appear
      await page.click(orangeCapFilterMenu);
  // clickOnMostFourInnings        
    let filterList = await page.$$('div.cSBList>>>div.cSBListItems.batters.selected.ng-binding.ng-scope');
    for (let filterItem of filterList) {
      let isClicked = await page.evaluate(async (element, filterName) => {        
        if(element.textContent.includes(filterName)){
          element.click();
          return true;
        }
        // default is 
        return false;
      }, filterItem, filterName);
      if(isClicked){
        break;
      }    
    }

}
// it is same for all the filters whatever the name 4's or 6's etc.
async function scrapeTableData(selectorTableMostFourInnings=null, page=null){
    if(selectorTableMostFourInnings === null || page === null){
      return;
    }

    // wait for this table to load
      await page.waitForSelector(selectorTableMostFourInnings);
      // custom wait
      await customWait(1000);
    // now fetch its body
      let tableRows = await page.$$(selectorTableMostFourInnings+ ' tr');
      let scrapedData = [];
      for(let currentRow of tableRows){
        let rowData = await page.evaluate(row=>{
          let isItTh = true;
          // th
            let columns = row.querySelectorAll('th');
          // td
            if(columns.length ===0 ){
              isItTh=false;
              columns = row.querySelectorAll('td');
            }
          let rowData = Array.from(columns, column => column.textContent.trim());
          // can i fetch the player image?
          if(isItTh){
            rowData.push('PlayerImageURL');
          }else{
            let playerImageUrl = row.querySelector('div.pbi>img');
            playerImageUrl = playerImageUrl ? playerImageUrl.getAttribute('src') : "";

            rowData.push(playerImageUrl);
          }
          return rowData;
        }, currentRow);   
        scrapedData.push(rowData);
      }
    // return
      return scrapedData;
}

function writeDataIntoFile(fileName, scrapedData){
  try {
    let filePath = path.join('ScrapedDB', fileName);
    fs.writeFileSync(filePath, JSON.stringify(scrapedData), 'utf-8');
    console.log(`Data successfully written into file: ${fileName}!`)
  } catch (error) {
    console.log(`Error writing data to file: ${fileName}! (${error.message})`)
    
  }
    
}

// await consoleLogFile('hi there');
init();
// writeDataIntoFile();