var hud = {

	score: 0,
	lives: 3,
	speed: 0,

	preload: function(){},

	create: function () {
		this.lblSkor = game.add.text(20, 20, 'score: 0', 
			{ font: '18px Arial', fill: '#aaa' });

		// this.livesGroup = game.add.group();
		// this.updateLives();
	},

	updateScore: function(addScore){
    	if(addScore) this.score += addScore;
    	this.lblSkor.text = "score: " + this.score.toString();
    },

    updateLives: function(addLive){
		var live,
			x = game.world.width - (this.lives*30) - 40;
	
		this.livesGroup.removeAll();
    	if(addLive) this.lives += addLive;

		for(i=this.lives; i>0; i--){
			live = this.livesGroup.create(x + i*30, 20, 'hak');
			live.scale.setTo(0.5,0.5);
		}
    },

    reset: function(){
    	this.score = 0;
	    this.speed = 0;
    }
}