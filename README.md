# diploma-speech-to-text
Library for using the IBM Watson Speech to Text to send data from michrophone input to arduino


Postopek konfiguracije:

1. run command --> npm install //install npm packages if npm not isntalled run commands --> sudo apt-get update && sudo apt install npm
2. run command --> openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pem // create self sign certificate
3. run command --> cp .env.example .env
4. Register to https://cloud.ibm.com/ create Speech to text service, region must be London!!!
5. Copy credentials from dashboard https://cloud.ibm.com/ -> services -> show credentials -> copy them
6. run command --> nano .env //modify .env file insert Speech to text IAM api key and url from https://cloud.ibm.com/ 
7. run command --> sudo node server.js
