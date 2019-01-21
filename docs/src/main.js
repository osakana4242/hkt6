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
}

function assertEq(a, b) {
	if (a === b) return;
	throw "assert " + a + " vs " + b;
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

// MainScene クラスを定義
phina.define('MainScene', {
  superClass: 'DisplayScene',
  init: function(options) {
    this.superInit(options);
    // 背景色を指定
    this.backgroundColor = '#ffffff';
    // ラベルを生成
		{
			const label = Label('Hello, phina.js!').addChildTo(this);
			label.x = 0;
			label.y = 0;
			label.originX = 0;
			label.originY = 0;
			label.fontSize = 8;
			label.fill = 'white'; // 塗りつぶし色
//    this.label.x = this.gridX.center(); // x 座標
//    this.label.y = this.gridY.center(); // y 座標
//    this.label.fill = 'white'; // 塗りつぶし色
			this.label = label;
		}


		this.railBlock = [
			[ 1, 0, 1 ],
			[ 1, 1, 1 ],
			[ 1, 1, 1 ],
			[ 0, 1, 1 ],
			[ 0, 1, 1 ],
			[ 1, 1, 0 ],
			[ 1, 1, 0 ],
			[ 1, 1, 1 ],
			[ 1, 1, 1 ],
		];

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
				railX: 0,
				sprite: sprite,
				smokeInterval: 200,
				smokeTime: 0,
				fireInterval: 500,
				fireTime: 0,
			};
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

	update: function() {
		const appInput = this.getAppInput();

		const player = this.data.player;
		const speed1 = appInput.putSmoke ? 100 : 200;
		const speed = speed1 * this.app.ticker.deltaTime / 1000;
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
			//player.sprite.rotation = appInput.dir.toDegree();
		}
		var deltaX = dx * 10 * this.app.ticker.deltaTime / 1000;
		player.sprite.x += deltaX;


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

			let railSpeed = 3;
			if (player.sprite.y < 320 * 3 / 4) {
				var rate = 320 * 3 / 4;
				railSpeed += 4 * (rate - player.sprite.y) / rate;
			}
			this.layer0.y += railSpeed * 60 * this.app.ticker.deltaTime / 1000;

			const yiOffset = parseInt(this.layer0.y / 48);
			for (let yi = 0; yi < railBlock.length; yi++) {
				for (let xi = 0; xi < 3; xi++) {
					const yi2 = yi - yiOffset - 1;
					const mapY = MathHelper.wrap(yi2, 0,  railBlock.length);
					if (railBlock[mapY][xi] !== 1) continue;

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
					sprite.x = 240 / 3 * (xi + 0.5);
					sprite.y = 48 * yi2;
				}
			}
		}


		// smoke.
		player.smokeTime = MathHelper.min(player.smokeTime + this.app.ticker.deltaTime, player.smokeInterval);
		if (appInput.putSmoke) {
			if (player.smokeInterval <= player.smokeTime) {
				player.smokeTime = 0;
				let v1 = Vector2();
				v1.fromDegree(player.sprite.rotation + 180, 16);
				v1.add(player.sprite);
				this.createSmoke(v1);
			}
		}

		this.label.text = "S " + player.smokeTime + " F " + player.fireTime;

		// fire
		player.fireTime = MathHelper.min(player.fireTime + this.app.ticker.deltaTime, player.fireInterval);
		if (appInput.putFire) {
			if (player.fireInterval <= player.fireTime) {
				player.fireTime = 0;
				let v1 = Vector2();
				v1.fromDegree(player.sprite.rotation, 32);
				v1.add(player.sprite);
				this.createFire(v1, 8);
			}
		}

		{
			const fireArr = this.data.fireArr;
			const smokeArr = this.data.smokeArr;
			const hitArr = [];
			for (let i1 = 0; i1 < fireArr.length; i1++) {
				const fire = fireArr[i1];
				for (let i2 = 0; i2 < smokeArr.length; i2++) {
					const smoke = smokeArr[i2];
					if (!fire.sprite.hitTestElement(smoke.sprite)) continue;
					hitArr.push({
						"fire": fire,
						"smoke": smoke,
					});
				}
			}
			for (let i = 0; i < hitArr.length; i++) {
				const hit = hitArr[i];
				const fire = hit.fire;
				const smoke = hit.smoke;
				if (!fire.isActive) continue;
				if (!smoke.isActive) continue;
				this.createFire(smoke.sprite, smoke.sprite.radius);
				smoke.isActive = false;
			}
		}

		{
			const fireArr = this.data.fireArr;
			for (let i = 0; i < fireArr.length; i++) {
				const fire = fireArr[i];
				FireHelper.update(this, fire);
			}
		}
		{
			const fireArr = this.data.fireArr;
			for (let i = fireArr.length - 1; 0 <= i; i--) {
				const fire = fireArr[i];
				if (fire.isActive) continue;
				fire.sprite.remove();
				fireArr.splice(i, 1);
			}
		}
		{
			const smokeArr = this.data.smokeArr;
			for (let i = 0; i < smokeArr.length; i++) {
				const smoke = smokeArr[i];
				SmokeHelper.update(this, smoke);
			}
		}
		{
			const smokeArr = this.data.smokeArr;
			for (let i = smokeArr.length - 1; 0 <= i; i--) {
				const smoke = smokeArr[i];
				if (smoke.isActive) continue;
				smoke.sprite.remove();
				smokeArr.splice(i, 1);
			}
		}

		// sort
		this.layer1.children.sort((a, b) => {
			return a.priority - b.priority;
		});
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
