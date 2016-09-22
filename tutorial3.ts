class Tutorial3 {

    // Size settings
    MAPSIZE:  number = 10;
    TILESIZE: number = 32;
    DELAY:    number = 0.75; // Delay between object spawning in seconds

    // Min max amount of...
    obsts: [number, number] = [4, 7]; // Obstacles
    items: [number, number] = [2, 7]; // Items
    enmys: [number, number] = [1, 3]; // Enemies

    // Object references
    game:           Phaser.Game;
    label:          Phaser.Text;
    label_start:    Phaser.Text;
    map:            Phaser.Tilemap;
    layer_floor:    Phaser.TilemapLayer;
    layer_objects:  Phaser.TilemapLayer;
    layer_question: Phaser.TilemapLayer;

    // Generation variables
    tx:             number; // Currently evaluated tile x
    ty:             number; // Currently evaluated tile y
    count:          number; // Counter for objects
    stage_id:       number; // Currently generating object (stages[stage_id])
    obj_place:      boolean;// When waiting for a delay timer this is false
    checking:       boolean;// If we're currently placing a questionmark or the actual object
    chk_x:          number;
    chk_y:          number;

    stages:  Array<string> = ["floor & walls", "obstacles", "items",
                              "enemies", "player", "exit", "run again? (click)"];

    active: boolean = false;

    constructor() {
        this.game = new Phaser.Game(this.TILESIZE * this.MAPSIZE,
                                   (this.TILESIZE * this.MAPSIZE) + this.TILESIZE,
                                    Phaser.AUTO, 'content',
                                    {preload: this.preload, create: this.create, update: this.update});
        this.startMapGen();
    }

    preload = () => {
        this.game.load.image('spritesheet', 'spritesheet.png');
    }

    create = () => {
        // Tilemap
        let ts: number = this.TILESIZE;
        let ms: number = this.MAPSIZE;
        this.map = this.game.add.tilemap(null, ts, ts, ms, ms);
        this.map.addTilesetImage('spritesheet', null, ts, ts, 0, 0);
        this.layer_floor    = this.map.createBlankLayer('floor', ms*ts, ms*ts, ts, ts);
        this.layer_objects  = this.map.createBlankLayer('objects', ms*ts, ms*ts, ts, ts);
        this.layer_question = this.map.createBlankLayer('question', ms*ts, ms*ts, ts, ts);
        this.layer_question.alpha = 0.25;

        // Label
        let style = { font: "16px PressStart2P-Regular", fill: "#ffffff",
                      align: "center", backgroundColor: "#000000" };
        this.label = this.game.add.text((ms*ts)*0.5, ts*0.5, "", style);
        this.label.anchor.set(0.5);

        // Start label
        if(!this.active){
            this.label_start = this.game.add.text((ms*ts)*0.5, ((ms*ts) + ts)*0.5, "click to start", style);
            this.label_start.anchor.set(0.5);
        }
    }

    update = () => {
        // Wait for player to click before doing anything
        if(!this.active){
            if (this.game.input.mousePointer.isDown){
                this.active = true;
                this.label_start.destroy();
            }
            return;
        }

        this.updateLabel();

        if(!this.obj_place){
            return
        }

        // If we're not in the "run again?" stage gen map
        if(this.stage_id != this.stages.length - 1) {
            this.genMap();
        }
        // else if the mouse is down startMapGen
        else if (this.game.input.mousePointer.isDown) {
            this.startMapGen();
        }
    }

    updateLabel = () => {
        this.label.clearColors();
        this.label.setText(this.stages[this.stage_id]);
    }

    startMapGen = () => {
        // Reset map variables
        this.tx       = 0;
        this.ty       = 1; // 1 as we leave top tiles blank to fit in the label
        this.count, this.stage_id = 0;

        this.obj_place = true;

        if(this.label != null) this.label.setText("");

        if(this.map != null){
            this.map.destroy();
            this.layer_floor.destroy();
            this.layer_objects.destroy();
            this.create();
        }
    }

    genMap = () => {
        this.updateLabel();

        // Floor and Walls
        if(this.stage_id == 0) {
            // Set the tile id to floor (4) unless it's an outer tile
            // Then it's a wall (6)
            let t = 4;
            if (this.tx == 0 || this.ty == 1 ||
                this.tx == this.MAPSIZE - 1 || this.ty == this.MAPSIZE){
                   t = 6;
               }

            // Place tile and increment ty
            this.map.putTile(t, this.tx, this.ty++, this.layer_floor);

            // Reset for tx at the end
            if(this.ty > this.MAPSIZE) {
                this.ty = 1;
                this.tx++;
            }

            // if tx is over the map move onto next stage
            if(this.tx > this.MAPSIZE) {
                this.stage_id++;
                // Set count to a random number between obsts values
                this.count = this.getRandomInt(this.obsts[0], this.obsts[1]);
                // Skip frame so we don't instantly start next stage
                return;
            }
        }

        // Obstacles, Items & Enemies
        if([1,2,3].indexOf(this.stage_id) != -1) {
            // TODO: This is tacked on and messy.
            let x: number;
            let y: number;

            // Place marker at random point
            if(this.checking){
                // Get random tile with a gap from the outer walls
                x = this.getRandomInt(2, this.MAPSIZE - 3);
                y = this.getRandomInt(3, this.MAPSIZE - 3);
                this.chk_x = x;
                this.chk_y = y;
                this.map.putTile(3, x, y, this.layer_question);
                this.checking = false;
                this.setObjDelay();
                return;
            } else {
                this.checking = true;
                this.map.putTile(null, this.chk_x, this.chk_y, this.layer_question)
                if( this.map.getTile(this.chk_x, this.chk_y, this.layer_objects) != null)
                    return;
            }

            // Get what tile we're placing from the stage_id
            // obstacle (5), item (7), enemy (1)
            let tile_id = [5,7,1][this.stage_id - 1];

            this.map.putTile(tile_id, this.chk_x, this.chk_y, this.layer_objects);
            this.setObjDelay();

            if(--this.count <= 0) {
                // When we've placed the amount required, move to next stage and
                // set count to a random number in the limits of the next
                // item to be added
                if(++this.stage_id < 4){
                    let next = [this.items, this.enmys][this.stage_id - 2];
                    this.count = this.getRandomInt(next[0], next[1]);
                }
                return;
            }
        }

        // Player
        if(this.stage_id == 4) {
            this.map.putTile(2, 1, this.MAPSIZE - 1, this.layer_objects);
            this.setObjDelay();
            this.stage_id++;
            return;
        }

        // Exit
        if(this.stage_id == 5) {
            this.map.putTile(0, this.MAPSIZE - 2, 2, this.layer_objects);
            this.setObjDelay();
            this.stage_id++;
            return;
        }
    }

    setObjDelay = () => {
        this.obj_place = false;
        this.game.time.events.add(Phaser.Timer.SECOND * this.DELAY, this.allowPlacement, this);
    }

    allowPlacement = () => {
        this.obj_place = true;
    }

    getRandomInt = (min: number, max: number) => {
          return Math.floor(Math.random() * (max - min + 1)) + min;
    }

}

window.onload = () => {
    let tut3 = new Tutorial3();
};
