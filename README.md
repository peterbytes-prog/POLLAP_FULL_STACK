# POLLAPP BACKEND NODE&EXPRESS #

This Application is the backend aspect of a MERN fullstack application see [https://github.com/snipersenpai/POLL_APP_REACT.git](url) for the front end aspects. See [Poll App version 3.2.0 documentation.postman_collection.json](url) for full openAPI specification API documentation.

## Getting Started ##

To start and run the server (node) you will need to make sure that 
- you have installed all of the prerequisites using the following command.

	`npm install`
- create a file name config.js with the following contents

	```
	module.exports = {
  		'secretKey':'B75RlYpJSL9Edkoi7Uh2d45O7DCijJGw2xWHTkAn9UM',
  		'mongoUrl':'mongodb://localhost:27017/POLLAPP'
	}
	```
- start mongo db server 

At this point you are now ready to begin runing both the app and tests. 
- to run the test using mocha
	`npm test`
- to start server/application
	`npm start #server will start on port 3000`





