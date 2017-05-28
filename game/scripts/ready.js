// foo
function foo(a,b){var c=0;if(!window.console||b&&!c)return false;(void 0===a||null===a)&&(a='o_O');var d=(new Date).toUTCString().split(' ')[4];'object'==typeof a?(console.log('['+d+'] object:'),console.dir(a)):console.log('['+d+'] '+a)}
// shuffle
function shuffle(a){for(var c,d,b=a.length;0!==b;)d=Math.floor(Math.random()*b),b-=1,c=a[b],a[b]=a[d],a[d]=c;return a}
// constants
var cnsts = {
	colors: ['#cd8', '#de9'],
	$score: $('.score'),
	$bubble: $('.bubble'),
	rowHeight: 30,
	colWidth: 60,
	rows: 23,
	cols: 7,
	topScore: 99999999999999999999,
	game: {
		height: 300,
		width: 300,
	},
	keys: {
		up: 38,
		down: 40,
		left: 37,
		right: 39
	},
	anims: {
		left: [
			60, 120, 60, 60,
			120, 120, 60, 60,
			60, 120, 60, 60,
			0, 120, 60, 60
		],
		down: [
			60, 180, 60, 60,
			120, 180, 60, 60,
			60, 180, 60, 60,
			0, 180, 60, 60
		],
		up: [
			60, 60, 60, 60,
			120, 60, 60, 60,
			60, 60, 60, 60,
			0, 60, 60, 60
		],
		right: [
			60, 0, 60, 60,
			120, 0, 60, 60,
			60, 0, 60, 60,
			0, 0, 60, 60
		]
	},
	money: {
		width: 60,
		height: 40,
		offsetY: -16,
		offsetX: -1
	},
	group: {
		offsetX: 30,
		offsetY: 15
	},
	dude: {
		width: 60,
		height: 60
	}
}
// variables
var vars = {
	direction: {
		new: 'down',
		changed: 0
	},
	$controls: $('.controls a'),
	muted: false,
	started: false,
	paused: true,
	score: 0,
	tilesMoved: 0,
	sinceMoney: 0,
	money: [{
		x: 1,
		y: 8
	}, {
		x: 5,
		y: 8
	}, {
		x: 5,
		y: 16
	}, {
		x: 1,
		y: 16
	}],
	spawn: {
		x: 3,
		y: 12
	},
	timeouts: {
		bubbleFade: 0,
		scoreUpdate: 0
	}
}
// konva stage
var stage = new Konva.Stage({
	container: 'canvas',
	width: cnsts.game.width,
	height: cnsts.game.height
});
// konva game layer
var gameLayer = new Konva.Layer({
	x: 0,
	y: 0,
	clip: {
		x: 0,
		y: 0,
		width: cnsts.game.width,
		height: cnsts.game.height
	}
});
stage.add(gameLayer);
// konva game group
var gameGroup = new Konva.Group({
	offsetX: 30,
	offsetY: 15
});
var dude = new Konva.Sprite();
// game
var game = {
	setup: function() {
		foo('game.setup',1)
		draw.tiles();
		draw.dude();
		draw.movement();
		$('[data-game="start"]').text('start');
	},
	pause: function() {
		foo('game.pause',1)
		vars.paused = true;
		sounds.mute();
	},
	unPause: function() {
		foo('game.unPause',1)
		vars.paused = false;
		sounds.mute();
		dude.start();
		draw.next();
	},
	play: function() {
		foo('game.play',1)
		vars.paused = false;
		sounds.begin.play();
		setTimeout(
			function() {
				sounds.cat.play('loop');
			}
			,500
		),
		sounds.footsteps.play();
		dude.start();
		draw.next();
	},
	xy: function(object) {
		foo('game.xy',1)
		if (vars.direction.new === 'down') {
			object.y -= 1;
			object.x -= object.y % 2;
		} else if (vars.direction.new === 'up') {
			object.x += object.y % 2;
			object.y += 1;
		} else if (vars.direction.new === 'right') {
			object.y += 1;
			object.x -= object.y % 2;
		} else if (vars.direction.new === 'left') {
			object.x += object.y % 2;
			object.y -= 1;
		}
		return object;
	}
}
// draw
var draw = {
	next: function() {
		foo('draw.next',1)
		draw.tiles();
		draw.movement();
		dude.setAnimation(vars.direction.new);
	},
	tiles: function() {
		foo('draw.tiles',1)
		gameGroup.x(0);
		gameGroup.y(0);
		cnsts.colors.reverse();
		if (!vars.tilesMoved) {
			var startY = -cnsts.rowHeight;
			for (var n = 0; n < cnsts.rows; n++) {
				startY += cnsts.rowHeight / 2;
				for (var m = 0; m < cnsts.cols; m++) {
					var startX = cnsts.colWidth * m + n % 2 * (cnsts.colWidth / 2);
					var poly = new Konva.Line({
						points: [
							startX, startY,
							startX + cnsts.colWidth / 2, startY + cnsts.rowHeight / 2,
							startX, startY + cnsts.rowHeight,
							startX - cnsts.colWidth / 2, startY + cnsts.rowHeight / 2
						],
						name: 'poly poly_' + n + '_' + m,
						fill: cnsts.colors[n % 2],
						closed: true,
						strokeWidth: 2,
						stroke: '#bc7',
						perfectDrawEnabled: false
					});
					gameGroup.add(poly);
				}
			}
			gameLayer.add(gameGroup);
		} else {
			for (var n = 0; n < cnsts.rows; n++) {
				for (var m = 0; m < cnsts.cols; m++) {
					gameLayer.find('.poly_' + n + '_' + m).fill(cnsts.colors[n % 2])
				}
			}
		}
		// spawn
		gameLayer.find('.poly_' + vars.spawn.y + '_' + vars.spawn.x).fill('#fff');
		if (vars.tilesMoved > 0) {
			vars.spawn = game.xy(vars.spawn);
		}
		// money
		gameLayer.find('.money').remove();
		var drawBubble = false;
		var $tiles = [];
		for (var i = 0; i < vars.money.length; i++) {
			var $tile = gameLayer.find('.poly_' + vars.money[i].y + '_' + vars.money[i].x);

			if ($tile.length > 0) {
				$tiles.push($tile);
				var moneyX = $tile[0].attrs.points[0] - cnsts.colWidth + Math.floor((cnsts.colWidth - cnsts.money.width) / 2) + cnsts.money.offsetX + cnsts.group.offsetX;
				var moneyY = $tile[0].attrs.points[1] - cnsts.rowHeight / 2 + cnsts.money.offsetY + cnsts.group.offsetY;
				var money = new Konva.Image({
					x: moneyX,
					y: moneyY,
					image: images['money' + (i + 1)],
					width: cnsts.money.width,
					height: cnsts.money.height,
					opacity: 1,
					name: 'money'
				});
				gameGroup.add(money);
			}

			gameLayer.find('.poly_' + vars.money[i].y + '_' + (vars.money[i].x - 1)).fill('#dea');
			gameLayer.find('.poly_' + vars.money[i].y + '_' + (vars.money[i].x + 1)).fill('#dea');
			gameLayer.find('.poly_' + (vars.money[i].y + 2) + '_' + vars.money[i].x).fill('#dea');
			gameLayer.find('.poly_' + (vars.money[i].y - 2) + '_' + vars.money[i].x).fill('#dea');
			gameLayer.find('.poly_' + (vars.money[i].y - 1) + '_' + (vars.money[i].x - (vars.money[i].y - 1) % 2)).fill('#efc');
			gameLayer.find('.poly_' + (vars.money[i].y + 1) + '_' + (vars.money[i].x + vars.money[i].y % 2)).fill('#efc');
			gameLayer.find('.poly_' + (vars.money[i].y + 1) + '_' + (vars.money[i].x - (vars.money[i].y + 1) % 2)).fill('#efc');
			gameLayer.find('.poly_' + (vars.money[i].y - 1) + '_' + (vars.money[i].x + vars.money[i].y % 2)).fill('#efc');

			if (vars.tilesMoved > 0) {
				vars.money[i] = game.xy(vars.money[i]);
			}
			var score = 0;
			var playerX = Math.ceil(cnsts.cols / 2) - 1;
			var playerY = Math.ceil(cnsts.rows / 2);

			var value = (i+1);
			var multiplier = 0;

			if (vars.money[i].x === playerX && vars.money[i].y === playerY) {
				multiplier = 3;
			}
			if (((vars.money[i].x - 1) === playerX && vars.money[i].y === playerY) || ((vars.money[i].x + 1) === playerX && vars.money[i].y === playerY) || (vars.money[i].x === playerX && (vars.money[i].y - 2) === playerY) || (vars.money[i].x === playerX && (vars.money[i].y + 2) === playerY)) {
				multiplier = 1;
			}
			score = value * multiplier;
			if (score > 0) {
				sounds.pickup.play();
				vars.money[i].x = -1;
				vars.money[i].y = -1;
				var tween = new Konva.Tween({
					node: money,
					y: moneyY - 10,
					duration: 0.25,
					opacity: 0
				});
				tween.play();
				vars.score += score;
				if (vars.score > cnsts.topScore) {
					alert('YOU ARE BORN ANEW.')
					vars.score = 0;
				}
				var html = '<span class="yellow">+ ' + value + '</span>';
				if (multiplier > 1) {
					html += '<span class="xp white">' + multiplier + 'x</span>';
				}
				draw.score(html);
				drawBubble = 'speech';
			}
			if (vars.money[i].x < -1 || vars.money[i].y < -1 || vars.money[i].x === cnsts.cols + 1 || vars.money[i].y === cnsts.rows + 1) {
				var x = 0;
				var y = 0;
				for (var j = 0; j < 1; j++) {
					x = Math.floor(Math.random() * (cnsts.cols + 1));
					y = Math.floor(Math.random() * (cnsts.rows + 1));
					for (var k = 0; k < vars.money.length; k++) {
						if (vars.money[k].x === x && vars.money[k].y === y) {
							j--;
						}
					}
				}
				vars.money[i].x = x;
				vars.money[i].y = y;
			}
		}
		$.each(
			$tiles,
			function(i,el) {
				el.fill('#fff')
			}
		)
		if (drawBubble !== 'speech') {
			vars.sinceMoney++;
			if (vars.sinceMoney === 10) {
				draw.bubble('thought');
			}
		} else {
			draw.bubble('speech');
		}
	},
	score: function(html) {
		foo('draw.score',1)
		var modifier = 1 + vars.score / 1000;
		sounds.cat.rate(modifier)
		sounds.footsteps.rate(modifier)
		cnsts.$score.html(html);
		clearTimeout(vars.timeouts.scoreUpdate);
		vars.timeouts.scoreUpdate = setTimeout(
			function() {
				foo('draw.score.scoreUpdate',1)
				cnsts.$score.html('<span class="xp">XP</span>' + vars.score);
			},
			750
		);
	},
	dude: function() {
		foo('draw.dude',1)
		dude = new Konva.Sprite({
			x: cnsts.game.width / 2 - cnsts.dude.width / 2,
			y: cnsts.game.height / 2 - cnsts.dude.height / 2,
			image: images['dude'],
			animation: vars.direction.new,
			animations: cnsts.anims,
			frameRate: 8,
			frameIndex: 0
		});
		gameLayer.add(dude);
	},
	movement: function() {
		foo('draw.movement',1)
		vars.tilesMoved++;
		var duration = 0.4;
		if (vars.score < 1500) {
			duration -= vars.score / 5000;
		} else {
			duration = 0.002;
		}
		var x;
		var y;
		if (vars.paused) {
			x = 0;
			y = 0;
		} else if (vars.direction.new === 'down') {
			x = -cnsts.colWidth / 2;
			y = -cnsts.rowHeight / 2;
		} else if (vars.direction.new === 'up') {
			x = cnsts.colWidth / 2;
			y = cnsts.rowHeight / 2;
		} else if (vars.direction.new === 'right') {
			x = -cnsts.colWidth / 2;
			y = cnsts.rowHeight / 2;
		} else if (vars.direction.new === 'left') {
			x = cnsts.colWidth / 2;
			y = -cnsts.rowHeight / 2;
		}
		var tween = new Konva.Tween({
			node: gameGroup,
			duration: duration,
			x: x,
			y: y,
			onFinish: function() {
				foo('draw.movement.onFinish',1)
				if (vars.paused) {
					dude.frameIndex(0);
					dude.stop();
				} else {
					draw.next();
				}
			}
		});
		tween.play();
	},
	bubble: function(type) {
		foo('draw.bubble',1)
		clearTimeout(vars.timeouts.bubbleFade);
		vars.sinceMoney = 0;
		var message;
		if (type === 'speech') {
			var exclamation = messages.exclamations[0];
			message = '<span>' + exclamation + '!</span><br>' + messages.speeches[0].split('^').join('<span>') + '!</span>';
			messages.speeches.push(messages.speeches.shift());
			messages.exclamations.push(messages.exclamations.shift());
		} else {
			message =  messages.thoughts[0];
			messages.thoughts.push(messages.thoughts.shift());
		}
		cnsts.$bubble.html('<p>' + message + '</p>').attr('class',type).show();
		vars.timeouts.bubbleFade = setTimeout(
			function() {
				foo('draw.bubble.bubbleFade',1)
				cnsts.$bubble.removeClass(type).hide();
			},
			2000
		);
	}
}
// load
var notLoaded = 2;
var sounds = {
	toLoad: 4,
	begin: new Howl({
		src: [ 'audio/begin.mp3', 'audio/begin.ogg' ],
		volume: 0.5,
		onload: function() {
			foo('sounds.begin.onload',1)
			sounds.loaded();
		}
	}),
	footsteps: new Howl({
		src: [ 'audio/footsteps.mp3', 'audio/footsteps.ogg' ],
		loop: true,
		volume: 0.2,
		onload: function() {
			foo('sounds.footsteps.onload',1)
			sounds.loaded();
		}
	}),
	pickup: new Howl({
		src: [ 'audio/pickup.mp3', 'audio/pickup.ogg' ],
		volume: 0.3,
		onload: function() {
			foo('sounds.pickup.onload',1)
			sounds.loaded();
		}
	}),
	cat: new Howl({
		src: [ 'audio/cat.mp3', 'audio/cat.ogg' ],
		loop: true,
		volume: 0.4,
		sprite: {
			loop: [0, 9950]
		},
		onload: function() {
			foo('sounds.cat.onload',1)
			sounds.loaded();
		}
	}),
	loaded: function() {
		foo('sounds.loaded',1)
		sounds.toLoad--;
		if (!sounds.toLoad) {
			notLoaded--;
			if (!notLoaded){
				game.setup();
			}
		}
	},
	mute: function() {
		foo('sounds.mute',1)
		if (vars.paused) {
			Howler.mute(true);
		} else {
			Howler.mute(vars.muted);
		}
	}
}
var images = {
	dude: 'images/dude.png',
	money1: 'images/money-1.png',
	money2: 'images/money-2.png',
	money3: 'images/money-3.png',
	money4: 'images/money-4.png',
	speech1: 'images/speech-top.png',
	speech2: 'images/speech-bg.png',
	speech3: 'images/speech-bottom.png',
	thought1: 'images/thought-top.png',
	thought2: 'images/thought-bg.png',
	thought3: 'images/thought-bottom.png'
};
// load images iife
(function() {
	foo('iife.loadimages',1)
	var toLoad = 0;
	$.each(
		images,
		function(key, value) {
			if (typeof value !== 'string') return false;
			toLoad++;
			var imageObj = new Image();
			imageObj.src = value;
			imageObj.onload = function() {
				foo('iife.loadimages.' + key,1)
				images[key] = imageObj;
				toLoad--;
				if (!toLoad) {
					notLoaded--;
					if (!notLoaded){
						game.setup();
					}
				}
			};
		}
	);
}());
var page = {
	windowChange: function() {
		foo('page.windowChange',1);
		var $current = 'game';
		if (vars.started) {
			if ($current === 'game' && vars.paused) {
				game.unPause();
			} else if (!vars.paused) {
				game.pause();
			}
		}
	},
	toggleControls: function() {
		foo('page.toggleControls',1);
		vars.$controls.removeClass('active').filter('[id="' + vars.direction.new + '"]').addClass('active');
	}
}
// controls
// go go go
$().ready(function() {
	$(window).on(
		'focusin blur',
		function(e) {
			if (typeof e.target.window === 'object' && e.type === 'blur') {
				game.pause();
			} else if (vars.paused) {
				page.windowChange();
			}
		}
	);
	// bind clicks
	vars.$controls.click(
		function(e) {
			e.preventDefault();
			vars.direction.new = $(this).attr('id');
			page.toggleControls();
		}
	);
	$('.hi').on(
		'click',
		function(e) {
			e.preventDefault();
			$(this).find('.one').remove();
		}
	);
	$('[data-game="start"]').on(
		'click',
		function(e) {
			e.preventDefault();
			var $this = $(this);
			$this.closest('.content').find('.off').removeClass('off');
			$this.parent().remove();
			vars.started = true;
			game.play();
		}
	);
	$('[data-game="mute"]').on(
		'click',
		function(e) {
			e.preventDefault();
			$(this).toggleClass('active');
			vars.muted = !vars.muted;
			sounds.mute();
		}
	);
	// load images
	$.each(
		$('[data-file]'),
		function(i,elem) {
			var $img = $(elem);
			$img.attr('src',$img.attr('data-file'))
		}
	);
	// bind keypress
	$('html').keydown(function(e) {
		var key = e.keyCode;
		var oldDirection = vars.direction.new;
		switch (key) {
			case cnsts.keys.up:
				e.preventDefault();
				vars.direction.new = 'up';
				break;
			case cnsts.keys.down:
				e.preventDefault();
				vars.direction.new = 'down';
				break;
			case cnsts.keys.left:
				e.preventDefault();
				vars.direction.new = 'left';
				break;
			case cnsts.keys.right:
				e.preventDefault();
				vars.direction.new = 'right';
				break;
		}
		if (oldDirection !== vars.direction.new) {
			vars.direction.changed = true;
			page.toggleControls();
		}
	});
});