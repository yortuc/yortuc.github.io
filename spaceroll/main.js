var WIDTH = 400,
	HEIGHT = 680;

var dev = new Phaser.Device();

/*
if(dev.desktop){
	WIDTH = 640;
	HEIGHT = window.innerHeight;
}*/

var game = new Phaser.Game(WIDTH, HEIGHT, Phaser.AUTO, 'game_div');

var state_main = {

    preload: function() {
    	// bg
    	this.bg = game.add.tileSprite(0,0, game.world.width, game.world.height,'starfield');
    	this.bg.scale.setTo( game.world.width/this.bg.width, game.world.height/this.bg.height);
    	this.bg2 = game.add.sprite(0,0,"bgstars");

		// sounds
	    this.sndCoin = game.add.sound("coin");
    },

    create: function() { 
		this.spikeRate = 5000;
    	this.nextSpike = 5000;

    	this.lastPlatformId = 0;

    	this.cursors = game.input.keyboard.createCursorKeys();

	    // arcade fizik motoru
	    game.physics.startSystem(Phaser.Physics.ARCADE);

	    // gruplar
	    this.platforms = game.add.group();
	    this.platforms.enableBody = true;
	    this.platforms.createMultiple(10, 'platform');
	    this.platforms.setAll('outOfBoundsKill', true);
	    this.platforms.setAll('checkWorldBounds', true);
	    this.platforms.setAll('body.immovable', true);

	    // spikes
		this.spikes = game.add.group();
	    this.spikes.enableBody = true;

	    // stars
	    this.stars = game.add.group();
	    this.stars.enableBody = true;
	    this.stars.createMultiple(5, 'star');
	    this.stars.setAll('outOfBoundsKill', true);
	    this.stars.setAll('checkWorldBounds', true);
	    this.stars.setAll('anchor.x', 0.5);
	    this.stars.setAll('anchor.y', 0.5);
	    this.stars.forEach(function(star){
	    	game.add.tween(star.scale).to({x: 0.4, y:0.4}, 500).to({x: 1, y:1}, 500).loop().start();
	    });

	    this.animStar = game.add.sprite(0,0,"star");
	    this.animStar.anchor.set(0.5);
	    this.animStar.exists = false;

    	// player
    	this.player = game.add.sprite(game.world.width/2 - 40, game.world.height*0.45-40, 'player');
    	this.player.anchor.set(0.5);
    	this.player.scale.set(0.5);
    	game.physics.arcade.enable(this.player);
    	this.player.body.bounce.y = 0.4;
	    this.player.body.gravity.y = 450;
    	this.player.animations.add('walk', [0, 1, 2, 3,4,5,6,7,8,9,10], 16, true);

    	// gem
    	this.gem = game.add.sprite(0, 0, "gem_blue");
    	this.gem.anchor.set(0.5);
	    game.physics.arcade.enableBody(this.gem);
	    this.gem.kill();

    	// head-up display
    	hud.create();

    	// timers
    	this.timer = this.game.time.events.loop(1000, this.add_stage, this);
    	this.speedTimer = this.game.time.events.loop(2000, this.speedUp, this);

    	// some platforms for the beginnig of the game
    	this.add_stage(this.player.x-50, game.world.height*0.45);
    	this.add_stage(null, game.world.height*0.75);

    	// pause button
	    var pause_btn = game.add.sprite(game.world.width-50, 50, "pause");
	    pause_btn.scale.set(0.3);
	    pause_btn.inputEnabled = true;
	    pause_btn.events.onInputDown.add(function () {
	    	if(game.paused){
				game.paused = false;
	    		self.pauseLabel.destroy();
	    	}
	    	else{
	    		game.paused = true;
	        	self.pauseLabel = game.add.text(game.world.width/2,game.world.height/2,
	        	"paused", 
	        	{fill: "#fff"});
	        	self.pauseLabel.anchor.set(0.5);
	    	}
	    });
	
		var self = this;
	    game.input.onDown.add(function(){
	    	if(game.paused){
	    		game.paused = false;
	    		self.pauseLabel.destroy();
	    	}
	    });
    },

    add_stage: function(x,y){
    	var seed = game.rnd.integerInRange(0,16),
			stage_width = 100,
    		stage_speed = -(150 + hud.speed),
    		stagePosX = x ? x : (game.world.width - stage_width) * game.rnd.frac(),
    		stagePosY = y ? y : game.world.height,
    		spikePosY,
    		stage1,
    		star,
    		spike;

    	// place a spike?
	    if(seed > 10 && !x && !y && game.time.now > this.nextSpike) {    	
    		spike = this.spikes.create(stagePosX, stagePosY, "spikes");
    		spike.body.velocity.y = stage_speed;
    		spike.outOfBoundsKill = true;
	    	spike.checkWorldBounds = true;
	    	spike.anchor.set(0.5);
	    	this.nextSpike = game.time.now + this.spikeRate;

    		// add tween
    		if(seed < 12){
		    	game.add.tween(spike.scale).to({x: 0.2, y:0.2}, 500).to({x: 0.8, y:0.8}, 500).loop().start();
		   	} else {
		    	game.add.tween(spike).to({x: stagePosX*0.3}, 500).to({x: stagePosX*0.8}, 500).loop().start();
		    }

		    return;
    	}

    	stage1 = this.platforms.getFirstExists(false);
	    stage1.reset(stagePosX, stagePosY);
	    stage1.body.velocity.y = stage_speed;
	    stage1.revive();

	    // add a star?
	    if(seed < 6){
	    	star = this.stars.getFirstExists(false);
	    	star.reset(stage1.x+stage1.width/2, stage1.y-20);
	    	star.alpha = 1;
		    star.body.velocity.y = stage_speed*1.5;
		    star.revive();
	    }

	    // gem to slow down
	    if(hud.speed > 100 && seed > 14){
	    	this.gem.reset(stage1.x + stage1.width/2, stage1.y-30);
	    	this.gem.body.velocity.y = stage_speed;
	    	this.gem.revive();
	    }

	    hud.updateScore(10);
    },

    speedUp: function(){
	    this.player.body.gravity.y += 10;
	    this.timer.delay -= 5;
	    hud.speed += 2;
    },

    update: function() {
 		
    	this.bg.tilePosition.y += -1;

    	game.physics.arcade.collide(this.player, this.platforms);
    	game.physics.arcade.overlap(this.player, this.stars, this.collectStar, null, this);
    	game.physics.arcade.overlap(this.player, this.spikes, this.die);
    	game.physics.arcade.overlap(this.player, this.gem, this.collectGem, null, this);

    	this.handleKeys();

    	// dead?
    	if(this.player.y > HEIGHT || this.player.y < 0){
    		this.die();
    	}

    	// left-rigt movement
    	if(this.player.x < 0) this.player.x = game.world.width + this.player.x;
    	if(this.player.x > WIDTH) this.player.x = this.player.x - WIDTH;
    },

    render: function(){},

    die: function(){
    	game.state.start('state_died');
    },

    collectStar: function(player,star){
		var self = this,
			x = star.x, 
			y = star.y;

    	hud.updateScore(50);

	   	self.animStar.reset(x, y);
    	star.kill();
    	self.sndCoin.play();
    	
    	if(self.animStar.anim1){
    		game.tweens.remove(self.animStar.anim1);
    	}
    	self.animStar.alpha = 1;
    	self.animStar.anim1 = game.add.tween(self.animStar).to({ y: y-200,alpha:0 }, 500).start();
    },

    collectGem: function(player, gem){
    	gem.kill();
    	hud.speed = 50;
    	this.timer.delay = 870;
    	this.player.body.gravity.y = 600;
    	this.platforms.setAll("body.velocity.y", -200);
    	this.sndCoin.play();
    },

    handleKeys: function(){
    	var halfWidth = game.world.width/2;

    	//  reset the player's velocity (movement)
	    this.player.body.velocity.x = 0;

	    // keyboard controls
	    if(this.cursors.left.isDown){
	    	this.move_left();
	    	return;
	    }
	    if( this.cursors.right.isDown){
	    	this.move_rigth();
	    	return;
	    }

	    // touch control
	    if (game.input.activePointer.isDown){
		    if (game.input.x < halfWidth) {
		      	//  move to the left
		      	this.move_left();
		    }
		 
		    if (game.input.x > halfWidth) {
		      //  move to the right
		      this.move_rigth();
		    }
		}
		else{
		  //  stand still
		  this.player.animations.stop();
		  this.player.frame = 4;
		}
    },

    move_left: function() {
		this.player.body.velocity.x = -(200 + hud.speed*2);
		this.player.scale.x = -0.5;
		this.player.animations.play('walk');
    },

    move_rigth: function() {
		this.player.body.velocity.x = (200 + hud.speed*2);
		this.player.scale.x = 0.5;
		this.player.animations.play('walk');
    }
};

game.state.add('state_main', state_main);