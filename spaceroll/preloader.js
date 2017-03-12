var state_preloader = {

	preload: function () {
		this.lblStatus = game.add.text(game.world.centerX, 100, '...', { fill: '#fff' });
		this.lblStatus.anchor.setTo(0.5,0.5);

		game.load.onLoadStart.add(this.loadStart, this);
    	game.load.onFileComplete.add(this.fileComplete, this);
    	game.load.onLoadComplete.add(this.loadComplete, this);

    	// load assets
		game.load.image('bgstars', 'assets/bgstars.png');
	    game.load.image('star', 'assets/star.png');
	    game.load.image('spikes', 'assets/spikes_2.png');
	   	game.load.image('pause', 'assets/pause.png');
	    game.load.image('starfield', 'assets/starfield.jpg');
	    game.load.atlas('player', 'assets/p1_walk.png', 'assets/p1_walk.json' );
		game.load.image('logo', 'assets/logo.png');
		game.load.image('gem_blue', 'assets/hud_gem_blue.png');
		game.load.image('platform', 'assets/platform2.png');
		game.load.image('diebg', 'assets/diebg.png');

		game.load.audio('coin', 'assets/coin.wav');
		game.load.audio('bgSound', ['assets/loop4.mp3', 'assets/loop4.wav']);

		// fit screen
		game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL; 
		game.scale.setShowAll();
		game.scale.refresh();
	},

	loadStart: function(){
		this.lblStatus.text = "loading...";
	},

	loaded: 0,

	fileComplete: function(){
		this.loaded++;
		this.lblStatus.text = "loading... (%" + parseInt(100*this.loaded/12).toString() +")";
	},

	loadComplete:function(){
		this.lblStatus.text = "loaded...";
		game.state.start('state_menu');
	},

	create: function(){},

	update: function(){}
}
game.state.add('state_preloader', state_preloader);

game.state.start('state_preloader');