$(function(){
	
	var app = capsli;

	var userLang = (navigator.language) ? navigator.language : navigator.userLanguage; 

	console.log(userLang);

	ko.applyBindings(app);
});