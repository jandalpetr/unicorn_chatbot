import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import { msg, myFunction } from './functions.js';
import { messageEntry } from './messages.js';

const BootBot = require('bootbot');
const config = require('config');
const fetch = require('node-fetch')
var port = process.env.PORT || config.get('PORT');

//const MOVIE_API = "http://www.omdbapi.com/?apikey=8df4f6a8";//original key as in class
const MOVIE_API = "http://www.omdbapi.com/?apikey=1e69fe05";
//https://jobs.github.com/positions.json?description=java&location=Berlin

//http://www.omdbapi.com/?i=tt3896198&apikey=1e69fe05 //key for my email

let DetectLanguage = require('detectlanguage');
const detectlanguage = new DetectLanguage('2128a8f3462fffd8ff959201d70f63e5');//https://detectlanguage.com/

//console.log(msg); // Prints: Hello World!
//console.log(messageEntry);

const bot = new BootBot({
  accessToken: config.get('ACCESS_TOKEN'),
  verifyToken: config.get('VERIFY_TOKEN'),
  appSecret: config.get('APP_SECRET')
});

// bot.on('message', (payload, chat) => {
// 	const text = payload.message.text;
//   console.log(`The user said: ${text}`);  
// });
/**
 * Entry level  message
 * @param  {String} selector Selector for the element
 * @param  {Node}   toggle   The element that triggered the tab
 */
bot.on('message',(payload, chat) => {
	const text = payload.message.text;
    detectlanguage.detect(text).then(function(result) {
      //console.log(JSON.stringify(result));
      let messageLanguage = JSON.stringify(result);  
      // console.log(result[0].language);
      for (let index = 0; index < result.length; index++) {
        //const element = result[index].language;
        //console.log(result[index].language);
        for (let n = 0; n < messageEntry.length; n++) {
          if (result[index].language === messageEntry[n].language){
            chat.say(messageEntry[n].text,{typing:true})   
           }
          }
        }
      });
    });
    
    bot.hear(['hello', 'hi'], (payload, chat) => {
      console.log('The user said "hello" or "hi"!');
      chat.say('Hi, I can find you a job advertisement. Just write me a name of the job starting with word "job"',{typing:true})
    });
    
    


// //Send a button template
// bot.on('message',(payload, chat) => {
//         chat.say({
//           text: 'Favorite color?',
//           buttons: [
//             { type: 'postback', title: 'Red', payload: 'FAVORITE_RED' },
//             { type: 'postback', title: 'Blue', payload: 'FAVORITE_BLUE' },
//             { type: 'postback', title: 'Green', payload: 'FAVORITE_GREEN' }
//           ]
//         });
// });

//************************** */
//text = "<ul>";
//messageEntry.forEach(myFunction);
//text += "</ul>";
//*********************** */

/*
bot.hear(/movie(.*)/i,(payload,chat, data) =>{
  chat.conversation((conversation) =>{
    const movieName = data.match[1]
    console.log("Somebody asked about"+ movieName)
    
    fetch(MOVIE_API + '&t=' +movieName).then(res=>res.json())
    .then(json=>{
      console.log("Search result is" + JSON.stringify(json));
      if(json.Response ==="False"){
        // film nenasli
        conversation.say('I could not find'+ movieName + 'yopu can try searching "movie <name>"',{typing:true})
        conversation.end();
      }else{
        //film nasli
        conversation.say('I founs out movie' +json.Title, {typing:true})
        setTimeout(()=>{
          conversation.say("The movie is from " +json.Year +"and was directly by" +json.Director,{typing:true})
        },1000)
        handlePlot(conversation,json)
      }
    })
    })
  });
  */
/*
  function handlePlot(conversation, json) {
    setTimeout(()=>{
      conversation.ask({
        text: "Would you like to know what the movie is about?",
        quickReplies: ["Yes","No"],
        options:{ typing:true}
      },(payload,conversation) =>{
        if (payload.message.text==="Yes") {
          //ano chce vedet
          conversation.say(json.Plot,{typing:true})
          conversation.end();
        }else{
          // ne nechce vedet
          conversation.say("Ok, ask me about a different movie then",{typing:true})
          conversation.end();
        }
      });
    },2000)
  }
  */
//dominik.snopek@applfting.cz
bot.start(port);