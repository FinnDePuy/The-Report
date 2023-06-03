

class Start extends GameLevel {
    constructor() {
        super('start', 'Level');
    }

    preload() {
        //this.load.image('floor1', 'assets/green.png');
        this.load.image('cabinetZone', 'assets/images/RedZone.png');
        this.load.image('fileCabinet', 'assets/images/File_Cabinet.png');
        this.load.image('fileCabinet1', 'assets/images/File_Cabinet_1.png');
        this.load.image('hSprite', 'assets/images/hSprite.png');
        this.load.image('eSprite', 'assets/images/eSprite.png');
        this.load.image('speechBubble', 'assets/images/speechBubble.png');
        this.load.image('cabinet', 'assets/images/Cabinet.png');
        this.load.spritesheet('icon', 'assets/images/spritesheet.png', { frameWidth: 100, frameHeight: 100 });
        this.load.json('map', 'assets/json/map.json');
        this.load.image('floor1', 'assets/images/BG_FLOOR_1.png');
        this.load.image('floor2', 'assets/images/grey.png');
        this.load.image('border1', 'assets/images/BG_BORDER_1.png');
        this.load.image('desk', 'assets/images/desk.png');
        this.load.image('chair', 'assets/images/chair.png');

        this.load.image('doorN', 'assets/images/doorN.png');
        this.load.image('doorS', 'assets/images/doorS.png');
        this.load.image('doorE', 'assets/images/doorE.png');
        this.load.image('doorW', 'assets/images/doorW.png');




        //this.load.image('player', 'assets/images/alexfront.png');
        this.load.atlas('player', 'assets/images/FINALSP.png', 'assets/json/FINALSPJSON.json'); 

        this.load.image('blackmail', 'assets/images/notes/blackmail.png');
        this.load.image('discouraged', 'assets/images/notes/discourage.png');
        this.load.image('father', 'assets/images/notes/fathernote.png');
        this.load.image('picture', 'assets/images/notes/love.png');
        this.load.image('note', 'assets/images/notes/off.png');
        this.load.image('sound', 'assets/images/notes/sound.png');
        this.load.image('phone', 'assets/images/notes/unfaithful.png');
        this.load.image('escape', 'assets/images/notes/upnote.png')
        this.load.image('violating', 'assets/images/notes/violatepolicy.png');
        this.load.image('breakIn', 'assets/images/notes/voicemail.png');
        this.load.image('harassing', 'assets/images/notes/breakin.png');
        this.load.image('outside', 'assets/images/notes/breakin.png');
        this.load.image('waiting', 'assets/images/notes/breakin.png');
        
        

        this.load.image('noteImage', 'assets/images/notes/N_PoliceReport2.png');
        this.load.image('pictureImage', 'assets/images/notes/Pi_dating.png');
        this.load.image('phoneImage', 'assets/images/notes/Ph_unfaithful.png');
        this.load.image('blackmailImage', 'assets/images/notes/N_blackmailingherbrother.png');
        this.load.image('fatherImage', 'assets/images/notes/N_byherfather.png');
        this.load.image('outsideImage', 'assets/images/notes/Ph_byoutsidepressure.png');
        this.load.image('discouragedImage', 'assets/images/notes/Pi_discouragedbyothers.png');
        this.load.image('harassingImage', 'assets/images/notes/Ph_previouslyharassingasuspect.png');
        this.load.image('soundImage', 'assets/images/notes/Ph_soundmentally.png');
        this.load.image('breakInImage', 'assets/images/notes/Ph_suspectedofabreakin.png');//this is a placeholder
        this.load.image('waitingImage', 'assets/images/notes/Ph_waitingforherbrotherspartner.png');
        this.load.image('violatingImage', 'assets/images/notes/N_wasviolatingafamilypolicy.png');
        this.load.image('deskPaper', 'assets/images/deskPaper.png')



        this.load.image('xIcon', 'assets/images/x.png');
        this.load.image('rArrow', 'assets/images/rightArrow.png');
        this.load.image('lArrow', 'assets/images/leftArrow.png');

        this.load.audio('doorOpen', "assets/audio/Door_Open.mp3");
        this.load.audio('doorClose', "assets/audio/Door_Close.mp3");
        this.load.audio('fileOpen', "assets/audio/fileOpen.mp3");
        this.load.audio('fileClose', "assets/audio/fileClose.mp3");
        this.load.audio('happyLoop', 'assets/audio/happyLoop.mp3')
    }

    onEnter() {
        console.log(this.location.r + ", " + this.location.c);
        this.chase(0);
        
        this.initializeDoors();
        this.setCollision();

        this.initializeCabinet();

        this.initializeItemLocations();
        this.initializeItem();
        this.displayInventory();

        this.checkMonsterWarning();
        this.initializeFile();

        this.initializeDesk();

        this.playMusic();

        this.doorOpenSound = this.sound.add('doorOpen');
        this.doorCloseSound = this.sound.add('doorClose');

        this.fileOpenSound = this.sound.add('fileOpen');
        this.fileCloseSound = this.sound.add('fileClose');

        // inputs
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
    }

    update(time, delta) {
        this.player.setVelocity(0);
        
        if (!this.paused) {
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

            //this.player.anims.play('idle');
            
            // movement
            if (this.player.alpha == 1) { // if player is not hiding
                if(keys.left.isDown || keys.a.isDown) {
                    this.player.setVelocityX(-this.speed);
                    this.player.anims.play('leftw', true);
                }
                else if(keys.right.isDown || keys.d.isDown) {
                    this.player.setVelocityX(this.speed);
                    this.player.anims.play('rightw', true);
                }
                else if(keys.up.isDown || keys.w.isDown) {
                    this.player.setVelocityY(-this.speed);
                    this.player.anims.play('backw', true);
                } 
                else if(keys.down.isDown || keys.s.isDown) {
                    this.player.setVelocityY(this.speed);
                    this.player.anims.play('frontw', true);
                }
                else {
                    // If no keys are pressed, stop the player and play the idle animation
                    this.player.setVelocityX(0);
                    this.player.setVelocityY(0);
                    this.player.anims.play('idle', true);
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

            if(this.location.r === 6 && this.location.c === 3) {
                this.checkInteractable();
                this.atDesk(this.deskPhysical);
            }
        }
    }



























    setCollision() {
        this.sceneChanged = false; // makes sure scene only changes once
        

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
            this.ED = this.createDoor(this.w * 0.9625 + 40, this.h * 0.425 + 40, 'doorE');
            // this.ED = this.createDoor(this.w * 0.9625, this.h * 0.425, this.w * 0.0375, this.h * 0.15, false, 1);
            this.EDoor = this.physics.add.existing(this.ED, true);
        }
        if (room.Doors.W === 1) {
            this.WD = this.createDoor(0 + 40, this.h * 0.425 + 40, 'doorW');
            // this.WD = this.createDoor(0, this.h * 0.425, this.w * 0.0375, this.h * 0.15, false, -1);
            this.WDoor = this.physics.add.existing(this.WD, true);
        }
    }

    createWalls() {
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

        this.add.image(0, 0, 'border1').setOrigin(0, 0).setDisplaySize(this.w, this.h).setDepth(-2);
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

                    this.toggleMusic();

                }
                else {
                    this.player.setAlpha(0);

                    this.doorCloseSound.stop();
                    this.doorOpenSound.stop();

                    this.doorCloseSound.play();

                    this.toggleMusic();

                    this.hidingFloor = this.add.image(0, 0, 'floor2').setOrigin(0, 0).setDisplaySize(this.w, this.h).setDepth(-2);
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
            console.log(this.item);
            //this.physics.add.collider(this.physics.add.existing(this.item.itemImage, true), this.player);
            this.eSpr = this.add.image(this.item.itemImage.x + 150, this.item.itemImage.y, 'eSprite').setAlpha(0);
            this.input.keyboard.on('keydown-' + 'E', () => { 
                if(this.checkPickup() && !this.paused) {
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
            let itemNames = ['note', 'phone', 'picture', 'blackmail', 'father', 'outside', 'discouraged', 'harassing', 'sound', 'breakIn', 'waiting', 'violating'];//extra items go here
            //r:0 c:1
            
            let existingLocations = [{r:0, c:5}, { r:1, c:0}, {r:1, c:2}, {r:1, c:6}, {r:2, c:2}, {r:2, c:4}, {r:2, c:6}, {r:3, c:0}, {r:3, c:2}, {r:3, c:4}, {r:3, c:6}, {r:4, c:0}, {r:4, c:2}, {r:5, c:0}, {r:5, c:4}, {r:5, c:6}, {r:6, c:2}, {r:6, c:3}, {r:6, c:4}]; //add non rooms to this list
            let itemLocation;
            // Note will be in the first room outside the safe room
            let note = {
                name: itemNames[0],
                r: 5,
                c: 3,
                obtained: false
            }
            existingLocations.push({
                r: note.r,
                c: note.c
            });
            this.itemLocations.push(note);
            for (let i = 1; i < itemNames.length; i++) { // gives all items a random location
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

    // makes an inventory to store items in

    // makes the cabinet and and allows items to be put into
    checkInteractable() {
        for(let i = 0; i < this.fileLocations.length; i++) {
           let object = this.fileLocations[i];//this is the line
            if(this.isItemOverlap(this.player, object.zoneObject)) {
                if(object.eSprite.alpha === 0) {
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
                return true;
            }
            else {
                if (object.eSprite.alpha === 1) {
                    object.eSprite.setAlpha(0); // eSprite disappears
                    object.eSprite.y = object.fileObject.y;  // return eSprite to starting location
                    this.eTween.stop(); // stop eSprite tween bounce
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
                        this.showTextBox("I wonder what I should put in here.", 50, 1);
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
        this.displayItem(image);
    }

    // shows the name and icon of the item after pickup
    displayItem(item) {
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
                this.itemDisplay.destroy();
                this.paused = false;
            });
        
        this.itemDisplay = this.add.image(this.w * 0.5, this.h * 0.5, item.name + 'Image').setOrigin(0.5, 0.5);
    }

    diaryText() {
        const centerX = this.cameras.main.width / 2;
        const topOffset = 170; 
    
        if (this.texts) {
            this.texts.forEach(text => text.destroy());
        }
        
        this.texts = [];
    
        // Display previously selected options.
        this.deskPhysical.selectedOptions.forEach((option, index) => {
            let chosenText = this.add.text(centerX, topOffset + (index*90), `The player chose option ${option}`, { 
                fontSize: '32px', 
                color: '#fff'
            }).setOrigin(0.5);
            this.texts.push(chosenText);
        });
    
        // Display new choice template.
        let newChoiceTemplate = this.add.text(centerX, topOffset + (this.deskPhysical.selectedOptions.length*90), 'The player chose option _________', { 
            fontSize: '32px', 
            color: '#fff'
        }).setOrigin(0.5);
        this.texts.push(newChoiceTemplate);
    
        const newOptions = ['Option 1', 'Option 2', 'Option 3'];
        this.optionTexts = newOptions.map((option, index) => {
            let optionText = this.add.text(centerX, topOffset + (this.deskPhysical.selectedOptions.length*90) + (index+1)*30, option, { 
                fontSize: '24px', 
                color: '#aaa'
            })
            .setInteractive()
            .setOrigin(0.5)
            .on('pointerdown', () => {
                newChoiceTemplate.setText(`The player chose option ${option}`);
                this.deskPhysical.selectedOptions.push(option);
                this.writingSound.stop();

                this.writingSound.play();
                this.diaryText(); // Recreate the text fields.
            })
            .on('pointerover', () => {
                optionText.setFontSize('28px');
            })
            .on('pointerout', () => { 
                optionText.setFontSize('24px');
            });
            
            this.texts.push(optionText);
            return optionText;
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
            selectedOptions : []
        };
    }

    atDesk(desk){
        if(this.isItemOverlap(this.player, desk.zoneObject)) {
                if(desk.eSprite.alpha === 0) {
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
                return true;
            }
            else {
                if (desk.eSprite.alpha === 1) {
                    desk.eSprite.setAlpha(0); // eSprite disappears
                    desk.eSprite.y = desk.deskObject.y;  // return eSprite to starting location
                    this.eTween.stop(); // stop eSprite tween bounce
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
                this.paused = false;

                if (this.texts) {
                    this.texts.forEach(text => text.destroy());
                }

            });
        
        this.paper = this.add.image(this.w * 0.5, this.h * 0.5,'deskPaper').setOrigin(0.5, 0.5).setScale(3.6);
        this.text = this.diaryText();
    }



    initializeDesk(){
        if(this.location.r === 6 && this.location.c === 3){
            let desk = this.map.Levels[this.location.r][this.location.c].Desk;
            if(desk){
                this.deskPhysical = this.createDesk('desk', 'cabinetZone', 'eSprite', 'chair', desk.x, desk.y);
                this.physics.add.collider(this.physics.add.existing(this.deskPhysical.deskObject, true), this.player);
            }
            
            if(this.deskPhysical){
                this.input.keyboard.on('keydown-' + 'E', () => {
                    if(this.atDesk(this.deskPhysical)){
                        if(!this.paused && this.inventory.length > 0){
                               this.openDesk();
                        }
                    }
                });
            }
        }
    }

    toggleMusic() {
        if (this.sound.get('happyLoop')) {
            let music = this.sound.get('happyLoop');
            console.log(music);

            if (music.isPlaying) {
                music.pause();
            } 
            else {
                music.resume();
            }
              
        }
    }


    playMusic() {
        if (!this.sound.get('happyLoop')) {
            let music = this.sound.add('happyLoop');

            music.setLoop(true);
            music.setVolume(0.3);

            music.play();
        }
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