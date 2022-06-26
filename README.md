# POLLAPP BACKEND NODE&EXPRESS #

This Application is the backend aspect of a MERN fullstack application see [https://github.com/snipersenpai/POLL_APP_REACT.git](url) for the front end aspects. See [Poll App version 3.2.0 documentation.postman_collection.json](url) for full openAPI specification API documentation.

<h2>Description</h2>
A simple SPA web platform to ask questions, polls and connect with people who contribute unique insights and quality response. Computer-assisted survey information collection (CASIC) application.
This Application is the front end aspect of a MERN fullstack application see https://github.com/snipersenpai/POLLAP_FULL_STACK for the backend portion (with full openAPI specification API documentation).
<h2>Demo</h2>
<p>
  <img src="./demo/home.png" alt="">
</p>
<p>
  <img src="./demo/list.png" alt="">
</p>
<p>
  <img src="./demo/category_list.png" alt="">
</p>
<p>
  <img src="./demo/search_list.png" alt="">
</p>
<p>
  <img src="./demo/detail.png" alt="">
</p>

<p>
  <img src="./demo/create.png" alt="">
</p>

<p>
  <img src="./demo/signup.png" alt="">
</p>
<p>
  <img src="./demo/profile.png" alt="">
</p>
<p>
  <img src="./demo/other_profile.png" alt="">
</p>
<h2>Developer Team</h2>
<ul>
<li>
  Fully Developed By Me
</li>
</ul>
<h2>Technologies Used</h2>
<ul>
  <li >
    Bootstrap (reactstrap)
  </li>
  <li >
    HTML5
  </li>
  <li>
    CSS
  </li>
  <li>
    MongoDB
  </li>
  <li>
    Express.js
  </li>
  <li>
    Node
  </li>
  <li >
    Javascript
  </li>
  <li >
    React
  </li>
  <li >
    Redux
  </li>
</ul>
<h2>App Features</h2>
<ul >
  <li >
    Single Page Application (SPA)
  </li>
  <li >
    Modern, Stylish, interactive and yet simple UI design
  </li>
  <li>
    Login, Register and Authentication Capabilities (Passport.js JWT)
  </li>
  <li >
    Content Management System (CMS)
  </li>
  <li >
    Create, edit and manage polls, poll contents and votes
  </li>
  <li >
    Search and Filter Contents
  </li>
</ul>

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
