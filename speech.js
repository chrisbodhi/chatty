var Speech = require('./node_modules/speechjs/index.js');

// var recognizer = new Speech({
//     lang: 'en-US', // default is English.
//     // all boolean options default to false
//     debugging: true, // will console.log all results
//     continuous: true, // will not stop after one sentence
//     interimResults: true, // trigger events on iterim results
//     autoRestart: true, // recommended when using continuous:true
//                       // because the API sometimes stops itself
//                       // possibly due to network error.
// });

// // simply listen to events
// // chainable API
// recognizer
//     .on('start', function () {
//         console.log('started');
//     })
//     .on('end', function () {
//         console.log('ended');
//     })
//     .on('error', function (event) {
//         console.log(event.error);
//     })
//     .on('interimResult', function (msg) {
//         document.body.innerHTML = msg;
//     })
//     .on('finalResult', function (msg) {
//         document.body.innerHTML = msg;
//     })
//     .start();

var text = document.getElementById('text')

var speech = new Speech({
  debugging: true,
  continuous: true,
  interimResults: true,
  autoRestart: true
})

speech
  .on('start', function () {
      text.innerHTML = 'Come on, talk to me.'
  })
  .on('end', function () {
      text.innerHTML = 'Stopped listening.'
  })
  .on('interimResult', function (msg) {
      text.innerHTML = msg
  })
  .on('finalResult', function (msg) {
      text.innerHTML = msg
  })
  .start()