//import { hide } from "./hide.js";


class Start extends GameLevel {
    constructor() {
        super('start', 'Level');
    }

    preload() {
        //this.load.image('floor1', 'assets/green.png');
        this.load.image('cabinetZone', 'assets/RedZone.png');
        this.load.image('picture', 'assets/Picture.png');
        this.load.image('phone', 'assets/Phone.png');
        this.load.image('note', 'assets/Note.png');
        this.load.image('hSprite', 'assets/hSprite.png');
        this.load.image('eSprite', 'assets/eSprite.png');
        this.load.image('player', 'assets/player.png');
        this.load.image('speechBubble', 'assets/speechBubble.png');
        this.load.image('cabinet', 'assets/Cabinet.png');
        this.load.image('cabinet2', 'assets/Cabinet2.png');
        this.load.spritesheet('icon', 'assets/spritesheet.png', { frameWidth: 100, frameHeight: 100 });
        this.load.json('map', 'map.json');
        this.load.image('floor1', 'assets/BG_FLOOR_1.png');
        this.load.image('floor2', 'assets/blue.png');
        this.load.image('border1', 'assets/BG_BORDER_1.png');
    }

    onEnter() {
        //let room = this.map.Levels[this.location.r][this.location.c];
        //console.log(room.Doors);
        //console.log(this.location);
        this.chase(0);
        
        this.initializeDoors();
        this.setCollision();

        this.initializeCabinet();

        this.initializeItemLocations();
        this.initializeItem();
        this.displayInventory();

        this.checkMonsterWarning();

        // //super basic implementation
        // //creates an intem adds to the inventory instantly then displays what you have collected
        // let note = this.createItem('note', 175, 200, 'The First Note');
        // //adds the created item into the findableobjects list to be tracked for collision later
        // this.findableObjects.push(note);
        // //prints to make sure we got the item
        // console.log(this.findableObjects[0].itemName);
        // //adds the item to the player inventory at this.inventory
        // this.pickUpItem(note);
        // //displays the item with the characters face at the bottom
        // this.displayItem(note);



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

        if(this.item != null) {
            if(this.item.itemImage.alpha == 1) {
                this.checkPickup();
            }
        }

        // if(this.isOverlap(this.player, note1)){
        //     this.pickUpItem(note1);
        // }
    }



























    setCollision() {
        this.sceneChanged = false; // makes sure scene only changes once
        
        // Miles
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
        // Miles
        // Creates North West East and South walls
        this.add.image(0, 0, 'floor1').setOrigin(0, 0).setDisplaySize(this.w, this.h).setDepth(-2);

        this.NW = this.add.rectangle(0, 0, this.w, this.h * 0.04)
            .setOrigin(0,0)
            .setFillStyle(0x323232)
            .setVisible(false);
        this.WW = this.add.rectangle(0, 0, this.w * 0.025, this.h)
            .setOrigin(0,0)
            .setFillStyle(0x323232)
            .setVisible(false);
        this.EW = this.add.rectangle(this.w * 0.975, 0, this.w * 0.025, this.h)
            .setOrigin(0,0)
            .setFillStyle(0x323232)
            .setVisible(false);
        this.SW = this.add.rectangle(0, this.h * 0.963, this.w, this.h * .05)
            .setOrigin(0,0)
            .setFillStyle(0x323232)
            .setVisible(false);
        this.NWall = this.physics.add.existing(this.NW, true);
        this.WWall = this.physics.add.existing(this.WW, true);
        this.EWall = this.physics.add.existing(this.EW, true);
        this.SWall = this.physics.add.existing(this.SW, true);

        this.add.image(0, 0, 'border1').setOrigin(0, 0).setDisplaySize(this.w, this.h);
    }

    createDoor(x1, y1, x2, y2) {
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
                if (i == this.hideableObjects.length - 1) {
                    //fixing the out of hiding bug
                    if (object.hSprite.alpha === 0){
                        this.player.setAlpha(1);
                        if (this.hidingFloor) {
                            this.hidingFloor.destroy();
                            this.hidingFloor = null;
                        }
                        //this.cameras.main.setBackgroundColor('#444');
                    }
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
                    if (this.hidingFloor) {
                        this.hidingFloor.destroy();
                        this.hidingFloor = null;
                    }
                    //this.cameras.main.setBackgroundColor('#444');
                }
                else {
                    this.player.setAlpha(0);
                    this.hidingFloor = this.add.image(0, 0, 'floor2').setOrigin(0, 0).setDisplaySize(this.w, this.h).setDepth(-2);
                    //this.cameras.main.setBackgroundColor('#212121');
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





















    //list of items
    //paper, scribbles on ground, photos,
    //items have the following parameters x, y, name
    //12 items total

    //checks if player and item are overlapping
    isItemOverlap(player, item){
        var bound1 = player.getBounds();
        var bound2 = item.getBounds();
        // increase hitbox around items to allow interaction
        bound2.width += 300;
        bound2.x -= 150;
        bound2.height += 300;
        bound2.y -= 150;
        return Phaser.Geom.Intersects.RectangleToRectangle(bound1, bound2);
    }

    toggleInventory() {
        if(this.inventoryDisplaying) {
            for(let i = 0; i < this.inventoryImages.length; i++) {
                this.inventoryImages[i].setAlpha(0);
            }
        }
        else {
            for(let i = 0; i < this.inventoryImages.length; i++) {
                this.inventoryImages[i].setAlpha(1);
            }
        }
        this.inventoryDisplaying = !this.inventoryDisplaying;
    }

    displayInventory() {
        // redraws inventory items at start of scene
        for(let i = 0; i < this.inventoryImages.length; i++) {
            // this.inventoryImages[i].setAlpha(1).setDepth(1).setVisible(true).setActive(true);
            // this.inventoryImages[i].scene = Start;
            this.inventoryImages[i] = this.add.image(this.inventoryImages[i].x, this.inventoryImages[i].y, this.inventoryImages[i].name).setScale(this.inventoryImages[i].scale).setName(this.inventoryImages[i].name);
        }
    }

    checkPickup() {
        let item = this.item.itemImage;
        if (item.alpha == 1) {
            if (this.isItemOverlap(this.player, item)) {
                if (this.eSpr.alpha == 0) {
                    this.eSpr.setAlpha(1);
                    this.eTween = this.tweens.add({
                        targets: this.eSpr,
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
                if (this.eSpr.alpha == 1) {
                    this.eSpr.setAlpha(0);  
                    this.eTween.stop();
                }
            }
        }
        return false;
    }

    initializeItem() {
        let item = this.roomHasItem();
        this.item = null; // if room doesn't have item, this.item will be null
        if (item != null) {
            this.item = this.createItem(item.name, this.w * 0.5, this.h * 0.5, item.name);
            //this.physics.add.collider(this.physics.add.existing(this.item.itemImage, true), this.player);
            this.eSpr = this.add.image(this.item.itemImage.x + 150, this.item.itemImage.y, 'eSprite').setAlpha(0);
            this.input.keyboard.on('keydown-' + 'E', () => { 
                if(this.checkPickup()) {
                    this.pickUpItem(this.item);
                }
            });
        }
    }

    roomHasItem() {
        for(let i = 0; i < this.itemLocations.length; i++) {
            if (this.itemLocations[i].r == this.location.r && this.itemLocations[i].c == this.location.c && !this.hasItem(this.itemLocations[i].name)) {
                return this.itemLocations[i];
            }
        }
        return null;
    }

    initializeItemLocations() {
        if(this.itemLocations.length == 0) { // if item locations hasn't been initialized yet
            let itemNames = ['note', 'phone', 'picture'];
            let existingLocations = [];
            let itemLocation;
            for (let i = 0; i < itemNames.length; i++) { // gives all items a random location
                itemLocation = {
                    r: Phaser.Math.Between(0, 2),
                    c: Phaser.Math.Between(0, 2)
                }
                while(existingLocations.find(l => l.r === itemLocation.r && l.c === itemLocation.c)) { // while the random location already has an item
                    itemLocation = {
                        r: Phaser.Math.Between(0, 2),
                        c: Phaser.Math.Between(0, 2)
                    }
                }
                existingLocations.push(itemLocation);
                let item = {
                    name: itemNames[i],
                    r: itemLocation.r,
                    c: itemLocation.c,
                    obtained: false
                }
                //console.log(item.name + ' location: ' + item.r + ' ' + item.c);
                this.itemLocations.push(item);
            }
        }
    }

    createItem(object, x, y, name) {
        let scale = name === 'phone' ? 0.6 : 0.4;
        let picture = this.add.image(x, y, object).setScale(scale).setDepth(-1); //maybe change scale
        let iName = name;
        return { 
            itemImage : picture,
            itemName : iName
        };
    }

    // makes an inventory to store items in

    // to be done by Wednesday
    // makes the cabinet and and allows items to be put into
    createItemCabinet() {
        let Files = this.map.Levels[3][1].File;
        this.physics.add.collider(this.physics.add.existing(Files, true), this.player);
    }

    // makes the item in backpack alpha .5 to show its in the desk
    inFileCabinet() {

    }

    // shows the items icons
    showBackpack() {

    }

    // boolean check if you have a certain item by name
    hasItem(iName) {
        return this.inventory.some(i => i.itemName === iName);
    }

    // grabs the item and shows the data about the item
    pickUpItem(item) {
        let i = item;
        item.itemImage.setAlpha(0);
        //item.itemImage.destroy(); // destroys the old note image and collider
        this.inventory.push(i);
        let scale = i.itemName === 'phone' ? 0.3 : 0.2;
        let image = this.add.image(this.w * 0.9 - 100 * this.inventoryImages.length, this.h * 0.9, i.itemName).setScale(scale).setAlpha(0);
        if(!this.inventoryDisplay) {
            image.setAlpha(1);
        }
        image.name = i.itemName;
        this.inventoryImages.push(image);
        this.eSpr.setAlpha(0);
    }

    // shows the name and icon of the item after pickup
    displayItem(item) {
        this.showTextBox("Congrats you have found " + item.itemName, 50, 0);
    }

    // spawns the items into the rooms potentially random spawning
    spawnItems() {

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
    // Miles (UPDATE BACKGROUND)
    backgroundColor: 0x212121,
    scene: [Start],
    title: "Chase",
});