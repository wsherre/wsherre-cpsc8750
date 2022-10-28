// use the express library
const express = require('express');
const cookieParser = require('cookie-parser');
const fetch = require('node-fetch');

// create a new server application
const app = express();

// Define the port we will listen on
// (it will attempt to read an environment global
// first, that is for when this is used on the real
// world wide web).
const port = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(cookieParser());
app.set('view engine', 'ejs');

let nextVisitorId = 1;

// the main page
app.get('/', (req, res) => {
  let time_text = "";
  //console.log(Object.keys(req.cookies).length);
  //if there are no cookies in the brower, aka they never visted, set the cookies
  if(Object.keys(req.cookies).length == 0){
    res.cookie('visitorId', nextVisitorId++);
    res.cookie('visited', new Date().toString());
    time_text = "You have never visited";

  }else{
    // get the seconds difference from the cookies
    let sec = Math.round(((new Date().getTime() - new Date(req.cookies['visited']).getTime()) / 1000), 0);
    //console.log(sec);
    time_text = "You last visited " + sec + " seconds ago.";
    res.cookie('visited', new Date().toString());
  }
  //console.log(req.cookies);
  res.render('welcome', {
    name: "World!",
    date: new Date().toLocaleString(),
    id: nextVisitorId,
    time: time_text,
  });
});

app.get("/trivia", async (req, res) => {
  // fetch the data
  const response = await fetch("https://opentdb.com/api.php?amount=1&type=multiple");

  // fail if bad response
  if (!response.ok) {
    res.status(500);
    res.send(`Open Trivia Database failed with HTTP code ${response.status}`);
    return;
  }

  // interpret the body as json
  const content = await response.json();


  // fail if db failed
  if (content.response_code != 0) {
    res.status(500);
    res.send(`Open Trivia Database failed with internal response code ${content.response_code}`);
    return;
  }

  var ind = Math.floor(Math.random() * 4);
  answers = content.results[0].incorrect_answers
  correct_answer = content.results[0].correct_answer
  answers.splice(ind, 0, correct_answer);

  const answerLinks = answers.map(answer => {
    return `<a style='color: red' href="javascript:alert('${
      answer === correct_answer ? 'Correct!' : 'Incorrect, Please Try Again!'
      }')">${answer}</a>`
  })
  console.log(answerLinks)
  
  // respond to the browser
  // TODO: make proper html
  //res.send(JSON.stringify(content, 2));
  res.render('trivia', {
    question: content.results[0].question,
    answers: answerLinks,
    category: content.results[0].category,
    difficulty: content.results[0].difficulty
  });
});


// Start listening for network connections
app.listen(port);

// Printout for readability
console.log("Server Started!");
