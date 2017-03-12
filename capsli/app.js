var express = require('express'),
	http = require('http'),
	app = express();

	// static files
	app.use("/", express.static(__dirname + "/"));

app.listen(process.env.PORT || 8100);
console.log("dirname:" + __dirname);
console.log("listening port:" + (process.env.PORT || 8100));