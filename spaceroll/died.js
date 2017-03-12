var state_died = {
	
	preload: function () {},

	create: function(){
		var self = this,
			x1 = game.world.width/2,
			y1 = game.world.height/2,
			y2 = y1 + 100,
			isHs = false,
			lastScore = 0;
		
		this.bg = game.add.tileSprite(0,0, game.world.width, game.world.height,'starfield');

		// high score?
		if (game.device.localStorage) {
		    window.localStorage.score = hud.score;
		    if (window.localStorage.highScore) lastScore = window.localStorage.highScore;
		    
		    if(hud.score > lastScore){
		    	isHs = true;
		    	window.localStorage.highScore = hud.score;
		    	lastScore = null;
		    }
		}

		var txt = isHs ? "New High Score !\n" : "";
		txt += "Score: " + hud.score + "\nTap to share your score on twitter!";
		self.dieLabel = game.add.text(x1, 0,
	    	txt, 
	    	{font: '20px Arial', fill: "#fff"});
		self.dieLabel.anchor.set(0.5);
	    self.dieLabel.inputEnabled = true;
	    self.dieLabel.events.onInputDown.add(function(){
	    	self.tweetscore();
	    });
	    game.add.tween(self.dieLabel).to({ y: y1 }, 1000, Phaser.Easing.Bounce.Out).start();

	    if(lastScore){
		    self.hsLabel = game.add.text(x1, y2,
		    	"Your high score : " + lastScore, 
		    	{font: '18px Arial', fill: "#fff"});
			self.hsLabel.anchor.set(0.5);
			y2 += 100;
	    }
	    
	    self.restartLabel = game.add.text(x1, y2,
	    	"Restart", 
	    	{font: '24px Arial', fill: "#f04"});
	    self.restartLabel.anchor.set(0.5);
	    self.restartLabel.inputEnabled = true;
	    self.restartLabel.events.onInputDown.add(function(){
	    	hud.reset();
	    	game.state.start('state_main');
	    	self.restartLabel.destroy();
	    });
	},

	tweetscore: function(){
        //share score on twitter
        var tweetbegin = 'http://twitter.com/home?status=';
        var tweettxt = 'I scored '+hud.score+' at Space Roll (http://www.yortuc.com/sr)';
        var finaltweet = tweetbegin + encodeURIComponent(tweettxt);
        window.open(finaltweet,'_blank');
    },

	update: function(){
		this.bg.tilePosition.y += -1;
	}
};

game.state.add('state_died', state_died);