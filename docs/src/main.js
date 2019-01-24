// phina.js をグローバル領域に展開
phina.globalize();

var ASSETS = {
  image: {
    'rail': './img/rail.png',
    'ship': './img/ship.png',
  },
};

class MathHelper {

	static max(a, b) {
		return a < b ? b : a;
	}

	static min(a, b) {
		return a < b ? a : b;
	}

	static wrap(v, min, max) {
		const length = max - min;
		const v2 = v - min;
		if (0 <= v2) {
			return min + (parseInt(v2) % parseInt(length));
		}
		return min + (length + (v2 % length)) % length;
	}

	static clamp(v, min, max) {
		if (v < min) return min;
		if (max - 1 < v) return max - 1;
		return v;
	}

	static lerp(a, b, t) {
		return a + (b - a) * t;
	}

	static tForLerp(a, b) {
		if (b <= 0) return 1;
		return a / b;
	}

	static isLerpEnd(t) {
		return 1 <= t;
	}

	static isInRange(v, min, max) {
		return min <= v && v < max;
	}
}

function assertEq(a, b) {
	if (a === b) return;
	const n = 0;
//	throw "assert " + a + " vs " + b;
}

assertEq(0, MathHelper.wrap(3, 0, 3));
assertEq(2, MathHelper.wrap(2, 0, 3));
assertEq(1, MathHelper.wrap(1, 0, 3));
assertEq(2, MathHelper.wrap(-1, 0, 3));
assertEq(1, MathHelper.wrap(-2, 0, 3));
assertEq(0, MathHelper.wrap(-3, 0, 3));
assertEq(2, MathHelper.wrap(-4, 0, 3));
assertEq(1, MathHelper.wrap(-5, 0, 3));

class SmokeHelper {
	static update(scene, smoke) {
		const t = MathHelper.tForLerp(smoke.elapsedTime, smoke.endTime);
		const radius = MathHelper.lerp(smoke.startRadius, smoke.endRadius, t);
		const alpha = MathHelper.lerp(smoke.startAlpha, smoke.endAlpha, t);
		smoke.sprite.radius = radius;
		smoke.sprite.alpha = alpha;
		smoke.isActive &= !MathHelper.isLerpEnd(t);
		smoke.elapsedTime += scene.app.ticker.deltaTime;
		const dt = scene.app.ticker.deltaTime / 1000;
		smoke.sprite.x += smoke.force.x * dt;
		smoke.sprite.y += smoke.force.y * dt;
		let v1 = smoke.force.clone().mul(-1).normalize();
		let minLen = smoke.force.length();
		let len = MathHelper.min(10 * dt, minLen);
		v1.mul(len);
		smoke.force.add(v1);
	}
}

class FireHelper {
	static update(scene, smoke) {
		const t = MathHelper.tForLerp(smoke.elapsedTime, smoke.endTime);
		const radius = MathHelper.lerp(smoke.startRadius, smoke.endRadius, t);
		const alpha = MathHelper.lerp(smoke.startAlpha, smoke.endAlpha, t);
		smoke.sprite.radius = radius;
		smoke.sprite.alpha = alpha;
		smoke.isActive &= !MathHelper.isLerpEnd(t);
		smoke.elapsedTime += scene.app.ticker.deltaTime;
	}
}

class PlayerHelper {
}

class Vector2Helper {
	static isZero(v) {
		return v.x === 0 && v.y === 0;
	}
	static copyFrom(a, b) {
		a.x = b.x;
		a.y = b.y;
	}
}

const StateId = {
	S1I: 10,
	S1: 11,
	S2: 20,
	S3I: 30,
	S3: 40,
}

// MainScene クラスを定義
phina.define('MainScene', {
  superClass: 'DisplayScene',
  init: function(options) {
    this.superInit(options);
		// 背景色を指定
		this.backgroundColor = '#ffffff';

		this.baseRailBlocks1 = [
			{
				block: [
					[ 0, 1, 0 ],
					[ 0, 0, 1 ],
					[ 1, 1, 0 ],
					[ 1, 0, 1 ],
					[ 0, 1, 0 ],
					[ 0, 0, 1 ],
					[ 1, 1, 0 ],
					[ 1, 0, 1 ],
				]
			},
		];
		this.baseRailBlocks = [
			{
				block: [
					[ 1, 1, 1 ],
					[ 1, 1, 1 ],
					[ 1, 1, 1 ],
					[ 1, 1, 1 ],
					[ 1, 1, 1 ],
					[ 1, 1, 1 ],
					[ 1, 1, 1 ],
					[ 1, 1, 1 ],
					[ 1, 1, 1 ],
					[ 1, 1, 1 ],
					[ 1, 1, 1 ],
					[ 1, 1, 1 ],
					[ 1, 1, 1 ],
					[ 1, 1, 1 ],
					[ 1, 1, 1 ],
					[ 1, 1, 1 ],
					[ 1, 1, 1 ],
				]
			},
			{
				block: [
					[ 1, 1, 1 ],
					[ 1, 1, 1 ],
					[ 1, 0, 1 ],
					[ 1, 0, 1 ],
					[ 1, 0, 1 ],
					[ 1, 0, 1 ],
					[ 1, 0, 1 ],
					[ 1, 0, 1 ],
					[ 1, 0, 1 ],
					[ 1, 0, 1 ],
					[ 1, 1, 1 ],
					[ 1, 1, 1 ],
				]
			},
			{
				block: [
					[ 1, 1, 1 ],
					[ 1, 1, 1 ],
					[ 1, 1, 1 ],
					[ 1, 1, 1 ],
					[ 0, 1, 0 ],
					[ 0, 1, 0 ],
					[ 0, 1, 0 ],
					[ 0, 1, 0 ],
					[ 0, 1, 0 ],
					[ 0, 1, 0 ],
					[ 0, 1, 0 ],
					[ 0, 1, 0 ],
					[ 0, 1, 0 ],
					[ 0, 1, 0 ],
					[ 0, 1, 0 ],
					[ 0, 1, 0 ],
					[ 0, 1, 0 ],
					[ 1, 1, 1 ],
				]
			},
			{
				block: [
					[ 1, 1, 1 ],
					[ 1, 1, 1 ],
					[ 1, 1, 1 ],
					[ 1, 1, 1 ],
					[ 1, 1, 0 ],
					[ 1, 1, 0 ],
					[ 1, 1, 0 ],
					[ 1, 1, 0 ],
					[ 1, 1, 0 ],
					[ 1, 1, 0 ],
					[ 1, 1, 0 ],
					[ 1, 1, 0 ],
					[ 1, 1, 0 ],
					[ 1, 1, 0 ],
					[ 1, 1, 0 ],
					[ 1, 1, 0 ],
					[ 1, 1, 0 ],
					[ 1, 1, 1 ],
				]
			},
			{
				block: [
					[ 1, 1, 1 ],
					[ 1, 1, 1 ],
					[ 1, 1, 1 ],
					[ 1, 1, 1 ],
					[ 0, 1, 1 ],
					[ 0, 1, 1 ],
					[ 0, 1, 1 ],
					[ 0, 1, 1 ],
					[ 0, 1, 1 ],
					[ 0, 1, 1 ],
					[ 0, 1, 1 ],
					[ 0, 1, 1 ],
					[ 0, 1, 1 ],
					[ 0, 1, 1 ],
					[ 0, 1, 1 ],
					[ 0, 1, 1 ],
					[ 0, 1, 1 ],
					[ 0, 1, 1 ],
				]
			},
			{
				block: [
					[ 1, 1, 1 ],
					[ 1, 1, 1 ],
					[ 1, 1, 1 ],
					[ 0, 1, 1 ],
					[ 0, 1, 1 ],
					[ 1, 1, 0 ],
					[ 1, 1, 0 ],
					[ 1, 1, 1 ],
					[ 1, 1, 1 ],
				]
			},
		];
		this.railBlock = [];

		this.railPool = [];
		this.rails = [];


		{
			const layer = DisplayElement();
			layer.addChildTo(this);
			this.layer0 = layer;
		}

		{
			const layer = DisplayElement();
			layer.addChildTo(this);
			this.layer1 = layer;
		}


		const data = {
			smokeArr: [],
			fireArr: [],
			blastArr: [],
			config: {
				drawHeight: 8,
			},
			progress: {
				state: StateId.S1I,
				stateTime: 0,
				elapsedTime: 0,
				limitTime: 1000 * 60,
				mapI: 0,
				blockI: 0,
			},
		};

		{
			const sprite = Sprite("ship");
			sprite.width = 48;
			sprite.height = 48;
			sprite.x = 120;
			sprite.y = 320 * 3 / 4;
			sprite.priority = 3;
			sprite.addChildTo(this.layer1);

			data.player = {
				score: 0,
				railX: 0,
				sprite: sprite,
				smokeInterval: 200,
				smokeTime: 0,
				fireInterval: 500,
				fireTime: 0,
			};
		}

    // ラベルを生成
		{
			const label = Label({
				originX: 0.5,
				originY: 0,
				fontSize: 8,
				lineHeight: 2,
				align: 'left',
				fill: '#ffffff',
				stroke: '#000000',
				strokeWidth: 4,
			}).addChildTo(this);
			label.x = 8;
			label.y = 0;
			this.label = label;
		}
		{
			const label = Label({
				originX: 0.5,
				originY: 0.5,
				fontSize: 8,
				lineHeight: 2,
				align: 'center',
				fill: '#ffffff',
				stroke: '#000000',
				strokeWidth: 4,
			}).addChildTo(this);
			label.x = 240 * 0.5;
			label.y = 320 * 0.5;
			label.text = "hkt6";
			this.centerLabel = label;
		}
		this.data = data;
  },

	createSmoke: function(pos) {
		const sprite = CircleShape({
			width: 32,
			height: 32,
			fill: '#ff0',
			strokeWidth: 0,
		});
		sprite.alpha = 0.2;
		sprite.x = pos.x;
		sprite.y = pos.y;
		sprite.priority = 1;
		sprite.addChildTo(this.layer1);

		let forceX = Math.randfloat(-1, 1) * 10;
		let forceY = Math.randfloat(-1, 1) * 10;

		const smoke = {
			isActive: true,
			sprite: sprite,
			force: Vector2(forceX, forceY),
			startRadius: 16,
			endRadius: 48,
			startAlpha: 0.5,
			endAlpha: 0,
			elapsedTime: 0,
			endTime: 5000,
		};
		this.data.smokeArr.push(smoke);
		return smoke;
	},

	createFire: function(pos, radius) {
		const sprite = CircleShape({
			radius: radius,
			fill: '#f00',
			strokeWidth: 0,
		});
		sprite.alpha = 1;
		sprite.x = pos.x;
		sprite.y = pos.y;
		sprite.priority = 2;
		sprite.addChildTo(this.layer1);
		const fire = {
			isActive: true,
			sprite: sprite,
			startRadius: radius,
			endRadius: radius * 1.2,
			startAlpha: 1,
			endAlpha: 0.5,
			elapsedTime: 0,
			endTime: 300,
		};
		this.data.fireArr.push(fire);
		return fire;
	},

	getAppInput: function() {
		const key = this.app.keyboard;
		const appInput = {};
		const speed = 1;
		const dir = phina.geom.Vector2(0, 0);
		if (key.getKey('left'))  { dir.x -= speed; }
		if (key.getKey('right')) { dir.x += speed; }
		if (key.getKey('down'))  { dir.y += speed; }
		if (key.getKey('up'))    { dir.y -= speed; }
		appInput.dir = dir.normalize();
		appInput.putSmoke = key.getKey('z');
		appInput.putFire = key.getKey('x');
		return appInput;
	},

	loadBlock: function(lines) {
		const progress = this.data.progress;
		// const nextBlockI = MathHelper.wrap(progress.blockI, 0, this.baseRailBlocks.length);
		const nextBlockI = parseInt(Math.random() * this.baseRailBlocks.length);//  MathHelper.wrap(progress.blockI, 0, this.baseRailBlocks.length);

		progress.blockI++;
		const nextBlock = this.baseRailBlocks[nextBlockI].block;
		for (let i = 0, iMax = nextBlock.length; i < iMax; i++) {
			lines.push(nextBlock[i]);
		}
	},

	update: function() {
		const appInput = this.getAppInput();

		const player = this.data.player;
		const speed1 = appInput.putSmoke ? 100 : 200;
		const speed = speed1 * this.app.ticker.deltaTime / 1000;


		const progress = this.data.progress;
		switch (progress.state) {
			case StateId.S1I:
				this.centerLabel.text = "READY";
				progress.elapsedTime = 0;
				player.score = 0;
				player.railX = 1;
				{
					var tx = (240 / 3) * (player.railX + 0.5);
					player.sprite.y = 320 - 40;
					player.sprite.x = tx;
				}
				progress.blockI = 0;
				this.layer0.y = 0;
				this.railBlock.splice(0, this.railBlock.length);
				this.railBlock = [
					[ 1, 1, 1 ],
					[ 1, 1, 1 ],
					[ 1, 1, 1 ],
					[ 1, 1, 1 ],
					[ 1, 1, 1 ],
					[ 1, 1, 1 ],
					[ 1, 1, 1 ],
					[ 1, 1, 1 ],
					[ 1, 1, 1 ],
					[ 1, 1, 1 ],
					[ 1, 1, 1 ],
					[ 1, 1, 1 ],
					[ 1, 1, 1 ],
					[ 1, 1, 1 ],
					[ 1, 1, 1 ],
					[ 1, 1, 1 ],
					[ 1, 1, 1 ],
				];
				while (this.railBlock.length < 16) {
					this.loadBlock(this.railBlock);
				}
				progress.stateTime = 0;
				progress.state = StateId.S1;
				break;
			case StateId.S1:
				if (2000 < progress.stateTime) {
					this.centerLabel.text = "";
					progress.state = StateId.S2;
				}
				break;
			case StateId.S2:
				// レール進行.
				{
					let railSpeed = 3;
					if (player.sprite.y < 320 * 3 / 4) {
						var rate = 320 * 3 / 4;
						railSpeed += 4 * (rate - player.sprite.y) / rate;
					}
					const dy = railSpeed * 60 * this.app.ticker.deltaTime / 1000;
					this.layer0.y += dy;
					player.score += dy;
				}
				// 操作.
				{
					var tx = (240 / 3) * (player.railX + 0.5);
					var dx = (tx - player.sprite.x);
					if (!Vector2Helper.isZero(appInput.dir)) {
						if (dx * dx < 1) {
							if (appInput.dir.x < 0) {
								player.railX = MathHelper.clamp(player.railX - 1, 0, 3);
							} else if (0 < appInput.dir.x) {
								player.railX = MathHelper.clamp(player.railX + 1, 0, 3);
							}
						}
						player.sprite.y += appInput.dir.y * speed;
						//this.layer0.y -= appInput.dir.y * speed;
						//player.sprite.rotation = appInput.dir.toDegree();
					}
					var deltaX = dx * 10 * this.app.ticker.deltaTime / 1000;
					player.sprite.x += deltaX;
				}
				{
					const chip = this.getChip(player.railX, player.sprite.y);
					if (chip === 0) {
						progress.state = StateId.S3I;
					}
				}

				progress.elapsedTime = Math.min(progress.elapsedTime + this.app.ticker.deltaTime, progress.limitTime);
				const t = progress.elapsedTime / progress.limitTime;
				if (1 <= t) {
					progress.state = StateId.S3I;
				}
				if (this.app.keyboard.getKeyDown('r')) {
					progress.state = StateId.S1I;
				}
				if (this.app.keyboard.getKeyDown('t')) {
					progress.elapsedTime = progress.limitTime - 2000;
				}
				break;
			case StateId.S3I:
				progress.state = StateId.S3;
				this.centerLabel.text = "GAME OVER\nPRESS Z KEY";
				progress.stateTime = 0;
				break;
			case StateId.S3:
				if (this.app.keyboard.getKeyDown('z')) {
					progress.state = StateId.S1I;
				}
				break;
		}
		progress.stateTime += this.app.ticker.deltaTime;


		this.label.text = "";

		{
			const chip = this.getChip(player.railX, player.sprite.y);
			if (chip === 0) {
				this.label.text += 'x ';
			}
		}

		// レール.
		{
			var railBlock = this.railBlock;
			var rails = this.rails;
			var railPool = this.railPool;

			for (let i = 0; i < this.rails.length; i++) {
				const item = rails[i];
				item.visible = false;
				railPool.push(item);
			}
			this.rails.splice(0, this.rails.length);

			const drawHeight = this.data.config.drawHeight;
			const drawHeight2 = drawHeight * 2;
			const yiOffset0 = this.getCellPosY(this.layer0.y);
			let yiOffset = yiOffset0;
			if (drawHeight <= yiOffset) {
				progress.mapI = yiOffset;

				const nextRailBlock = [];

				while (nextRailBlock.length < drawHeight2) {
					this.loadBlock(nextRailBlock);
				}

				for (let i = 0, iMax = railBlock.length - drawHeight; i < iMax; i++) {
					nextRailBlock.push(railBlock[i]);
				}
				this.railBlock = railBlock = nextRailBlock;

				this.layer0.y -= yiOffset0 * 48;
				yiOffset = 0;
			}
//			this.label.text += "" + yiOffset + " " + Math.round(this.layer0.y) + " ";

			for (let yi = 0; yi < drawHeight2; yi++) {
				for (let xi = 0; xi < 3; xi++) {
					const mapY = railBlock.length - drawHeight2 + yi - 1;
					if (!MathHelper.isInRange(mapY, 0, railBlock.length)) continue; 
					const chip = railBlock[mapY][xi];


					const sprX = 240 / 3 * (xi + 0.5);
					const sprY = 48 * (yi - drawHeight);

					if (chip !== 1) continue;

					let sprite = null;
					if (railPool.length <= 0) {
						sprite = Sprite('rail');
						sprite.addChildTo(this.layer0);
						sprite.width = 48;
						sprite.height = 48;
					} else {
						sprite = railPool.pop();
						sprite.visible = true;
					}
					rails.push(sprite);
					sprite.x = sprX;
					sprite.y = sprY;
				}
			}
		}

		this.label.text +=
			'TIME ' + (Math.max(0, progress.limitTime - progress.elapsedTime) / 1000).toFixed(2) + " " +
			'SCORE ' + Math.floor(player.score) +
			'';

		// sort
		this.layer1.children.sort((a, b) => {
			return a.priority - b.priority;
		});
	},

	getCellPosY: function(a, b) {
		const c = 48;
		const geta = 100;
		return Math.floor((a + c * geta)/ c) - geta;
	},

	getChip: function(railX, y) {
		y -= this.layer0.y;
		const railBlock = this.railBlock;
		const drawHeight = this.data.config.drawHeight;
		const yi = this.getCellPosY(y) + drawHeight;
		const mapY = railBlock.length - (this.data.config.drawHeight * 2) + yi; // - 1;
		if (!MathHelper.isInRange(mapY, 0, railBlock.length)) return 0; 
		const chip = railBlock[mapY][railX];
		return chip;
	},
});

// メイン処理
phina.main(function() {
  // アプリケーション生成
  let app = GameApp({
    startLabel: 'main', // メインシーンから開始する
		fps: 60,
		width: 240,
		height: 320,
    assets: ASSETS,
  });
  // アプリケーション実行
  app.run();
});

