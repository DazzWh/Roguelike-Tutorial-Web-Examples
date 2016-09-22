var Tutorial1 = (function () {
    function Tutorial1() {
        var _this = this;
        this.MAPSIZE = 10;
        this.TILESIZE = 32;
        this.DELAY = 0.75;
        this.obsts = [4, 7];
        this.items = [2, 7];
        this.enmys = [1, 3];
        this.stages = ["floor & walls", "obstacles", "items",
            "enemies", "player", "exit", "run again? (click)"];
        this.active = false;
        this.preload = function () {
            _this.game.load.image('spritesheet', 'spritesheet.png');
        };
        this.create = function () {
            var ts = _this.TILESIZE;
            var ms = _this.MAPSIZE;
            _this.map = _this.game.add.tilemap(null, ts, ts, ms, ms);
            _this.map.addTilesetImage('spritesheet', null, ts, ts, 0, 0);
            _this.layer_floor = _this.map.createBlankLayer('floor', ms * ts, ms * ts, ts, ts);
            _this.layer_objects = _this.map.createBlankLayer('objects', ms * ts, ms * ts, ts, ts);
            var style = { font: "16px PressStart2P-Regular", fill: "#ffffff",
                align: "center", backgroundColor: "#000000" };
            _this.label = _this.game.add.text((ms * ts) * 0.5, ts * 0.5, "", style);
            _this.label.anchor.set(0.5);
            if (!_this.active) {
                _this.start_label = _this.game.add.text((ms * ts) * 0.5, ((ms * ts) + ts) * 0.5, "click to start", style);
                _this.start_label.anchor.set(0.5);
            }
        };
        this.update = function () {
            if (!_this.active) {
                if (_this.game.input.mousePointer.isDown) {
                    _this.active = true;
                    _this.start_label.destroy();
                }
                return;
            }
            _this.updateLabel();
            if (!_this.obj_place) {
                return;
            }
            if (_this.stage_id != _this.stages.length - 1) {
                _this.genMap();
            }
            else if (_this.game.input.mousePointer.isDown) {
                _this.startMapGen();
            }
        };
        this.updateLabel = function () {
            _this.label.clearColors();
            _this.label.setText(_this.stages[_this.stage_id]);
        };
        this.startMapGen = function () {
            _this.tx = 0;
            _this.ty = 1;
            _this.count, _this.stage_id = 0;
            _this.obj_place = true;
            if (_this.label != null)
                _this.label.setText("");
            if (_this.map != null) {
                _this.map.destroy();
                _this.layer_floor.destroy();
                _this.layer_objects.destroy();
                _this.create();
            }
        };
        this.genMap = function () {
            _this.updateLabel();
            if (_this.stage_id == 0) {
                var t = 4;
                if (_this.tx == 0 || _this.ty == 1 ||
                    _this.tx == _this.MAPSIZE - 1 || _this.ty == _this.MAPSIZE) {
                    t = 6;
                }
                _this.map.putTile(t, _this.tx, _this.ty++, _this.layer_floor);
                if (_this.ty > _this.MAPSIZE) {
                    _this.ty = 1;
                    _this.tx++;
                }
                if (_this.tx > _this.MAPSIZE) {
                    _this.stage_id++;
                    _this.count = _this.getRandomInt(_this.obsts[0], _this.obsts[1]);
                    return;
                }
            }
            if ([1, 2, 3].indexOf(_this.stage_id) != -1) {
                var tile_id = [5, 7, 1][_this.stage_id - 1];
                var x = void 0;
                var y = void 0;
                while (true) {
                    x = _this.getRandomInt(2, _this.MAPSIZE - 3);
                    y = _this.getRandomInt(3, _this.MAPSIZE - 2);
                    if (_this.map.getTile(x, y, _this.layer_objects) == null)
                        break;
                }
                _this.map.putTile(tile_id, x, y, _this.layer_objects);
                _this.setObjDelay();
                if (--_this.count <= 0) {
                    if (++_this.stage_id < 4) {
                        var next = [_this.items, _this.enmys][_this.stage_id - 2];
                        _this.count = _this.getRandomInt(next[0], next[1]);
                    }
                    return;
                }
            }
            if (_this.stage_id == 4) {
                _this.map.putTile(2, 1, _this.MAPSIZE - 1, _this.layer_objects);
                _this.setObjDelay();
                _this.stage_id++;
                return;
            }
            if (_this.stage_id == 5) {
                _this.map.putTile(0, _this.MAPSIZE - 2, 2, _this.layer_objects);
                _this.setObjDelay();
                _this.stage_id++;
                return;
            }
        };
        this.setObjDelay = function () {
            _this.obj_place = false;
            _this.game.time.events.add(Phaser.Timer.SECOND * _this.DELAY, _this.allowPlacement, _this);
        };
        this.allowPlacement = function () {
            _this.obj_place = true;
        };
        this.getRandomInt = function (min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        };
        this.game = new Phaser.Game(this.TILESIZE * this.MAPSIZE, (this.TILESIZE * this.MAPSIZE) + this.TILESIZE, Phaser.AUTO, 'content', { preload: this.preload, create: this.create, update: this.update });
        this.startMapGen();
    }
    return Tutorial1;
}());
window.onload = function () {
    var tut1 = new Tutorial1();
};
