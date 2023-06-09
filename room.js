import Title from './title.js';
import Load from './load.js';
import Options from './options.js';

class Start extends GameLevel {
    constructor() {
        super('start', 'Level');
    }

    // ---------------------------------------
    // $Initializing
    // ---------------------------------------

    onEnter() {  
        //this.chase();
        this.initializeDesk();
        this.checkSafe();
        this.initializeDoors();
        this.setCollision();

        this.initializeCabinet();

        this.initializeItemLocations();
        this.initializeItem();
        this.displayInventory();

        this.checkMonsterWarning();
        this.initializeFile();

        if(this.location.r === 0 && this.location.c === 0){
            this.setDoor();
        }

        this.finalChase();

        this.playMusic('introSong');
        if (!this.playerChased){
            this.resumeMusic('introSong');
        }
        else{
            this.resumeMusic('rushSong');
            this.pauseMusic('introSong');
        }
        
        //this.backpack = this.add.image(0, 0, 'backpack').setOrigin(0, 0).setDepth(0);

        this.doorOpenSound = this.sound.add('doorOpen');
        this.doorCloseSound = this.sound.add('doorClose');

        this.fileOpenSound = this.sound.add('fileOpen');
        this.fileCloseSound = this.sound.add('fileClose');

        this.walkSound = this.sound.add('walking');
        this.writingSound = this.sound.add('writing');
        this.heartBeatSound = this.sound.add('heartBeat');

        this.voicemail = this.sound.add('voicemail');

        const {LEFT, RIGHT, UP, DOWN, W, A, S, D, C, E, H, ESC} = Phaser.Input.Keyboard.KeyCodes;
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
            h: H,
            esc: ESC
        });

        if (this.location.r === 6 && this.location.c === 4){
            this.showTextBox("Where am I....?      ", 50, 3, 'kayce');
            this.time.delayedCall(4000, () => { this.hideTextBox(); });
            
        }
    }

    update(time, delta) {

    // ---------------------------------------
    // $Movement + Animation
    // ---------------------------------------

        this.player.setVelocity(0);
        
        if (!this.paused) {
            const {keys} = this; // this.keys

            if (this.playerChased && this.tutorial) {
                if (this.player.alpha === 0) {
                    this.hideTextBox();
                    this.monsterLocation.r = this.location.r;
                    this.monsterLocation.c = this.location.c;
                    this.time.delayedCall(3000, () => { this.checkMonsterWarning(); this.tutorial = false;});
                }
            }
            else if (this.playerChased) {
                this.chaseTime += delta;
                if (this.player.alpha === 0 && this.questions[3] === null) { // if player is hiding monster catches them faster
                    this.chaseTime += 2 * delta;
                }
                if (this.chaseTime > this.timeMove) { // monster moves closer after time has passed
                    this.chaseTime -= this.timeMove;
                    this.updateMonsterLocation();
                }
            }

            if (this.caught && this.player.alpha === 0) {
                this.timeSinceCaught += delta;
                if (this.timeSinceCaught > 10000) { // every 5 seconds of chasing, the monster will get closer
                    this.notCaught();
                }
            }
            else if (!this.caught) {
                // checks if interaction is available
                this.checkHideable();
            }

            
            // movement
            if (this.player.alpha === 1) { // if player is not hiding
                if(keys.left.isDown || keys.a.isDown || this.movingLeft) {
                    this.player.setVelocityX(-this.speed);
                    this.player.anims.play('leftw', true);
                    if (!this.walkSound.isPlaying)
                        this.walkSound.play({ volume: 0.3 });
                }
                else if(keys.right.isDown || keys.d.isDown || this.movingRight) {
                    this.player.setVelocityX(this.speed);
                    this.player.anims.play('rightw', true);
                    if (!this.walkSound.isPlaying)
                        this.walkSound.play({ volume: 0.3 });
                }
                else if(keys.up.isDown || keys.w.isDown || this.movingUp) {
                    this.player.setVelocityY(-this.speed);
                    this.player.anims.play('backw', true);
                    if (!this.walkSound.isPlaying)
                        this.walkSound.play({ volume: 0.3 });
                } 
                else if(keys.down.isDown || keys.s.isDown || this.movingDown) {
                    this.player.setVelocityY(this.speed);
                    this.player.anims.play('frontw', true);
                    if (!this.walkSound.isPlaying)
                        this.walkSound.play({ volume: 0.3 });
                }
                else {
                    // If no keys are pressed, stop the player and play the idle animation
                    this.player.setVelocityX(0);
                    this.player.setVelocityY(0);
                    this.player.anims.play('idle', true);
                }
            }
                  
            
            
            
    // ---------------------------------------
    // $Chase
    // ---------------------------------------

            // lets the player get chased again
            // if(keys.c.isDown) {
            //     this.chase('final');
            // } 

            if(this.item != null) {
                if(this.item.itemImage.alpha == 1) {
                    this.checkPickup();
                }
            }

            if(this.location.r === 6 && this.location.c === 3) {
                this.checkInteractable();
                if(this.deskPhysical) {
                    this.atDesk(this.deskPhysical);
                }   
            }

            // if(this.location.r === 0 && this.location.c === 0){
            //     this.goToEnding();
            // }
        }
    }























    // ---------------------------------------
    // $Walls + Doors
    // ---------------------------------------


    setCollision() {
        this.sceneChanged = false; // makes sure scene only changes once
        
        this.map = this.cache.json.get('map');

        this.physics.add.collider(this.NWall, this.player);
        this.physics.add.collider(this.WWall, this.player);
        this.physics.add.collider(this.EWall, this.player);
        this.physics.add.collider(this.SWall, this.player);

        if(this.NDoor) {
            this.physics.add.collider(this.NDoor, this.player, () => {this.gotoDoor(true, -1, 912, this.h * 0.7);}, null, this);
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
        if (!this.sceneChanged && !this.tutorial) {
            this.sceneChanged = true;
            if (r) { // move up or down in the grid when going to a new scene
                this.location.r += l;
            }
            else { // move left or right in the grid when going to a new scene
                this.location.c += l;
            }
            this.playerLocation.x = x;
            this.playerLocation.y = y;
            this.gotoScene('start');//needs to say start
            //console.log(this.location.r + ", " + this.location.c);
        }
    }

    initializeDoors() {
        let room = this.map.Levels[this.location.r][this.location.c];
        this.createWalls();
        this.NDoor;
        this.WDoor;
        this.EDoor;
        this.SDoor;
        this.EscDoor;
        if (room.Doors.N === 1) {
            //this.ND = this.createDoor(this.w * 0.45, 0, this.w * 0.1, this.h * 0.075, true, -1);
            this.ND = this.createDoor(this.w * 0.5, 0 + 40, 'doorN');
            this.NDoor = this.physics.add.existing(this.ND, true);
        }
        if (room.Doors.S === 1) {
            this.SD = this.createDoor(this.w * 0.5, this.h* 0.925 + 40, 'doorS');
            // this.SD = this.createDoor(this.w * 0.45, this.h * 0.925, this.w * 0.1, this.h * 0.075, true, 1);
            this.SDoor = this.physics.add.existing(this.SD, true);
        }
        if (room.Doors.E === 1) {
            this.ED = this.createDoor(this.w * 0.9625 + 40, this.h * 0.425 + 100, 'doorE');
            // this.ED = this.createDoor(this.w * 0.9625, this.h * 0.425, this.w * 0.0375, this.h * 0.15, false, 1);
            this.EDoor = this.physics.add.existing(this.ED, true);
        }
        if (room.Doors.W === 1) {
            this.WD = this.createDoor(0 + 40, this.h * 0.425 + 100, 'doorW');
            // this.WD = this.createDoor(0, this.h * 0.425, this.w * 0.0375, this.h * 0.15, false, -1);
            this.WDoor = this.physics.add.existing(this.WD, true);
        }
        if(this.location.r === 0 && this.location.c === 0){
            if(room.Escape.N === 1){
                if(room.Escape.Locked === 1){
                    this.EscD = this.createDoor(this.w * 0.5, 0 + 40, 'lDoor');
                    this.EscDoor = this.physics.add.existing(this.EscD, true);
                    this.physics.add.collider(this.EscDoor, this.player);
                }
                // else{
                //     this.EscD = this.createDoor(this.w * 0.5, 0 + 40, 'uDoor');
                //     this.EscDoor = this.physics.add.existing(this.EscD, true);
                //     this.physics.add.collider(this.EscDoor, this.player);   
                // }
            }
        }
    }

    setDoor(){
        let room = this.map.Levels[0][0];
        if(room.Escape.Locked === 0 && room.Escape.N === 1){
            //console.log("are we inside?");
            this.EscD = this.createDoor(this.w * 0.5, 0 + 40, 'uDoor');
            this.EscDoor = this.physics.add.existing(this.EscD, true);
            this.physics.add.collider(this.EscDoor, this.player, () => { this.goToFinale(); }, null, this);
            //this.physics.add.collider(this.player, this.EscDoor, () => {console.log("XXXX"); }, null, this);
        }
    }

    createWalls() {
        // Creates North West East and South walls
        this.add.image(0, 0, 'defaultFloor').setOrigin(0, 0).setDisplaySize(this.w, this.h).setDepth(-2);

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

        this.add.image(0, 0, 'defaultWall').setOrigin(0, 0).setDisplaySize(this.w, this.h).setDepth(-2);
    }

    // createDoor(x1, y1, x2, y2) {
    //     let r = this.add.rectangle(x1, y1, x2, y2)
    //         .setOrigin(0, 0)
    //         .setFillStyle(0x42280E);
    //     return r;
    // }

    createDoor(x,y,object){
        return this.add.image(x, y, object);
     }





    
    // ---------------------------------------
    // $Hiding
    // ---------------------------------------


    checkHideable() {
        if ((this.tutorial && this.playerChased && !this.caught && this.player.alpha === 1) || (!this.caught && !this.tutorial)) {
            for (let i = 0; i < this.hideableObjects.length; i++) {
                let object = this.hideableObjects[i];
                if (this.isOverlap(this.player, object.zoneObject)) {
                    if (object.hSprite.alpha === 0 && !this.touchMode) {
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
                    else if (this.touchMode && this.touchButton.alpha === 0){
                        this.touchButton.setAlpha(0.7);
                    }
                    return true;
                }
                else {
                    if (object.hSprite.alpha === 1 && !this.touchMode) {
                        object.hSprite.setAlpha(0); // hSprite disappears
                        object.hSprite.y = object.hidingObject.y;  // return hSprite to starting location
                        this.hTween.stop(); // stop hSprite tween bounce
                    } 
                    else if (this.touchMode && this.touchButton.alpha !== 0){
                        this.touchButton.setAlpha(0);
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

    hide() {
        if(this.checkHideable() && !this.paused) {
            if(this.player.alpha == 0) {
                this.player.setAlpha(1);
                if (this.hidingFloor) {
                    this.hidingFloor.destroy();
                    this.hidingFloor = null;
                }
                
                this.doorCloseSound.stop();
                this.doorOpenSound.stop();

                this.doorOpenSound.play();

                if (!this.playerChased){
                    this.resumeMusic('introSong');
                }
                else{
                    this.resumeMusic('rushSong');
                }


            }
            else {
                this.player.setAlpha(0);

                this.doorCloseSound.stop();
                this.doorOpenSound.stop();

                this.doorCloseSound.play();


                this.hidingFloor = this.add.image(0, 0, 'hiddenImage').setOrigin(0, 0).setDisplaySize(this.w, this.h).setDepth(-2);
            }
        }
    }

    initializeCabinet() {
        let cabinet = this.map.Levels[this.location.r][this.location.c].Cabinets;
        if (cabinet) {
            for (let i = 0; i < cabinet.length; i++) {
                this.hideableObjects.push(this.createHideableObject('cabinet', 'cabinetZone', 'hSprite', cabinet[i].x, cabinet[i].y));
                this.physics.add.collider(this.physics.add.existing(this.hideableObjects[i].hidingObject, true), this.player);
            }
        }
        this.touchButton.on('pointerdown', () => {this.hide()});
        this.input.keyboard.on('keydown-' + 'H', () => {this.hide()});
    }


    //checks if player and zone are overlapping
    isOverlap(player, zone){
        var bound1 = player.getBounds();
        var bound2 = zone.getBounds();
        return Phaser.Geom.Intersects.RectangleToRectangle(bound1, bound2);
    }




















    // ---------------------------------------
    // $Items + Inventory
    // ---------------------------------------
    //list of items
    //paper, scribbles on ground, photos,
    //items have the following parameters x, y, name
    //12 items total


    //checks if player and item are overlapping
    isItemOverlap(player, item){
        var bound1 = player.getBounds();
        var bound2 = item.getBounds();
        // increase hitbox around items to allow interaction
        bound2.width += 250;
        bound2.x -= 125;
        bound2.height += 250;
        bound2.y -= 125;
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
            this.inventoryImages[i] = this.add.image(this.inventoryImages[i].x, this.inventoryImages[i].y, this.inventoryImages[i].name)
                .setScale(this.inventoryImages[i].scale)
                .setAlpha(this.inventoryImages[i].alpha)
                .setName(this.inventoryImages[i].name);
        }
    }

    checkPickup() {
        let item = this.item.itemImage;
        if (item.alpha === 1) {
            if (this.isItemOverlap(this.player, item)) {
                if (this.eSpr.alpha === 0 && !this.touchMode) {
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
                else if (this.touchMode && this.touchButton.alpha === 0) {
                    this.touchButton.setAlpha(0.7);
                }
                return true;
            }
            else {
                if (this.eSpr.alpha === 1 && !this.touchMode) {
                    this.eSpr.setAlpha(0);  
                    this.eTween.stop();
                }
                else if (this.touchMode && this.touchButton.alpha !== 0) {
                    this.touchButton.setAlpha(0);
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
            //console.log(this.item);
            //this.physics.add.collider(this.physics.add.existing(this.item.itemImage, true), this.player);
            this.eSpr = this.add.image(this.item.itemImage.x + 150, this.item.itemImage.y, 'eSprite').setAlpha(0);
            this.input.keyboard.on('keydown-' + 'E', () => { 
                if(this.checkPickup() && !this.paused) {
                    this.pickUpItem(this.item);
                }
            });
            this.touchButton.on('pointerdown', () => {
                if(this.checkPickup() && !this.paused) {
                    this.pickUpItem(this.item);
                    this.touchButton.setAlpha(0);
            }});
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
            let itemNames = ['note', 'outside', 'phone', 'picture', 'blackmail', 'father', 'discouraged', 'harassing', 'sound', 'breakIn', 'waiting', 'violating'];//extra items go here
            //r:0 c:1
            
            let existingLocations = [{r:0, c:4}, { r:1, c:0}, {r:1, c:2}, {r:1, c:6}, {r:2, c:2}, {r:2, c:4}, {r:2, c:6}, {r:3, c:0}, {r:3, c:2}, {r:3, c:4}, {r:3, c:6}, {r:4, c:0}, {r:4, c:2}, {r:5, c:0}, {r:5, c:4}, {r:5, c:6}, {r:6, c:2}, {r:6, c:3}, {r:6, c:4}]; //add non rooms to this list
            let itemLocation;
            // Note will be in the first room outside the safe room
            let note = {
                name: itemNames[0],
                r: 6,
                c: 4,
                obtained: false
            }
            existingLocations.push({
                r: note.r,
                c: note.c
            });
            this.itemLocations.push(note);
            let outside = {
                name: itemNames[1],
                r: 0,
                c: 0,
                obtained: false
            }
            existingLocations.push({
                r: outside.r,
                c: outside.c
            });
            this.itemLocations.push(outside);
            for (let i = 2; i < itemNames.length; i++) { // gives all items a random location
                itemLocation = {
                    r: Phaser.Math.Between(0, 6),
                    c: Phaser.Math.Between(0, 6)
                }
                while(existingLocations.find(l => l.r === itemLocation.r && l.c === itemLocation.c)) { // while the random location already has an item
                    itemLocation = {
                        r: Phaser.Math.Between(0, 6),
                        c: Phaser.Math.Between(0, 6)
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
            itemName : iName,
            inFile : false
        };
    }

    
    // ---------------------------------------
    // $File Cabinet
    // ---------------------------------------
    // makes an inventory to store items in
    // makes the cabinet and and allows items to be put into


    checkInteractable() {
        for(let i = 0; i < this.fileLocations.length; i++) {
           let object = this.fileLocations[i];//this is the line
            if(this.isItemOverlap(this.player, object.zoneObject)) {
                if(object.eSprite.alpha === 0 && !this.touchMode) {
                    object.eSprite.setAlpha(1);

                    this.eTween = this.tweens.add({
                        targets: object.eSprite,
                        y: '-=10', // move up 10 pixels
                        ease: 'Power1',
                        duration: 500,
                        repeat: -1, // Repeat forever
                        repeatDelay: 500,
                        yoyo: true 
                    });
                }
                else if (this.touchMode && this.touchButton.alpha === 0) {
                    this.touchButton.setAlpha(0.7);
                }
                return true;
            }
            else {
                if (object.eSprite.alpha === 1 && !this.touchMode) {
                    object.eSprite.setAlpha(0); // eSprite disappears
                    object.eSprite.y = object.fileObject.y;  // return eSprite to starting location
                    this.eTween.stop(); // stop eSprite tween bounce
                } 
                else if (this.touchMode && this.touchButton.alpha !== 0) {
                    this.touchButton.setAlpha(0);
                }
            }
        }
        return false;
    }



    createFileCabinet(object, zone, e, x, y) {
        let fileO = this.add.image(x, y, object).setScale(.4);
        let zoneO = this.add.image(x, y + 100, zone).setAlpha(0).setScale(0.8, 1);
        let eSpr = this.add.image(x + 200, y, e).setAlpha(0);

        if(x > this.w * 0.8){
            eSpr.x -= 400;
        }

        return {
            fileObject : fileO,
            zoneObject : zoneO,
            eSprite : eSpr
        };
    }

    initializeFile(){
        if(this.location.r === 6 && this.location.c === 3){
            let Files = this.map.Levels[this.location.r][this.location.c].File;
            if(Files){
                for (let i = 0; i <= 1 ; i++){
                    //let fileCabinetName = i === 1 ? 'fileCabinet1' : 'fileCabinet';
                    this.fileLocations.push(this.createFileCabinet('fileCabinet', 'cabinetZone', 'eSprite', Files[i].x, Files[i].y));
                    this.physics.add.collider(this.physics.add.existing(this.fileLocations[i].fileObject, true), this.player);
                }
            }
            this.input.keyboard.on('keydown-' + 'E', () => {
                if(this.checkInteractable() && !this.paused){
                    if(this.inventory.length > 0) {
                        //console.log("worked");
                        this.openFileCabinet();
                    }
                    else {
                        this.showTextBox("I wonder what I should put in here.", 50, 3, 'kayce');
                        this.time.delayedCall(5000, () => { this.hideTextBox(); });
                    }
                }
            });

            this.touchButton.on('pointerdown', () => {
                if(this.checkInteractable() && !this.paused){
                    if(this.inventory.length > 0) {
                        //console.log("worked");
                        this.openFileCabinet();
                    }
                    else {
                        this.showTextBox("I wonder what I should put in here.", 50, 3, 'kayce');
                        this.time.delayedCall(5000, () => { this.hideTextBox(); });
                    }
                }
            });
        }
    }

    // makes the item in backpack alpha .5 to show its in the file cabinet
    inFileCabinet() {
        let size = this.inventory.length;
        for(let i = 0; i < size; i++){
            if(this.inventory[i].inFile){
                this.inventoryImages[i].setAlpha(0.5);
            }
        }
    }


    //displays the file inside the file cabinet 
    displayFile(item) {   
        this.itemDisplay = this.add.image(this.w * 0.5, this.h * 0.5, item.name + 'Image').setOrigin(0.5, 0.5);
    }

    //opens the file cabinet and displays the items to be navigated through
    openFileCabinet() {
        this.fileOpenSound.stop();
        this.fileCloseSound.stop();
        this.fileOpenSound.play();

        this.putInFile();
        this.inFileCabinet();

        this.paused = true;

        this.blurRectangle = this.add.rectangle(0, 0, this.w, this.h)
            .setOrigin(0,0)
            .setFillStyle(0x323232)
            .setAlpha(0.7)
            .setVisible(true);

        this.closeWindow = this.add.image(this.w * 0.90, this.h * 0.02, 'xIcon')
            .setOrigin(0, 0)
            .setScale(1)
            .setInteractive()
            .on('pointerover', () => {
                this.closeWindow.setScale(1.1);
            })
            .on('pointerout', () => {
                this.closeWindow.setScale(1);
            })
            .on('pointerdown', () => {
                this.closeWindow.destroy();
                this.blurRectangle.destroy();
                this.left.destroy();
                this.right.destroy();
                this.itemDisplay.destroy();
                this.paused = false;
            });

        let i = 0;
        this.displayFile(this.inventoryImages[i]);
        let changeImage = true;

        this.left = this.add.image(this.w * 0.15, this.h * 0.5, 'lArrow')
            .setScale(1.5)
            .setInteractive()
            .setVisible(false)
            .on('pointerover', () => {
                this.left.setScale(1.6);
            })
            .on('pointerout', () => {
                this.left.setScale(1.5);
            })
            .on('pointerdown', () => {
                if (changeImage) {
                    changeImage = false;
                    if (i === this.inventory.length - 1) {
                        this.right.setVisible(true);
                    }
                    if (i > 0) {
                        i--;
                    }
                    if (i === 0) {
                        this.left.setVisible(false);
                    }
                    this.itemDisplay.destroy();
                    this.displayFile(this.inventoryImages[i]);
                    this.time.delayedCall(100, () => { changeImage = true; });
                }
            });

        this.right = this.add.image(this.w * 0.85, this.h * 0.5, 'rArrow')
            .setScale(1.5)
            .setInteractive()
            .setVisible(this.inventory.length > 1 ? true : false) // right arrow will only start visible if there is more than 1 item in inventory
            .on('pointerover', () => {
                this.right.setScale(1.6);
            })
            .on('pointerout', () => {
                this.right.setScale(1.5);
            })
            .on('pointerdown', () => {
                if (changeImage) {
                    changeImage = false;
                    if (i === 0) {
                        this.left.setVisible(true);
                    }
                    if (i < this.inventory.length - 1) {
                        i++;
                    }
                    if (i === this.inventory.length - 1) {
                        this.right.setVisible(false);
                    }
                    this.itemDisplay.destroy();
                    this.displayFile(this.inventoryImages[i]);
                    this.time.delayedCall(100, () => { changeImage = true; });
                }
            });
    }

    //add an item from inventory into the file cabinet
    putInFile() {
        let size = this.inventory.length;
        for(let i = 0; i < size; i++){
            let temp = this.inventory[i];
            let temp2 = this.inventoryImages[i];
            if (!temp.inFile) {
                temp.inFile = true;
                //console.log(temp.itemName);
                //console.log(temp2);
                this.fileItems.push(temp);
                this.fileImages.push(temp2);
            }
        }
    }

    // ---------------------------------------
    // $Item Pickup + Display
    // ---------------------------------------


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
        this.displayItem(image, i.itemName);


    }

    // shows the name and icon of the item after pickup
    displayItem(item, name) {
        this.paused = true;

        if (name === 'breakIn'){
            //this.sound.play('voicemail');
            this.voicemail.play();
        }
        else{
            this.sound.play('paperPickup');
        }

        this.blurRectangle = this.add.rectangle(0, 0, this.w, this.h)
            .setOrigin(0,0)
            .setFillStyle(0x323232)
            .setAlpha(0.7)
            .setVisible(true);

        this.closeWindow = this.add.image(this.w * 0.90, this.h * 0.02, 'xIcon')
            .setOrigin(0, 0)
            .setScale(1)
            .setInteractive()
            .on('pointerover', () => {
                this.closeWindow.setScale(1.1);
            })
            .on('pointerout', () => {
                this.closeWindow.setScale(1);
            })
            .on('pointerdown', () => {
                this.closeWindow.destroy();
                this.blurRectangle.destroy();
                this.itemDisplay.destroy();
                this.paused = false;
                if (name === 'breakIn'){
                    this.voicemail.stop();
                }
                this.textAfterPickup(name);
            });
        
        this.itemDisplay = this.add.image(this.w * 0.5, this.h * 0.5, item.name + 'Image').setOrigin(0.5, 0.5);
    }

    textAfterPickup(item) {
        if (item === 'note') {
            this.showTextBox('Monica didn\'t make it...\n\nI have to tell Daniel.', 40, 5, 'kayce');
            this.time.delayedCall(5000, () => { this.chase('tutorial'); this.checkMonsterWarning(); });
            this.time.delayedCall(5000, () => { this.hideTextBox(); });
            
        }
        else if (this.inventory.length % 3 === 0) {
            this.timeMove -= 750;
            this.chase('regular');
            this.showTextBox('I hope you\'re thinking this out Kayce...', 40, 1, 'monica');
        }
        else if (this.inventory.length === 2) {
            this.showTextBox('           I want to keep reading these... but that room with the \n\n           desk was the only one with a lock.', 40, 3, 'kayce');
        }
        else if (item === 'blackmail') {
            this.showTextBox('        Who is worth stalking?\n\n        I hope there was a decent reason...', 50, 5, 'kayce');
        }
        else if (item === 'father') {
            this.showTextBox('    This is their dad!?\n\n      I’d lose my mind...', 40, 2, 'kayce');
        }
        else if (item === 'picture') {
            this.showTextBox('I remember tearing up reading this,\n\n he\'s so sweet to me.', 40, 1, 'kayce');
        }
        else if (item === 'discouraged') {
            this.showTextBox('I agree. It\'s not that deep.', 40, 0, 'kayce');
        }
        else if (item === 'breakIn') {
            this.showTextBox('       Who leaves a note behind,\n\n       what a dumbass...', 40, 4, 'kayce');
        }
        else if (item === 'outside') {
            this.showTextBox('Who texts someone like that?', 40, 5, 'kayce');
        }
        else if (item === 'phone') {
            this.showTextBox('Wait hold on, who the fuck is Alicia?!', 40, 3, 'kayce');
        }
        else if (item === 'violating') {
            this.showTextBox('Wow, strict...', 50, 2, 'kayce');
        }
        this.time.delayedCall(5000, () => { this.hideTextBox(); });

    }

    checkArrows(number) {
        this.maxQuestion++;
        if (number === this.maxQuestion - 1) {
            this.rightArrow.setVisible(true);
        }
    }



    // ---------------------------------------
    // $Desk + Insight
    // ---------------------------------------

    question(number){
        this.sentence = this.add.image(this.w * 0.5, this.h * 0.2, 'question' + number); 
        
        if (number === 1) {
            if (this.questions[number-1] === null){
                for(let i = 1; i<4; i++){
                    if (i === 1) {
                        if (this.hasItem('note')) {
                            this.choice1 = this.add.image(this.w * 0.5, this.h * 0.4 + i * this.h * 0.15,'question'+number+'-'+i)
                            .setInteractive()
                            .on('pointerover', () => this.choice1.setScale(1.2))
                            .on('pointerout', () => this.choice1.setScale(1))
                            .on('pointerdown', () => {
                                this.writingSound.stop();
                                this.writingSound.play();
                                this.questions[number-1] = 'question'+number+'-'+i;
                                this.choice2.destroy();
                                this.choice3.destroy();
                                this.tweens.add({
                                    targets: this.choice1,
                                    y: this.h * 0.19, 
                                    ease: 'Power1',
                                    duration: 200,
                                });
                                this.karma--;
                                this.checkArrows(number);
                                this.choice1.setScale(1);
                                this.choice1.removeInteractive();
                            });
                        }
                        else {
                            this.choice1 = this.add.image(this.w * 0.5, this.h * 0.4 + i * this.h * 0.15,'BLANKWHITE');
                        }
                    }
                    else if (i === 2) {
                        if (this.hasItem('harassing')) {
                            this.choice2 = this.add.image(this.w * 0.5, this.h * 0.4 + i * this.h * 0.15,'question'+number+'-'+i)
                            .setInteractive()
                            .on('pointerover', () => this.choice2.setScale(1.2))
                            .on('pointerout', () => this.choice2.setScale(1))
                            .on('pointerdown', () => {
                                this.writingSound.stop();
                                this.writingSound.play();
                                this.questions[number-1] = 'question'+number+'-'+i;
                                this.choice1.destroy();
                                this.choice3.destroy();
                                this.tweens.add({
                                    targets: this.choice2,
                                    y: this.h * 0.19, 
                                    ease: 'Power1',
                                    duration: 200,
                                });
                                this.checkArrows(number);
                                this.choice2.setScale(1);
                                this.choice2.removeInteractive();
                            });
                        }
                        else {
                            this.choice2 = this.add.image(this.w * 0.5, this.h * 0.4 + i * this.h * 0.15,'BLANKWHITE');
                        }
                    }
                    else if (i === 3) {
                        if (this.hasItem('sound')) {
                            this.choice3 = this.add.image(this.w * 0.5, this.h * 0.4 + i * this.h * 0.15,'question'+number+'-'+i)
                            .setInteractive()
                            .on('pointerover', () => this.choice3.setScale(1.2))
                            .on('pointerout', () => this.choice3.setScale(1))
                            .on('pointerdown', () => {
                                this.writingSound.stop();
                                this.writingSound.play();
                                this.questions[number-1] = 'question'+number+'-'+i;
                                this.choice1.destroy();
                                this.choice2.destroy();
                                this.tweens.add({
                                    targets: this.choice3,
                                    y: this.h * 0.19, 
                                    ease: 'Power1',
                                    duration: 200,
                                });
                                this.karma++;
                                this.checkArrows(number);
                                this.choice3.setScale(1);
                                this.choice3.removeInteractive();
                            });
                        }
                        else {
                            this.choice3 = this.add.image(this.w * 0.5, this.h * 0.4 + i * this.h * 0.15,'BLANKWHITE');
                        }
                    }
                }
            }
            else {
                this.choice1 = this.add.image(this.w * 0.5, this.h * 0.19, this.questions[number-1]); 
            }
        }
        else if (number === 2) {
            if (this.questions[number-1] === null){
                for(let i = 1; i<4; i++){
                    if (i === 1) {
                        if (this.hasItem('blackmail')) {
                            this.choice1 = this.add.image(this.w * 0.5, this.h * 0.4 + i * this.h * 0.15,'question'+number+'-'+i)
                            .setInteractive()
                            .on('pointerover', () => this.choice1.setScale(1.2))
                            .on('pointerout', () => this.choice1.setScale(1))
                            .on('pointerdown', () => {
                                this.writingSound.stop();
                                this.writingSound.play();
                                this.questions[number-1] = 'question'+number+'-'+i;
                                this.choice2.destroy();
                                this.choice3.destroy();
                                this.tweens.add({
                                    targets: this.choice1,
                                    y: this.h * 0.253, 
                                    ease: 'Power1',
                                    duration: 200,
                                });
                                this.checkArrows(number);
                                this.choice1.setScale(1)
                                this.choice1.removeInteractive();
                            });
                        }
                        else {
                            this.choice1 = this.add.image(this.w * 0.5, this.h * 0.4 + i * this.h * 0.15,'BLANKWHITE');
                        }
                    }
                    else if (i === 2) {
                        if (this.hasItem('breakIn')) {
                            this.choice2 = this.add.image(this.w * 0.5, this.h * 0.4 + i * this.h * 0.15,'question'+number+'-'+i)
                            .setInteractive()
                            .on('pointerover', () => this.choice2.setScale(1.2))
                            .on('pointerout', () => this.choice2.setScale(1))
                            .on('pointerdown', () => {
                                this.writingSound.stop();
                                this.writingSound.play();
                                this.questions[number-1] = 'question'+number+'-'+i;
                                this.choice1.destroy();
                                this.choice3.destroy();
                                this.tweens.add({
                                    targets: this.choice2,
                                    y: this.h * 0.253, 
                                    ease: 'Power1',
                                    duration: 200,
                                });
                                this.karma++;
                                this.checkArrows(number);
                                this.choice2.setScale(1)
                                this.choice2.removeInteractive();
                            });
                        }
                        else {
                            this.choice2 = this.add.image(this.w * 0.5, this.h * 0.4 + i * this.h * 0.15,'BLANKWHITE');
                        }
                    }
                    else if (i === 3) {
                        if (this.hasItem('waiting')) {
                            this.choice3 = this.add.image(this.w * 0.5, this.h * 0.4 + i * this.h * 0.15,'question'+number+'-'+i)
                            .setInteractive()
                            .on('pointerover', () => this.choice3.setScale(1.2))
                            .on('pointerout', () => this.choice3.setScale(1))
                            .on('pointerdown', () => {
                                this.writingSound.stop();
                                this.writingSound.play();
                                this.questions[number-1] = 'question'+number+'-'+i;
                                this.choice1.destroy();
                                this.choice2.destroy();
                                this.tweens.add({
                                    targets: this.choice3,
                                    y: this.h * 0.253, 
                                    ease: 'Power1',
                                    duration: 200,
                                });
                                this.karma--;
                                this.checkArrows(number);
                                this.choice3.setScale(1)
                                this.choice3.removeInteractive();
                            });
                        }
                        else {
                            this.choice3 = this.add.image(this.w * 0.5, this.h * 0.4 + i * this.h * 0.15,'BLANKWHITE');
                        }
                    }
                }
            }
            else {
                this.choice1 = this.add.image(this.w * 0.5, this.h * 0.253, this.questions[number-1]); 
            }
        }
        else if (number === 3) {
            if (this.questions[number-1] === null){
                for(let i = 1; i<4; i++){
                    if (i === 1) {
                        if (this.hasItem('phone')) {
                            this.choice1 = this.add.image(this.w * 0.5, this.h * 0.4 + i * this.h * 0.15,'question'+number+'-'+i)
                            .setInteractive()
                            .on('pointerover', () => this.choice1.setScale(1.2))
                            .on('pointerout', () => this.choice1.setScale(1))
                            .on('pointerdown', () => {
                                this.writingSound.stop();
                                this.writingSound.play();
                                this.questions[number-1] = 'question'+number+'-'+i;
                                this.choice2.destroy();
                                this.choice3.destroy();
                                this.tweens.add({
                                    targets: this.choice1,
                                    y: this.h * 0.195, 
                                    ease: 'Power1',
                                    duration: 200,
                                });
                                this.karma--;
                                this.checkArrows(number);
                                this.choice1.setScale(1)
                                this.choice1.removeInteractive();
                            });
                        }
                        else {
                            this.choice1 = this.add.image(this.w * 0.5, this.h * 0.4 + i * this.h * 0.15,'BLANKWHITE');
                        }
                    }
                    else if (i === 2) {
                        if (this.hasItem('picture')) {
                            this.choice2 = this.add.image(this.w * 0.5, this.h * 0.4 + i * this.h * 0.15,'question'+number+'-'+i)
                            .setInteractive()
                            .on('pointerover', () => this.choice2.setScale(1.2))
                            .on('pointerout', () => this.choice2.setScale(1))
                            .on('pointerdown', () => {
                                this.writingSound.stop();
                                this.writingSound.play();
                                this.questions[number-1] = 'question'+number+'-'+i;
                                this.choice1.destroy();
                                this.choice3.destroy();
                                this.tweens.add({
                                    targets: this.choice2,
                                    y: this.h * 0.195, 
                                    ease: 'Power1',
                                    duration: 200,
                                });
                                this.karma++;
                                this.checkArrows(number);
                                this.choice2.setScale(1)
                                this.choice2.removeInteractive();
                            });
                        }
                        else {
                            this.choice2 = this.add.image(this.w * 0.5, this.h * 0.4 + i * this.h * 0.15,'BLANKWHITE');
                        }
                    }
                    else if (i === 3) {
                        if (this.hasItem('violating')) {
                            this.choice3 = this.add.image(this.w * 0.5, this.h * 0.4 + i * this.h * 0.15,'question'+number+'-'+i)
                            .setInteractive()
                            .on('pointerover', () => this.choice3.setScale(1.2))
                            .on('pointerout', () => this.choice3.setScale(1))
                            .on('pointerdown', () => {
                                this.writingSound.stop();
                                this.writingSound.play();
                                this.questions[number-1] = 'question'+number+'-'+i;
                                this.choice1.destroy();
                                this.choice2.destroy();
                                this.tweens.add({
                                    targets: this.choice3,
                                    y: this.h * 0.195, 
                                    ease: 'Power1',
                                    duration: 200,
                                });
                                this.checkArrows(number);
                                this.choice3.setScale(1)
                                this.choice3.removeInteractive();
                            });
                        }
                        else {
                            this.choice3 = this.add.image(this.w * 0.5, this.h * 0.4 + i * this.h * 0.15,'BLANKWHITE');
                        }
                    }
                }
            }
            else {
                this.choice1 = this.add.image(this.w * 0.5, this.h * 0.195, this.questions[number-1]); 
            }
        }
        else if (number === 4) {
            if (this.questions[number-1] === null){
                for(let i = 1; i<4; i++){
                    if (i === 1) {
                        if (this.hasItem('father')) {
                            this.choice1 = this.add.image(this.w * 0.5, this.h * 0.4 + i * this.h * 0.15,'question'+number+'-'+i)
                            .setInteractive()
                            .on('pointerover', () => this.choice1.setScale(1.2))
                            .on('pointerout', () => this.choice1.setScale(1))
                            .on('pointerdown', () => {
                                this.writingSound.stop();
                                this.writingSound.play();
                                this.questions[number-1] = 'question'+number+'-'+i;
                                this.choice2.destroy();
                                this.choice3.destroy();
                                this.tweens.add({
                                    targets: this.choice1,
                                    y: this.h * 0.195, 
                                    ease: 'Power1',
                                    duration: 200,
                                });
                                this.karma--;
                                this.choice1.setScale(1)
                                this.choice1.removeInteractive();
                                this.finalChaseTime = true;
                            });
                        }
                        else {
                            this.choice1 = this.add.image(this.w * 0.5, this.h * 0.4 + i * this.h * 0.15,'BLANKWHITE');
                        }
                    }
                    else if (i === 2) {
                        if (this.hasItem('outside')) {
                            this.choice2 = this.add.image(this.w * 0.5, this.h * 0.4 + i * this.h * 0.15,'question'+number+'-'+i)
                            .setInteractive()
                            .on('pointerover', () => this.choice2.setScale(1.2))
                            .on('pointerout', () => this.choice2.setScale(1))
                            .on('pointerdown', () => {
                                this.writingSound.stop();
                                this.writingSound.play();
                                this.questions[number-1] = 'question'+number+'-'+i;
                                this.choice1.destroy();
                                this.choice3.destroy();
                                this.tweens.add({
                                    targets: this.choice2,
                                    y: this.h * 0.195, 
                                    ease: 'Power1',
                                    duration: 200,
                                });
                                this.karma++;
                                this.choice2.setScale(1)
                                this.choice2.removeInteractive();
                                this.finalChaseTime = true;
                            });
                        }
                        else {
                            this.choice2 = this.add.image(this.w * 0.5, this.h * 0.4 + i * this.h * 0.15,'BLANKWHITE');
                        }
                    }
                    else if (i === 3) {
                        if (this.hasItem('discouraged')) {
                            this.choice3 = this.add.image(this.w * 0.5, this.h * 0.4 + i * this.h * 0.15,'question'+number+'-'+i)
                            .setInteractive()
                            .on('pointerover', () => this.choice3.setScale(1.2))
                            .on('pointerout', () => this.choice3.setScale(1))
                            .on('pointerdown', () => {
                                this.writingSound.stop();
                                this.writingSound.play();
                                this.questions[number-1] = 'question'+number+'-'+i;
                                this.choice1.destroy();
                                this.choice2.destroy();
                                this.tweens.add({
                                    targets: this.choice3,
                                    y: this.h * 0.195, 
                                    ease: 'Power1',
                                    duration: 200,
                                });
                                this.choice3.setScale(1)
                                this.choice3.removeInteractive();
                                this.finalChaseTime = true;
                            });
                        }
                        else {
                            this.choice3 = this.add.image(this.w * 0.5, this.h * 0.4 + i * this.h * 0.15,'BLANKWHITE');
                        }
                    }
                }
            }
            else {
                this.choice1 = this.add.image(this.w * 0.5, this.h * 0.195, this.questions[number-1]); 
            }
        }
        //let room = this.map.Levels[0][0].Escape.Locked = 0;
        //ADD UNLOCK LOGIC

    }

    diaryText() {
        this.sentece;
        this.choice1;
        this.choice2;
        this.choice3;
        
        this.question(1);

        let q = 1; // question number
        this.maxQuestion = 1; // furthest question the player can see
        for(let i = 0; i < this.questions.length - 1; i++) {
            if(this.questions[i] !== null) {
                this.maxQuestion++;
            }
        }

        let changeImage = true;
        this.leftArrow = this.add.image(this.w * 0.15, this.h * 0.5, 'lArrow')
            .setScale(1.5)
            .setInteractive()
            .setVisible(false)
            .on('pointerover', () => {
                this.leftArrow.setScale(1.6);
            })
            .on('pointerout', () => {
                this.leftArrow.setScale(1.5);
            })
            .on('pointerdown', () => {
                if (changeImage) {
                    changeImage = false;
                    if (q === this.maxQuestion) { // no longer at last question index
                        this.rightArrow.setVisible(true);
                    }
                    if (q > 1) {
                        q--;
                    }
                    if (q === 1) {
                        this.leftArrow.setVisible(false);
                    }
                    
                    this.sentence.destroy();
                    this.choice1.destroy();
                    this.choice2.destroy();
                    this.choice3.destroy();
                    this.question(q);
                    this.time.delayedCall(100, () => { changeImage = true; });
                }
            });

        this.rightArrow = this.add.image(this.w * 0.85, this.h * 0.5, 'rArrow')
            .setScale(1.5)
            .setInteractive()
            .setVisible(this.maxQuestion > 1 ? true : false) // right arrow will only start visible if there is more than 1 item in inventory
            .on('pointerover', () => {
                this.rightArrow.setScale(1.6);
            })
            .on('pointerout', () => {
                this.rightArrow.setScale(1.5);
            })
            .on('pointerdown', () => {
                if (changeImage) {
                    changeImage = false;
                    if (q === 1) {
                        this.leftArrow.setVisible(true);
                    }
                    if (q < this.maxQuestion) {
                        q++;
                    }
                    if (q === this.maxQuestion) {
                        this.rightArrow.setVisible(false);
                    }
                    this.sentence.destroy();
            
                    this.choice1.destroy();
                    this.choice2.destroy();
                    this.choice3.destroy();
                    this.question(q);
                    this.time.delayedCall(100, () => { changeImage = true; });
                }
            });
    }




    createDesk(object, zone, e, chair, x, y) {
        let deskO = this.add.image(x - 40, y, object).setScale(.9);
        let zoneO = this.add.image(x, y + 100, zone).setAlpha(0).setScale(0.8, 1);
        let eSpr = this.add.image(x + 200, y, e).setAlpha(0);
        let chairO = this.add.image(x - 45, y + 65, chair).setScale(.8);

        if(x > this.w * 0.8){
            eSpr.x -= 400;
        }

        return {
            deskObject : deskO,
            zoneObject : zoneO,
            eSprite : eSpr,
            chairObject : chairO,
            selectedOptions : [null, null, null, null],
            hasInteracted: false
        };
    }

    atDesk(desk){
        if(this.isItemOverlap(this.player, desk.zoneObject)) {
                if(desk.eSprite.alpha === 0 && !this.touchMode) {
                    desk.eSprite.setAlpha(1);

                    this.eTween = this.tweens.add({
                        targets: desk.eSprite,
                        y: '-=10', 
                        ease: 'Power1',
                        duration: 500,
                        repeat: -1, 
                        repeatDelay: 500,
                        yoyo: true 
                    });
                }
                else if (this.touchMode && this.touchButton.alpha === 0) {
                    this.touchButton.setAlpha(0.7);
                }
                return true;
            }
            else {
                if (desk.eSprite.alpha === 1 && !this.touchMode) {
                    desk.eSprite.setAlpha(0); // eSprite disappears
                    desk.eSprite.y = desk.deskObject.y;  // return eSprite to starting location
                    this.eTween.stop(); // stop eSprite tween bounce
                } 
                else if (this.touchMode && this.touchButton.alpha !== 0) {
                    this.touchButton.setAlpha(0);
                }
            }
        return false;
    }
    


    openDesk() {
        this.paused = true;


        this.blurRectangle = this.add.rectangle(0, 0, this.w, this.h)
            .setOrigin(0,0)
            .setFillStyle(0x323232)
            .setAlpha(0.7)
            .setVisible(true);

        this.closeWindow = this.add.image(this.w * 0.90, this.h * 0.02, 'xIcon')
            .setOrigin(0, 0)
            .setScale(1)
            .setInteractive()
            .on('pointerover', () => {
                this.closeWindow.setScale(1.1);
            })
            .on('pointerout', () => {
                this.closeWindow.setScale(1);
            })
            .on('pointerdown', () => {
                this.closeWindow.destroy();
                this.blurRectangle.destroy();
                this.paper.destroy();
                this.sentence.destroy();
                this.choice1.destroy();
                this.choice2.destroy();
                this.choice3.destroy();
                this.leftArrow.destroy();
                this.rightArrow.destroy();
                this.paused = false;
                if(this.finalChaseTime) {
                    this.showTextBox('I need to escape! What about \n\nthat locked door from before?!', 40, 2, 'icon');
                    this.time.delayedCall(8000, () => { this.hideTextBox(); });
                }
                // else if (this.deskPhysical.hasInteracted === false){
                //     this.showTextBox("      Interesting... I should \n\n      fill this out I guess.     ", 40, 3, 'kayce');
                //     this.deskPhysical.hasInteracted = true;
                // }
            });
        
        this.paper = this.add.image(this.w * 0.5, this.h * 0.5,'background').setOrigin(0.5, 0.5).setScale(1);
        this.diaryText();
    }



    initializeDesk(){
        if(this.location.r === 6 && this.location.c === 3){
            let desk = this.map.Levels[this.location.r][this.location.c].Desk;
            if(desk){
                this.deskPhysical = this.createDesk('desk', 'cabinetZone', 'eSprite', 'chair', desk.x, desk.y);
                this.physics.add.collider(this.physics.add.existing(this.deskPhysical.deskObject, true), this.player);
                this.physics.add.collider(this.physics.add.existing(this.deskPhysical.chairObject, true), this.player);
            }
            
            if(this.deskPhysical){
                this.input.keyboard.on('keydown-' + 'E', () => {
                    if(this.atDesk(this.deskPhysical)){
                        if(!this.paused/* && this.inventory.length > 0*/){
                               this.openDesk();
                        }
                    }
                });
                this.touchButton.on('pointerdown', () => {
                    if(!this.paused){
                        this.openDesk();
                    }
                });
            }
        }
        //return this.deskPhysical;
    }

    // ---------------------------------------
    // $Music
    // ---------------------------------------

    pauseMusic(title){
        if (this.sound.get(title)) {
            let music = this.sound.get(title);
            music.pause();    
        }

    }

    resumeMusic(title){
        if (this.sound.get(title)) {
            let music = this.sound.get(title);
            music.resume();    
        }

    }


    playMusic(title) {
        if (!this.sound.get(title)) {
            let music = this.sound.add(title);

            music.setLoop(true);
            music.setVolume(0.4);

            music.play();
        }
    }








    // ---------------------------------------
    // $Title Screen and Tutorial
    // ---------------------------------------


    decorateFirstRoom(){
        if(this.location.r === 6 && this.location.c === 4){

        }
    }

    goToFinale(){
        this.pauseMusic('rushSong');
        this.gotoScene('finale');
    }

    goToEnding(){
        if(this.location.r === 0 && this.location.c === 0){
            if(this.karma === 0){
                this.gotoScene('neutralvictory');
            } else if(this.karma > 0){
                this.gotoScene('negativevictory');
            } else if(this.karma < 0) {
                this.gotoScene('positivevictory');
            }
    }
}

}

class info extends Phaser.Scene{
    constructor(){
        super('info');
    }
    preload(){
        this.load.image('cover', 'assets/images/introscene3.png');
        //this.load.audio('paperPickup', "assets/audio/paperPickup.mp3");
    }
    create(){
        let cover = this.add.image(960 , 540, 'cover');
        this.add.text(10, 5, "Click anywhere to continue.").setFontSize(20);
        cover.setAlpha(0);
        this.sound.play('paperPickup');

        const fadeIn = this.tweens.add({
            targets: cover,
            alpha: 1,
            duration: 1000, // Duration of the fade in effect (in milliseconds)
            ease: 'Linear'
          });

        

        this.input.on('pointerdown', () => {            
            const fadeOut = this.tweens.add({
                targets: cover,
                alpha: 0,
                delay: 500, // Delay before starting the fade out effect (in milliseconds)
                duration: 1000, // Duration of the fade out effect (in milliseconds)
                ease: 'Linear',
            });
            this.time.delayedCall(1500, () => fadeOut.play);
            this.time.delayedCall(1500, () => this.scene.start('title'));
        });
    }
}

class PapersPlease extends GameLevel{
    constructor() {
        super('finale');
    }

    preload(){
        this.load.image('brownLayer', 'assets/images/brownLayer.png');
        this.load.image('papersLayer', 'assets/images/papersLayer.png');
        this.load.image('borderLayer2', 'assets/images/borderLayer2.png');
        this.load.image('submitLayer', 'assets/images/submitLayer.png');
    }
	
	create() {
		//this.cameras.main.setBackgroundColor('#000000');

        this.w = this.game.config.width;
        this.h = this.game.config.height;
        this.s = this.game.config.width * 0.01;
        
        let brownLayer = this.add.image(this.w * 0.5, this.h * 0.5, 'brownLayer');
        let borderLayer2 = this.add.image(this.w * 0.5, this.h * 0.5, 'borderLayer2').setDepth(5);
        let submitLayer = this.add.image(this.w * 0.5, this.h * 0.5, 'submitLayer');


        let papersLayer = this.add.image(this.w * 0.5, this.h * 0.8, 'papersLayer')
        .setInteractive()
        .on('pointerover', () => papersLayer.setScale(1.2))
        .on('pointerout', () => papersLayer.setScale(1))
        .on('pointerdown', () => {
            this.gotoScene('finale2');
        });
    }
}

class Finale extends GameLevel {
	constructor() {
        super('finale2');
    }

    preload(){

        this.load.image('backgroundLayer', 'assets/images/backgroundLayer.png');
        this.load.image('borderLayer', 'assets/images/borderLayer.png');
        this.load.image('deskLayer', 'assets/images/deskLayer.png');
        this.load.image('monicaLayer', 'assets/images/monicaLayer.png');
        this.load.image('paperLayer', 'assets/images/paperLayer.png');
        this.load.image('spotlightLayer', 'assets/images/spotlightLayer.png');
        this.load.image('takeitLayer', 'assets/images/takeitLayer.png');
        this.load.audio('paperPickup', "assets/audio/paperPickup.mp3");

    }
	
	create() {
        this.w = this.game.config.width;
        this.h = this.game.config.height;
        this.s = this.game.config.width * 0.01;

        let backgroundLayer = this.add.image(this.w * 0.5, this.h * 0.5, 'backgroundLayer');
        let borderLayer = this.add.image(this.w * 0.5, this.h * 0.5, 'borderLayer').setDepth(11);
        let deskLayer = this.add.image(this.w * 0.5, this.h * 0.5, 'deskLayer').setDepth(2);
        let monicaLayer = this.add.image(this.w * 0.5, this.h * 0.5, 'monicaLayer').setDepth(0);
        let spotlightLayer = this.add.image(this.w * 0.5, this.h * 0.5, 'spotlightLayer').setAlpha(0.25).setDepth(10);
        let takeitLayer = this.add.image(this.w * 0.5, this.h * 0.5, 'takeitLayer').setDepth(5);
        let paperLayer = this.add.image(this.w * 0.5, this.h * 0.5 - 175,'paperLayer')
        .setInteractive()
        .on('pointerover', () => paperLayer.setScale(1.2))
        .on('pointerout', () => paperLayer.setScale(1))
        .on('pointerdown', () => {
            this.goToEnding();
        })
        .setDepth(9);
        this.sound.play('paperPickup');

        
        //this.add.image(this.game.config.width * 0.5, this.game.config.height * 0.5, '=Victory');
        
	}

    goToEnding(){
        //console.log("karma = " + this.karma);
        if(this.karma === 0){
            this.gotoScene('neutralvictory');
        } else if(this.karma > 0){
            this.gotoScene('negativevictory');
        } else if(this.karma < 0) {
            this.gotoScene('positivevictory');
        }
    }   
}



class GameOver extends Phaser.Scene {
	constructor() {
        super('game over');
    }

    preload(){
        this.load.image('gameOver', 'assets/images/gameOver.png');
    }
	
	create() {
		this.cameras.main.setBackgroundColor('#000000');
        this.w = this.game.config.width;
        this.h = this.game.config.height;
        this.s = this.game.config.width * 0.01;

		// this.add.text(this.game.config.width * 0.5, this.game.config.height * 0.3, 'Game Over', { color: '#ffffff', fontSize: 90 })
		// .setOrigin(0.5, 0.5)
		// .setStroke(0x000000, 5);
        this.add.image(this.game.config.width * 0.5, this.game.config.height * 0.5, 'gameOver');


        let reload = this.add.image(this.w * 0.5, this.h * 0.6, 'restart')
        .setInteractive()
        .on('pointerover', () => reload.setScale(1.2))
        .on('pointerout', () => reload.setScale(1))
        .on('pointerdown', () => {
            location.reload();
        });
	}
}

//neutral dub
class NeutralVictory extends Phaser.Scene {
	constructor() {
        super('neutralvictory');
    }
	
	create() {
		this.cameras.main.setBackgroundColor('#000000');

        this.w = this.game.config.width;
        this.h = this.game.config.height;
        this.s = this.game.config.width * 0.01;
		// this.add.text(this.game.config.width * 0.5, this.game.config.height * 0.3, 'Victory', { color: '#ffffff', fontSize: 90 })
		// .setOrigin(0.5, 0.5)
		// .setStroke(0x000000, 5);
        this.add.image(this.game.config.width * 0.5, this.game.config.height * 0.5, '=Victory').setDepth(1);
        this.add.image(this.game.config.width * 0.5, this.game.config.height * 0.5, 'NeutralBackground').setDepth(0);
        let reload = this.add.image(this.w * 0.8, this.h * 0.9, 'restart')
        .setInteractive()
        .setDepth(2)
        .on('pointerover', () => reload.setScale(1.2))
        .on('pointerout', () => reload.setScale(1))
        .on('pointerdown', () => {
            location.reload();
        });
	}
}

//daniel dub
class PositiveVictory extends Phaser.Scene {
	constructor() {
        super('positivevictory');
    }
	
	create() {
		this.cameras.main.setBackgroundColor('#000000');

        this.w = this.game.config.width;
        this.h = this.game.config.height;
        this.s = this.game.config.width * 0.01;
		// this.add.text(this.game.config.width * 0.5, this.game.config.height * 0.3, 'Victory', { color: '#ffffff', fontSize: 90 })
		// .setOrigin(0.5, 0.5)
		// .setStroke(0x000000, 5);

        this.add.image(this.game.config.width * 0.5, this.game.config.height * 0.5, '+Victory').setDepth(1);
        this.add.image(this.game.config.width * 0.5, this.game.config.height * 0.5, 'NegativeBackground').setDepth(0);
        let reload = this.add.image(this.w * 0.8, this.h * 0.9, 'restart')
        .setInteractive()
        .setDepth(2)
        .on('pointerover', () => reload.setScale(1.2))
        .on('pointerout', () => reload.setScale(1))
        .on('pointerdown', () => {
            location.reload();
        });
	}
}

//monica dub
class NegativeVictory extends Phaser.Scene {
	constructor() {
        super('negativevictory');
    }
	
	create() {
		this.cameras.main.setBackgroundColor('#000000');

        this.w = this.game.config.width;
        this.h = this.game.config.height;
        this.s = this.game.config.width * 0.01;
		// this.add.text(this.game.config.width * 0.5, this.game.config.height * 0.3, 'Victory', { color: '#ffffff', fontSize: 90 })
		// .setOrigin(0.5, 0.5)
		// .setStroke(0x000000, 5);
        this.add.image(this.game.config.width * 0.5, this.game.config.height * 0.5, '-Victory').setDepth(1);
        this.add.image(this.game.config.width * 0.5, this.game.config.height * 0.5, 'PositiveBackground').setDepth(0);
        let reload = this.add.image(this.w * 0.8, this.h * 0.9, 'restart')
        .setInteractive()
        .setDepth(2)
        .on('pointerover', () => reload.setScale(1.2))
        .on('pointerout', () => reload.setScale(1))
        .on('pointerdown', () => {
            location.reload();
        });
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
    scene: [Load, info, Title, Options, Start, GameOver, NegativeVictory, PositiveVictory, NeutralVictory, Finale, PapersPlease],
    title: "Chase",
});