import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import { messageEntry } from './messages.js';

const BootBot = require('bootbot');
const config = require('config');
const fetch = require('node-fetch')
var port = process.env.PORT || config.get('PORT');

/** ChatBot
 * original chatbot https://github.com/Charca/bootbot/blob/master/README.md
 * 
 * For detecting language has been used api https://detectlanguage.com/documentation
 * https://github.com/detectlanguage/detectlanguage-node
 * More api 's can be found at https://github.com/public-apis/public-apis
 * Translations of an entry level message has been placed to a separate file messages.js
 *  - Chat starts with a key word Hello or Hi
 *  - chat bot search for jobs in specific country if more than 20 results available than we ask use to narrow the search by job name
 */
//TODO trigger conversation if user doesnt use the right keyword
//TODO better format of links to jobs
//TODO usage of buttons
//TODO if the user continue with the chat, messages need to be redefined


//const MOVIE_API = "http://www.omdbapi.com/?apikey=1e69fe05";// key for my email
//const MOVIE_API = "http://www.omdbapi.com/?i=tt3896198&apikey=1e69fe05";// for my email
const JOB_API = "https://jobs.github.com/positions.json?";// for my email
//https://jobs.github.com/positions.json?description=java&location=Berlin // example search link

let DetectLanguage = require('detectlanguage');
const detectlanguage = new DetectLanguage('2128a8f3462fffd8ff959201d70f63e5');//https://detectlanguage.com/

const bot = new BootBot({
  accessToken: config.get('ACCESS_TOKEN'),
  verifyToken: config.get('VERIFY_TOKEN'),
  appSecret: config.get('APP_SECRET')
});

/**
 * Entry level  message
 * @firstUse - entry message will be used just once
 */
let firstUse = 0;
bot.on('message',(payload, chat) => {
  if (firstUse == 0) {
    const text = payload.message.text;
    detectlanguage.detect(text).then(function(result) {
      for (let index = 0; index < result.length; index++) {
        console.log(result[index].language);
        for (let n = 0; n < messageEntry.length; n++) {
          //TODO fix the loop
          if (result[index].language === messageEntry[n].language){
            chat.say(messageEntry[n].text + "(" + result[index].language + ")",{typing:true});  
          }else{
            console.log("not found" + result[index].language);
          }
          //chat.say(messageEntry[0].text,{typing:true});  
        }
      }
    });
    firstUse = 1; //
  }
});
    //**************   start chat with hi */
bot.hear(['hello', 'hi'], (payload, chat) => {
console.log('The user said "hello" or "hi"!');
  chat.say('Hi, I can find you a job advertisement.\n\nI will start search, if you write me city or country name starting with word "location <name>"',{typing:true})
});
let locationName = '';
let jobName = '';
//*********************************search by country */
bot.hear(/location(.*)/i,(payload,chat, data) =>{
  chat.conversation((conversation) =>{
    locationName = data.match[1]
    console.log("Somebody wrote the country or city name"+ locationName)
    fetch(JOB_API + 'description=&location=' + locationName).then(res=>res.json())
    .then(json=>{
      if(json.Response ==="False"){
        // jobs not found
        conversation.say('I could not find any job offer in country or city like '+ locationName + ',you can try search again like "location <name>"',{typing:true})
        conversation.end();
      }else{
        // jobs found
        console.log(json.length);
        if (json.length<20){
          let element = '';
          for (let i = 0; i < json.length; i++) {
            element += json[i].title + "\n" + json[i].url + "\n\n";
          }
          conversation.say('I found following job offers \n\n' +element, {typing:true})
        }else{
          conversation.say('I found more than 20 offers.\n\n I suggest to narrow the search and add the job name.\n\n Type the "job <name>"', {typing:true})
          conversation.end();
        }
      }
    })
    })
  }); 
//*************************************search by job */
bot.hear(/job(.*)/i,(payload,chat, data) =>{
  chat.conversation((conversation) =>{
    const jobName = data.match[1]
    console.log("Somebody wrote the job name"+ jobName)
    fetch(JOB_API + 'description=' + jobName + '&location=' +locationName).then(res=>res.json())
    .then(json=>{
      if(json.Response ==="False"){
        // jobs not found
        conversation.say('I could not find any job offer in country or city like '+ locationName + ' and job like '+ jobName + ',you can try search again by typing different city or country typing keyword "location <name>"',{typing:true})
        conversation.end();
      }else{
        // jobs found
        console.log(json.length);
        if (json.length<20){
          let element = '';
          for (let i = 0; i < json.length; i++) {
            element += json[i].title + "\n" + json[i].url + "\n\n";
          }
          conversation.say('I found following job offers \n\n' +element, {typing:true})
        }else{
          conversation.say('I found again more than 20 offers by searching city or country '+ locationName + ' and job like '+ jobName + '.\n\n I suggest you to narrow the search and either add or chnage the city or the country, where you want to work. Type key word "location <name>"', {typing:true})
          conversation.end();
        }
      }
    })
    })
    locationName = '';
    jobName = '';
  });
bot.start(port);