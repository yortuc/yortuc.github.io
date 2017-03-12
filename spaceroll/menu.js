var state_menu = {
	preload: function() {
		// menu bg
		this.bg = game.add.tileSprite(0, 0, game.world.width, game.world.height, 'starfield');
		this.logo = game.add.sprite(game.world.centerX, 150, 'logo');

		// bg music
		this.sndBg = game.add.sound("bgSound");
	    this.sndBg.loop = true;
	},

	create: function() {
		
		var h = game.world.height*0.4;

		this.logo.anchor.set(0.5);
		this.logo.scale.set(0.9);
		
		game.add.tween(this.logo).to({y: h-70}, 500).to({y: h-50}, 500).loop().start();

		var titleText = this.game.add.text(this.logo.x, h, 
			"yortuc.com",
			{ font: '12px Arial', fill: '#aaa' });
		titleText.anchor.set(0.5);

		var usage;
		if(dev.desktop){
			usage = this.game.add.text(game.world.centerX, h+100,
				"use left and right arrows to move",
				{ font: '22px Arial', fill: '#fff' });	
		} else {
			usage = this.game.add.text(game.world.centerX, h+100,
				"< Tap left to move left\n\nTap right to move right >",
				{ font: '14px Arial', fill: '#fff' });	
		}
		
		usage.anchor.set(0.5);

		var start = this.game.add.text(game.world.centerX, h+180, 
			(dev.desktop ? "Click " : "Tap ") + "to start!",
			{ font: '22px Arial', fill: '#f00' });
		start.anchor.set(0.5);

		// music
	    this.sndBg.play();
	},

	update: function() {
		//
		this.bg.tilePosition.y += -1;

		if(game.input.activePointer.isDown){
			game.state.start('state_main');
		}
	}
};

game.state.add('state_menu', state_menu);