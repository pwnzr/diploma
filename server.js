const express = require('express');
const app = express();
const AuthorizationV1 = require('ibm-watson/authorization/v1');
const SpeechToTextV1 = require('ibm-watson/speech-to-text/v1');
const vcapServices = require('vcap_services');
const firmata = require('firmata');
var ip = require("ip");



// allows environment properties to be set in a file named .env
require('dotenv').load({ silent: true });

app.use(express.static(__dirname + '/public'));


// speech to text token endpoint
var sttAuthService = new AuthorizationV1(
  Object.assign(
    {
      iam_apikey: process.env.SPEECH_TO_TEXT_IAM_APIKEY, // if using an RC service
      url: process.env.SPEECH_TO_TEXT_URL ? process.env.SPEECH_TO_TEXT_URL : SpeechToTextV1.URL
    },
    vcapServices.getCredentials('speech_to_text') // pulls credentials from environment in bluemix, otherwise returns {}
  )
);
app.use('/api/speech-to-text/token', function(req, res) {
  sttAuthService.getToken(function(err, token) {
    if (err) {
      console.log('Error retrieving token: ', err);
      res.status(500).send('Error retrieving token');
      return;
    }
    res.send(token);
  });
});

/*const port = process.env.PORT || process.env.VCAP_APP_PORT || 3000;
var server = app.listen(port, function() {
  console.log('Connected to http://localhost:', port);
});

var io = require('socket.io').listen(server);*/
// Chrome requires https to access the user's microphone unless it's a localhost url so
// this sets up a basic server on port 3001 using an included self-signed certificate
// note: this is not suitable for production use
// however bluemix automatically adds https support at https://<myapp>.mybluemix.net
if (!process.env.VCAP_SERVICES) {
  const fs = require('fs');
  const https = require('https');
  const HTTPS_PORT = process.env.PORT;

  const options = {
    key: fs.readFileSync(__dirname + '/key.pem'),
    cert: fs.readFileSync(__dirname + '/cert.pem')
  };
  var server = https.createServer(options, app).listen(HTTPS_PORT, function() {
	console.log('Secure server live at https://%s:%d/',ip.address(), HTTPS_PORT);
  });
var io = require('socket.io').listen(server);
}

//Priključitev na arduino
var board = new firmata.Board("/dev/ttyUSB0",function(){
    	console.log("Priključitev na Arduino");
        console.log("Firmware: " + board.firmware.name + "-" + board.firmware.version.major + "." + 		board.firmware.version.minor); // izpišemo verzijo Firmware     
        board.pinMode(9, board.MODES.SERVO);        
	board.pinMode(10, board.MODES.SERVO);
	board.pinMode(11, board.MODES.SERVO); 
	board.pinMode(13, board.MODES.OUTPUT);
    	board.pinMode(12, board.MODES.OUTPUT);
   	board.pinMode(8, board.MODES.OUTPUT);
    	board.pinMode(7, board.MODES.OUTPUT);
    	board.pinMode(4, board.MODES.OUTPUT);
 	board.pinMode(6, board.MODES.SERVO);
	board.pinMode(2, board.MODES.OUTPUT);
	console.log("Omogočeni pin-i: 2,4,6,7,8,9,10,11,12,13.");


});


io.on('connection', function(socket){
	socket.on("ukazArduinu", function(data){
		 if (data.stevilkaUkaza == "5") {
			console.log("stop working");
                    board.digitalWrite(13, board.LOW); // na pinu 13 zapišemo vrednost LOW - LED indikator - rdeča
                    board.digitalWrite(7, board.LOW); // na pinu 13 zapišemo vrednost LOW - LED indikator - rumena
                    board.digitalWrite(4, board.LOW); // na pinu 13 zapišemo vrednost LOW - LED indikator - bela
                    board.digitalWrite(8, board.LOW); // na pinu 13 zapišemo vrednost LOW - LED indikator - modra
                    setTimeout(function() {board.servoWrite(11,93 );},0); // stop levi motor
                    setTimeout(function() {board.servoWrite(10,93 );},0); // stop desni motor
                }
               // *********************************************************************
		       // Naprej
		       // *********************************************************************                
               else if (data.stevilkaUkaza == "8") {
		console.log("go working");
   	                // pini na ustrezne vrednosti za premik naprej
			board.digitalWrite(13, board.HIGH); // na pinu 13 zapišemo vrednost LOW - LED indikator - rdeča

   	                board.digitalWrite(7, board.HIGH); // na pinu 7 zapišemo vrednost HIGH - LED indikator - rumena
   	                setTimeout(function() {board.servoWrite(11,92 );},0); // naprej levi motor
                    setTimeout(function() {board.servoWrite(10,94);},0); // naprej desni motor
   	                
                }
               // *********************************************************************
		       // Nazaj
		       // *********************************************************************                
               else if (data.stevilkaUkaza == "2") {
			console.log("BACK working");
                    // pini na ustrezne vrednosti za premik nazaj
                    board.digitalWrite(4, board.HIGH); // na pinu 13 zapišemo vrednost HIGH - LED indikator - bela
                    setTimeout(function() {board.servoWrite(11,94);},0); // nazaj levi motor
                    setTimeout(function() {board.servoWrite(10,92);},0); // nazaj desni motor
                }
               // *********************************************************************
		       // Spin levo
		       // *********************************************************************                
               else if (data.stevilkaUkaza == "4") {
		console.log("LEFT working");
                    // pini na ustrezne vrednosti za premik levo
                    board.digitalWrite(8, board.HIGH); // na pinu 8 zapišemo vrednost HIGH - LED indikator - modra
      	            setTimeout(function() {board.servoWrite(10,92 );},0); // nazaj levi motor
                    setTimeout(function() {board.servoWrite(11,92);},0); // naprej desni motor
                }                                                                                    
               // *********************************************************************
		       // Spin desno
		       // *********************************************************************                
               else if (data.stevilkaUkaza == "6") {
			console.log("RIGHT working");
                    // pini na ustrezne vrednosti za premik desno
                    board.digitalWrite(13, board.HIGH); // na pinu 13 zapišemo vrednost HIGH - LED indikator
      	            setTimeout(function() {board.servoWrite(11,94);},0); // naprej levi motor
                    setTimeout(function() {board.servoWrite(10,94);},0); // nazaj desni motor
                }                                                                                      
               // *********************************************************************
		       // Engage
		       // *********************************************************************                
               else if (data.stevilkaUkaza == "111") {
                    // pini na ustrezne vrednosti za premik desno
                    board.digitalWrite(12, board.HIGH); // na pinu 13 zapišemo vrednost HIGH - LED indikator
                    engage = 1;
                    //return engage; // da zapišemo vrednost spremenljivke v global
                }
               // *********************************************************************
		       // Engage
		       // *********************************************************************                
               else if (data.stevilkaUkaza == "222") {
                    // pini na ustrezne vrednosti za premik desno
                    board.digitalWrite(12, board.LOW); // na pinu 13 zapišemo vrednost HIGH - LED indikator
                    engage = 0;
                    //return engage; // da zapišemo vrednost spremenljivke v global
                }                                                                      


                else if (data.stevilkaUkaza == "777") {
		        board.digitalWrite(13, board.HIGH); // na pinu 13 zapišemo vrednost HIGH
		        setTimeout(function() {board.servoWrite(11,89 );},0); // nazaj levi motor
		        setTimeout(function() {board.servoWrite(10,103);},0); // nazaj desni motor
                }else if (data.stevilkaUkaza == "888") {
		        board.digitalWrite(13, board.HIGH); // na pinu 13 zapišemo vrednost HIGH
		        setTimeout(function() {board.servoWrite(11,103);},0); // naprej levi motor
		        setTimeout(function() {board.servoWrite(10,89);},0); // naprej desni motor
                } else if (data.stevilkaUkaza == "999") {
		    	board.digitalWrite(13, board.LOW); // na pinu 13 zapišemo vrednost HIGH
		        setTimeout(function() {board.servoWrite(11,94 );},0); // stop levi motor
		        setTimeout(function() {board.servoWrite(10,94 );},0); // stop desni motor
                } else if (data.stevilkaUkaza == "40") {
               		board.digitalWrite(4, board.LOW); // na pinu zapišemo vrednost LOW
                }
                else if (data.stevilkaUkaza == "41") {
               		board.digitalWrite(4, board.HIGH); // na pinu zapišemo vrednost HIGH
                }
                else if (data.stevilkaUkaza == "70") {
                      board.digitalWrite(7, board.LOW); // na pinu zapišemo vrednost LOW
                }
                else if (data.stevilkaUkaza == "71") {
                      board.digitalWrite(7, board.HIGH); // na pinu zapišemo vrednost HIGH
                }
                else if (data.stevilkaUkaza == "120") {
                      board.digitalWrite(12, board.LOW); // na pinu zapišemo vrednost LOW
                }
                else if (data.stevilkaUkaza == "121") {
                      board.digitalWrite(12, board.HIGH); // na pinu zapišemo vrednost HIGH
                }
                else if (data.stevilkaUkaza == "130") {
                      board.digitalWrite(13, board.LOW); // na pinu zapišemo vrednost LOW
                }
                else if (data.stevilkaUkaza == "131") {
                      board.digitalWrite(13, board.HIGH); // na pinu zapišemo vrednost HIGH
                }
                else if (data.stevilkaUkaza == "7771") { // buttonLeftforward 
                board.digitalWrite(13, board.HIGH); // na pinu 13 zapišemo vrednost HIGH
                setTimeout(function() {board.servoWrite(10,94);},0); // naprej levi motor malo manj
                setTimeout(function() {board.servoWrite(11,91 );},0); // naprej levi motor
                }            
                else if (data.stevilkaUkaza == "7772") { // buttonRightforward 
                board.digitalWrite(13, board.HIGH); // na pinu 13 zapišemo vrednost HIGH
                setTimeout(function() {board.servoWrite(10,95);},0); // naprej levi motor
                setTimeout(function() {board.servoWrite(11,92 );},0); // naprej desni motor malo manj
                }
                else if (data.stevilkaUkaza == "9991") { // buttonSpinleft 
                board.digitalWrite(13, board.HIGH); // na pinu 13 zapišemo vrednost HIGH
                setTimeout(function() {board.servoWrite(10,89 );},0); // nazaj levi motor
                setTimeout(function() {board.servoWrite(11,89);},0); // naprej desni motor
                }
                else if (data.stevilkaUkaza == "9992") { // buttonSpinright
                board.digitalWrite(13, board.HIGH); // na pinu 13 zapišemo vrednost HIGH
                setTimeout(function() {board.servoWrite(11,103);},0); // naprej levi motor
                        setTimeout(function() {board.servoWrite(10,103);},0); // nazaj desni motor
                }
                else if (data.stevilkaUkaza == "8881") { // buttonLeftbackward
                board.digitalWrite(13, board.HIGH); // na pinu 13 zapišemo vrednost HIGH
                setTimeout(function() {board.servoWrite(10,91);},0); // naprej levi motor
                setTimeout(function() {board.servoWrite(11,94 );},0); // naprej desni motor malo manj
                }
                else if (data.stevilkaUkaza == "8882") { // buttonRightbackward
                board.digitalWrite(13, board.HIGH); // na pinu 13 zapišemo vrednost HIGH
                setTimeout(function() {board.servoWrite(10,92);},0); // naprej levi motor malo manj
                setTimeout(function() {board.servoWrite(11,95 );},0); // naprej levi motor                
                }
                else if (data.stevilkaUkaza == "90") { // če je številka ukaza, ki smo jo dobili iz klienta enaka 1
                        board.servoWrite(9,90);
                    //io.sockets.emit("sporociloKlientu", data.sporocilo); // izvedemo to funkcijo = "sporociloKlientu" na klientu, z argumentom, t.j. podatki="LED prižgana."
//                    io.sockets.emit("sporociloKlientu", "LED prižgana na arduinu IP: " + localaddress + ":" + httpListenPort); // izvedemo to funkcijo = "sporociloKlientu" na klientu, z argumentom, t.j. podatki="LED prižgana."
                }
                else if (data.stevilkaUkaza == "91") { // če je številka ukaza, ki smo jo dobili iz klienta enaka 0
                        board.servoWrite(9,5);
                    //io.sockets.emit("sporociloKlientu", data.sporocilo); // izvedemo to funkcijo = "sporociloKlientu" na klientu, z argumentom, t.j. podatki="LED prižgana."
                    //io.sockets.emit("sporociloKlientu", "LED ugasnjena na arduinu IP: " + localaddress + ":" + httpListenPort); // izvedemo to funkcijo = "sporociloKlientu" na klientu, z argumentom, t.j. podatki="LED prižgana."
		}
	});
});


