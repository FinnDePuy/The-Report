//import { hide } from "./hide.js";


class Start extends GameLevel {
    constructor() {
        super('start', 'Level');
    }

    preload() {
        this.load.image('floor1', 'assets/green.png');
        this.load.image('cabinetZone', 'assets/RedZone.png');
        this.load.image('hSprite', 'assets/hSprite.png');
        this.load.image('eSprite', 'assets/eSprite.png');
        this.load.image('player', 'assets/player.png');
        this.load.image('speechBubble', 'assets/speechBubble.png');
        this.load.image('cabinet', 'assets/Cabinet.png')
        this.load.spritesheet('icon', 'assets/spritesheet.png', { frameWidth: 100, frameHeight: 100 });
        this.load.json('map', 'map.json');
    }

    onEnter() {
        //let room = this.map.Levels[this.location.r][this.location.c];
        //console.log(room.Doors);
        //console.log(this.location);
        this.chase(0);
        
        this.initializeDoors();
        this.setCollision();

        //hide.hideableObjects = [];
        this.initializeCabinet();

        this.checkMonsterWarning();

        // inputs
        const {LEFT, RIGHT, UP, DOWN, W, A, S, D, C, E, H} = Phaser.Input.Keyboard.KeyCodes;
        this.keys = this.input.keyboard.addKeys({
            left: LEFT,
            right: RIGHT,
            up: UP,
            down: DOWN,
            w: W,
            a: A,
            s: S,
            d: D,
            c: C,
            e: E,
            h: H
        });
    }

    update(time, delta) {

        const {keys} = this; // this.keys

        if (this.playerChased) {
            this.chaseTime += delta;
            if (this.chaseTime > 5000) { // every 5 seconds of chasing, the monster will get closer
                this.chaseTime -= 5000;
                this.updateMonsterLocation();
            }
        }

        if (this.caught && this.player.alpha == 0) {
            this.timeSinceCaught += delta;
            if (this.timeSinceCaught > 5000) { // every 5 seconds of chasing, the monster will get closer
                this.notCaught();
            }
        }
        else {
            // checks if interaction is available
            this.checkHideable();
        }
        
        this.player.setVelocity(0);
        // movement
        if (this.player.alpha == 1) { // if player is not hiding
            if(keys.left.isDown || keys.a.isDown) {
                this.player.setVelocityX(-this.speed);
            }
            if(keys.right.isDown || keys.d.isDown) {
                this.player.setVelocityX(this.speed);
            }
            if(keys.up.isDown || keys.w.isDown) {
                this.player.setVelocityY(-this.speed);
            } 
            if(keys.down.isDown || keys.s.isDown) {
                this.player.setVelocityY(this.speed);
            } 
        }

        // lets the player get chased again
        if(keys.c.isDown) {
            this.chase(1);
        } 
    }



























    setCollision() {
        this.sceneChanged = false; // makes sure scene only changes once
        
        this.physics.add.collider(this.NWall, this.player);
        this.physics.add.collider(this.WWall, this.player);
        this.physics.add.collider(this.EWall, this.player);
        this.physics.add.collider(this.SWall, this.player);

        if(this.NDoor) {
            this.physics.add.collider(this.NDoor, this.player, () => {this.gotoDoor(true, -1, 912, this.h * 0.8);}, null, this);
        }
        if(this.SDoor) {
            this.physics.add.collider(this.SDoor, this.player, () => {this.gotoDoor(true, 1, 912, this.h * 0.12);}, null, this);
        }
        if(this.EDoor) {
            this.physics.add.collider(this.EDoor, this.player, () => {this.gotoDoor(false, 1, this.w * 0.06, 492);}, null, this);
        }
        if(this.WDoor) {
            this.physics.add.collider(this.WDoor, this.player, () => {this.gotoDoor(false, -1, this.w * 0.9, 492);}, null, this);
        }
    }

    gotoDoor(r, l, x, y) {
        if (!this.sceneChanged) {
            this.sceneChanged = true;
            if (r) { // move up or down in the grid when going to a new scene
                this.location.r += l;
            }
            else { // move left or right in the grid when going to a new scene
                this.location.c += l;
            }
            this.playerLocation.x = x;
            this.playerLocation.y = y;
            this.gotoScene('start');
        }
    }

    initializeDoors() {
        let room = this.map.Levels[this.location.r][this.location.c];
        this.createWalls();
        this.NDoor;
        this.WDoor;
        this.EDoor;
        this.SDoor;
        if (room.Doors.N === 1) {
            this.ND = this.createDoor(this.w * 0.45, 0, this.w * 0.1, this.h * 0.075, true, -1);
            this.NDoor = this.physics.add.existing(this.ND, true);
        }
        if (room.Doors.S === 1) {
            this.SD = this.createDoor(this.w * 0.45, this.h * 0.925, this.w * 0.1, this.h * 0.075, true, 1);
            this.SDoor = this.physics.add.existing(this.SD, true);
        }
        if (room.Doors.E === 1) {
            this.ED = this.createDoor(this.w * 0.9625, this.h * 0.425, this.w * 0.0375, this.h * 0.15, false, 1);
            this.EDoor = this.physics.add.existing(this.ED, true);
        }
        if (room.Doors.W === 1) {
            this.WD = this.createDoor(0, this.h * 0.425, this.w * 0.0375, this.h * 0.15, false, -1);
            this.WDoor = this.physics.add.existing(this.WD, true);
        }
    }

    createWalls() {
        // Creates North West East and South walls
        this.NW = this.add.rectangle(0, 0, this.w, this.h * 0.05)
            .setOrigin(0,0)
            .setFillStyle(0x323232);
        this.WW = this.add.rectangle(0, 0, this.w * 0.025, this.h)
            .setOrigin(0,0)
            .setFillStyle(0x323232);
        this.EW = this.add.rectangle(this.w * 0.975, 0, this.w * 0.025, this.h)
            .setOrigin(0,0)
            .setFillStyle(0x323232);
        this.SW = this.add.rectangle(0, this.h * 0.95, this.w, this.h * 0.05)
            .setOrigin(0,0)
            .setFillStyle(0x323232);
        this.NWall = this.physics.add.existing(this.NW, true);
        this.WWall = this.physics.add.existing(this.WW, true);
        this.EWall = this.physics.add.existing(this.EW, true);
        this.SWall = this.physics.add.existing(this.SW, true);
    }

    createDoor(x1, y1, x2, y2/*, row_change, location_change*/) {
        let r = this.add.rectangle(x1, y1, x2, y2)
            .setOrigin(0, 0)
            .setFillStyle(0x42280E);
        return r;
    }





    














    checkHideable() {
        for (let i = 0; i < this.hideableObjects.length; i++) {
            let object = this.hideableObjects[i];
            if (this.isOverlap(this.player, object.zoneObject)) {
                if (object.hSprite.alpha === 0) {
                    object.hSprite.setAlpha(1);
                    
                    // start tween
                    this.hTween = this.tweens.add({
                        targets: object.hSprite,
                        y: '-=10', // move up 10 pixels
                        ease: 'Power1',
                        duration: 500,
                        repeat: -1, // Repeat forever
                        repeatDelay: 500,
                        yoyo: true 
                    });
                }
                return true;
            }
            else {
                if (object.hSprite.alpha === 1) {
                    object.hSprite.setAlpha(0); // hSprite disappears
                    object.hSprite.y = object.hidingObject.y;  // return hSprite to starting location
                    this.hTween.stop(); // stop hSprite tween bounce
                } 
                //fixing the out of hiding bug
                if (object.hSprite.alpha === 0){
                    this.player.setAlpha(1);
                    this.cameras.main.setBackgroundColor('#444');
                }

                //fixing the out of hiding bug
                if (object.hSprite.alpha === 0){
                    this.player.setAlpha(1);
                    this.cameras.main.setBackgroundColor('#444');
                }
            }
        }
        return false;
    }

    createHideableObject(object, zone, h, x, y) {
        let hidingO = this.add.image(x, y, object).setScale(2);
        let zoneO = this.add.image(x, y + 100, zone).setAlpha(0).setScale(0.8, 1);
        let hSpr = this.add.image(x + 150, y, h).setAlpha(0);
        if(x > this.w * 0.8){
            hSpr.x -= 290;
        }
        return { 
            hidingObject : hidingO, // object asset
            zoneObject : zoneO, // zone around object in which players can interact
            hSprite : hSpr // shows player they can press h when in the zone
        };
    }

    initializeCabinet() {
        let cabinet = this.map.Levels[this.location.r][this.location.c].Cabinets;
        if (cabinet) {
            for (let i = 0; i < cabinet.length; i++) {
                this.hideableObjects.push(this.createHideableObject('cabinet', 'cabinetZone', 'hSprite', cabinet[i].x, cabinet[i].y));
                this.physics.add.collider(this.physics.add.existing(this.hideableObjects[i].hidingObject, true), this.player);
            }
        }
        this.input.keyboard.on('keydown-' + 'H', () => { 
            if(this.checkHideable()) {
                if(this.player.alpha == 0) {
                    this.player.setAlpha(1);
                    this.cameras.main.setBackgroundColor('#444');
                }
                else {
                    this.player.setAlpha(0);
                    this.cameras.main.setBackgroundColor('#212121');
                }
            }
        });
    }


    //checks if player and zone are overlapping
    isOverlap(player, zone){
        var bound1 = player.getBounds();
        var bound2 = zone.getBounds();
        return Phaser.Geom.Intersects.RectangleToRectangle(bound1, bound2);
    }
}





















































const game = new Phaser.Game({
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1920,
        height: 1080
    },
    physics: {
        default: 'arcade',
        //arcade: { debug: true }
    },
    backgroundColor: 0x212121,
    scene: [Start],
    title: "Chase",
});