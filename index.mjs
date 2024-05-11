import puppeteer from 'puppeteer';
import fs from 'node:fs';

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

// shall save the data into excel file
function storeDataIntoExcelFile(jobs){
    if(jobs.length===0){
      return ;
    }      
      // now i want to save it into the excel file
      // Create a new workbook
      try {
        let sheet = xlsx.utils.json_to_sheet(jobs);
        let workbook = xlsx.utils.book_new();
          xlsx.utils.book_append_sheet(workbook, sheet, 'sheet1');
    
          xlsx.writeFile(workbook, 'jobs.xlsx');
          console.log('Data saved into jobs.xlsx file Successfully!');
        
      } catch (error) {
        console.log('ERROR saving data into excel file. ', error);
      }
}

// help me providing some time to load web page, and then begin scraping
  let customWait = (delay)=> new Promise((resolve, reject)=>{
    setTimeout(()=>{resolve()}, delay);
  });

async function doScrapingTask(){
  return new Promise(async (resolve, reject)=>{
    try {
      consoleLogFile(`i'm inside promise doScrapingTask`);
      // performing scraping
      // now looking for orange cap players
      let selectorStatsFilter = 'div.col-lg-3.col-md-3.col-sm-12.statsFilter';
      // let selectorStatsFilter = 'div.col-lg-2.col-md-2.col-sm-12>div.customSelecBox';
      // now i want to click on it
      await page.waitForSelector(selectorStatsFilter); // Wait for the season selector to appear
      await page.click(selectorStatsFilter);
     

      // work done
      resolve();

    } catch (error) {
      reject();
    }


  });
}

// the Engine
async function init(){
  let URL = 'https://www.iplt20.com/stats/';
  const browser = await puppeteer.launch({headless: false});
  try {
    // launch a browser and open a new blank tab
      const page = await browser.newPage();

    // set the screen size
        await page.setViewport({width: 1920, height: 1080});
    
    // open a url inside that new tab
      await page.goto(URL);



    // fetching 
    // click on season selector
    let seasonSelector = 'div.col-lg-2.col-md-2.col-sm-12>div.customSelecBox';
    await page.waitForSelector(seasonSelector); // Wait for the season selector to appear
    await page.click(seasonSelector);

    // now let me click on season 2023
     await page.$eval(seasonSelector, async el=>{
      await el.click();
     });


    
    
  } catch (error) {
    console.log('There is an error, ', error);
  }finally{
    // closing the browser
      setTimeout(async ()=>{

        await browser.close();
      },10000)
  }


}

// await consoleLogFile('hi there');
init();
