var stages = {
	preload: function() {},

	create: function() {
		// menu bg
		this.bg = game.add.tileSprite(0, 0, game.world.width, game.world.height, 'starfield');

		var logo = game.add.sprite(game.world.centerX, 50, 'logo');
		logo.anchor.set(0.5);
		logo.scale.set(0.5);
		var h = game.world.height*0.4;

		var titleText = this.game.add.text(logo.x, h, 
			"yortuc.com © 2014",
			{ font: '12px Arial', fill: '#aaa' });
		titleText.anchor.set(0.5);
	},

	update: function() {}
}