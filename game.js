class GameLevel extends Phaser.Scene {
    init(data) {
        this.location = data.location || {r: 6, c: 4}; 
        this.playerLocation = data.playerLocation || {x: 912, y: 600};
        this.playerChased = data.playerChased || false;
        this.monsterLocation = data.monsterLocation || {r: 0, c: 0};
        this.chaseTime = data.chaseTime || 0;
        this.timeMove = data.timeMove || 7000;
        this.caught = data.caught || false;
        this.finalChaseTime = data.finalChaseTime || false;
        this.everChased = data.everChased || false;
        this.inventory = data.inventory || [];
        this.inventoryImages = data.inventoryImages || [];
        this.inventoryDisplaying = data.inventoryDisplaying || false; // backpack
        this.itemLocations = data.itemLocations || [];
        this.fileLocations = data.fileLocations || [];
        this.fileImages = data.fileImages || [];
        this.fileItems = data.fileItems || [];
        this.questions = data.questions || [null, null, null, null];
        this.karma = data.karma || 0;
        this.tutorial = (this.location.r !== 6 || this.location.c !== 4) ? false : true;

        this.touchMode = data.touchMode || false;
        
        this.movingUp = false;
        this.movingDown = false;
        this.movingLeft = false;
        this.movingRight = false;
        this.buttonPressed = false;
    }

    constructor(key, name) {
        super(key);
        this.name = name;
    }

    create() {
        this.transitionDuration = 250;

        this.w = this.game.config.width;
        this.h = this.game.config.height;
        this.s = this.game.config.width * 0.01;

        this.speed = 500;
        this.paused = false;
        this.hideableObjects = [];

        this.cameras.main.setBackgroundColor('#444');
        this.cameras.main.fadeIn(this.transitionDuration, 0, 0, 0);
        this.map = this.cache.json.get('map');

        this.initializePlayer();

        // fullscreen
        this.input.keyboard.on('keydown-' + 'F', () => { 
            if (this.scale.isFullscreen) {
                this.scale.stopFullscreen();
            } else {
                this.scale.startFullscreen();
            }
        });

        // Touch Buttons

        let centerX = 1700; 
        let centerY = 1000; 
        let arrowSize = 100; // size of each arrow
        let gap = 10; // gap between arrows

        if (this.touchMode){
            this.arrowU = this.add.image(centerX, centerY - arrowSize - gap - 100, 'arrowU').setOrigin(0.5, 0.5).setDepth(7).setAlpha(0.7).setScale(0.2);
            this.arrowD = this.add.image(centerX, centerY, 'arrowD').setOrigin(0.5, 0.5).setDepth(7).setAlpha(0.7).setScale(0.2);
            this.arrowL = this.add.image(centerX - arrowSize - gap, centerY - 100, 'arrowL').setOrigin(0.5, 0.5).setDepth(7).setAlpha(0.7).setScale(0.2);
            this.arrowR = this.add.image(centerX + arrowSize + gap, centerY - 100, 'arrowR').setOrigin(0.5, 0.5).setDepth(7).setAlpha(0.7).setScale(0.2);

            this.touchButton = this.add.image(100, centerY, 'touchButton').setOrigin(0.5, 0.5).setDepth(7).setAlpha(0.7).setScale(1.3);

            this.arrowU.setInteractive().on('pointerdown', () => { 
                this.movingUp = true; });
            this.arrowU.on('pointerup', () => { this.movingUp = false; });
            this.arrowU.on('pointerout', () => { this.movingUp = false; });
            this.arrowU.on('pointerover', () => {
                if (this.input.activePointer.isDown){
                    this.movingUp = true; 
                }
            });


            this.arrowD.setInteractive().on('pointerdown', () => { 
                this.movingDown = true; });
            this.arrowD.on('pointerup', () => { this.movingDown = false; });
            this.arrowD.on('pointerout', () => { this.movingDown = false; });
            this.arrowD.on('pointerover', () => {
                if (this.input.activePointer.isDown){
                    this.movingDown = true; 
                }
            });

            this.arrowL.setInteractive().on('pointerdown', () => { 
                this.movingLeft = true; });
            this.arrowL.on('pointerup', () => { this.movingLeft = false; });
            this.arrowL.on('pointerout', () => { this.movingLeft = false; });
            this.arrowL.on('pointerover', () => {
                if (this.input.activePointer.isDown){
                    this.movingLeft = true; 
                }
            });

            this.arrowR.setInteractive().on('pointerdown', () => { 
                this.movingRight = true; });
            this.arrowR.on('pointerup', () => { this.movingRight = false; });
            this.arrowR.on('pointerout', () => { this.movingRight = false; });
            this.arrowR.on('pointerover', () => {
                if (this.input.activePointer.isDown){
                    this.movingRight = true; 
                }
            });

            this.touchButton.setInteractive().on('pointerdown', () =>{
                this.buttonPressed = true;
            });
        }
        else{
            this.touchButton = this.add.image(-500, centerY, 'touchButton').setOrigin(0.5, 0.5).setDepth(7).setAlpha(0.7).setScale(1.3);
            this.touchButton.setInteractive().on('pointerdown', () =>{
                this.buttonPressed = true;
            });
        }
        

        if (!this.anims.exists('backw')) {
            this.anims.create({ key: 'backw', frames: this.anims.generateFrameNames('player', { prefix: 'backw', start: 1, end: 3, suffix: ".png"}), frameRate: 3,  repeat: -1});
            this.anims.create({ key: 'frontw', frames: this.anims.generateFrameNames('player', { prefix: 'walkf', start: 1, end: 3, suffix: ".png"}), frameRate: 3, repeat: -1});
            this.anims.create({ key: 'leftw', frames: this.anims.generateFrameNames('player', { prefix: 'leftw', start: 1, end: 3, suffix: ".png"}), frameRate: 3, repeat: -1});
            this.anims.create({ key: 'rightw', frames: this.anims.generateFrameNames('player', { prefix: 'rightw', start: 1, end: 3, suffix: ".png"}), frameRate: 3, repeat: -1});
            this.anims.create({ key: 'idle', frames: this.anims.generateFrameNames('player', { prefix: 'idle', start: 1, end: 2, suffix: ".png"}), frameRate: 1.5, repeat: -1});
        }

        this.interactable = false; // for mobile
        this.hideable = false; // for mobile


        //creating all animations for the game

        this.onEnter();
    }
 

    showTextBox(t, size, i, character) { // text, font size, which spritesheet icon to use
        if (this.bubble) {
            this.bubble.destroy();
            this.text.destroy();
            this.i.destroy();
        }
        let json = character === 'monica' ? 'monica' : 'icon';
        this.bubble = this.add.image(this.w * 0.44, this.h * 0.85, 'speechBubble').setOrigin(0.5, 0.5).setAlpha(1).setScale(1.16, 1);
        this.text = this.add.text(this.w * 0.35, this.h * 0.85, t, { color: '#000000', fontSize: size })
            .setOrigin(0.5, 0.5)
            .setStroke(0x000000, 5);
        this.i = this.add.image(this.w * 0.9, this.h * 0.858, json, i).setAlpha(1).setScale(1); // i == 0 is neutral, i == 1 is irritated
    }

    hideTextBox() {
        if (this.bubble) {
            this.bubble.setAlpha(0);
            this.text.setAlpha(0);
            this.i.setAlpha(0);
        }
    }

    initializePlayer() {
        this.player = this.physics.add.sprite(this.playerLocation.x, this.playerLocation.y, 'player')
            .setOrigin(0, 0)
            .setScale(0.4);
    }

    gotoScene(key) {
        //this.blackedOut.setAlpha(0);
        this.cameras.main.fade(this.transitionDuration, 0, 0, 0);
        this.time.delayedCall(this.transitionDuration, () => {
            this.scene.start(key, {
                location: this.location,
                playerLocation: this.playerLocation,
                playerChased: this.playerChased,
                chaseTime: this.chaseTime,
                timeMove: this.timeMove,
                monsterLocation: this.monsterLocation,
                caught: this.caught,
                finalChaseTime: this.finalChaseTime,
                everChased: this.everChased,
                inventory: this.inventory,
                inventoryImages: this.inventoryImages,
                inventoryDisplaying: this.inventoryDisplaying,
                itemLocations: this.itemLocations,
                fileLocation: this.fileLocations,
                fileImages: this.fileImages,
                fileItems: this.fileItems,
                questions: this.questions,
                karma: this.karma,
                touchMode: this.touchMode
            });
        });
    }

    finalChase() {
        if(this.finalChaseTime) { // if the final chase is ready to begin
            if (this.location.r === 5 && this.location.c === 3) { // if the player just left the safe room
                this.finalChaseTime = false;
                this.timeMove = 3250;
                this.showTextBox('  Don\'t even try hiding this time Kayce', 50, 0, 'monica');
                this.chase('final');
                this.map = this.cache.json.get('map');
                this.map.Levels[0][0].Escape.Locked = 0;
            }
        }
    }

    chase(c) {  // CHANGE 
        if (!this.playerChased) {
            this.pauseMusic('introSong');
            this.playMusic('rushSong');
            this.resumeMusic('rushSong');
            this.playerChased = true;
            let text = c === 'tutorial' ? 'Hide!' : 'Run!';
            let run = this.add.text(this.w * 0.52, this.h * 0.3, text, { color: '#710C04', fontSize: 150 })
                .setOrigin(0.5, 0.5)
                .setStroke(0x000000, 5);
            this.tweens.add({
                targets: run,
                alpha: 0,
                ease: "Linear",
                duration: 4000, 
            });
            if (c === 'tutorial') {
                this.monsterLocation.r = this.location.r - 1;
                this.monsterLocation.c = this.location.c;
            }
            else {
                this.monsterLocation.r = c === 'final' ? this.location.r + 3 : this.location.r - 3;
                this.monsterLocation.c = Phaser.Math.Between(this.location.c - 2, this.location.c + 2);
            }
        }

        this.checkSafe();
    }

    checkSafe() {
        if (this.playerChased && this.questions[3] === null) {
            if (this.location.r === 6 && this.location.c === 3) { // if player is in safe room
                this.playerChased = false;
                this.pauseMusic('rushSong');
                this.resumeMusic('introSong');
            }
        }
    }

    updateMonsterLocation() {
        let r = Phaser.Math.Between(0, 2); // CHANGE
        if (r === 0) { // 1 in 3 to move the monster 2 rooms closer
            this.updateMonsterRow();
            this.updateMonsterColumn();
        }
        else if ((r == 1 && this.monsterLocation.r != this.location.r) || (r == 2 && this.monsterLocation.c == this.location.c)) { // change monsterLocation.r
            this.updateMonsterRow();
        }
        else { // change monsterLocation.c
            this.updateMonsterColumn();
        }
        //console.log(this.monsterLocation.r + " " + this.monsterLocation.c)
        this.checkMonsterWarning();
    }

    startNorthWarning() {
        if (this.NWTween) { // North Wall should be normal
            this.NWTween.stop();
            this.NWarning.destroy();
        }
        this.NWarning = this.add.image(0, 0, 'tRed').setOrigin(0, 0).setDisplaySize(this.w, this.h).setDepth(-1);
        this.NWTween = this.tweens.add({
            targets: this.NWarning,
            alpha: { from: 1, to: 0.5 },
            ease: "Sine.InOut",
            repeat: -1,
            yoyo: true,
            duration: 500, 
        });
    }
    
    stopNorthWarning() {
        if (this.NWTween) { // North Wall should be normal
            this.NWTween.stop();
            this.NWarning.destroy();
        }
    }

    startEastWarning() {
        if (this.EWTween) { // East Wall should be normal
            this.EWTween.stop();
            this.EWarning.destroy();
        }
        this.EWarning = this.add.image(this.w * 0.5, this.h * 0.5, 'rRed').setOrigin(0.5, 0.5).setDisplaySize(this.w, this.h).setDepth(-1);
        this.EWTween = this.tweens.add({
            targets: this.EWarning,
            alpha: { from: 1, to: 0.5 },
            ease: "Sine.InOut",
            repeat: -1,
            yoyo: true,
            duration: 500, 
        });
    }

    stopEastWarning() {
        if (this.EWTween) { // East Wall should be normal
            this.EWTween.stop();
            this.EWarning.destroy();
        }
    }

    startWestWarning() {
        if (this.WWTween) { // West Wall should be normal
            this.WWTween.stop();
            this.WWarning.destroy();
        }
        this.WWarning = this.add.image(0, 0, 'lRed').setOrigin(0, 0).setDisplaySize(this.w, this.h).setDepth(-1);
        this.WWTween = this.tweens.add({
            targets: this.WWarning,
            alpha: { from: 1, to: 0.5 },
            ease: "Sine.InOut",
            repeat: -1,
            yoyo: true,
            duration: 500, 
        });
    }

    stopWestWarning() {
        if (this.WWTween) { // West Wall should be normal
            this.WWTween.stop();
            this.WWarning.destroy();
        }
    }
    
    startSouthWarning() {
        if (this.SWTween) { // South Wall should be normal
            this.SWTween.stop();
            this.SWarning.destroy();
        }
        this.SWarning = this.add.image(this.w * 0.5, this.h * 0.5, 'bRed').setOrigin(0.5, 0.5).setDisplaySize(this.w, this.h).setDepth(-1);
        this.SWTween = this.tweens.add({
            targets: this.SWarning,
            alpha: { from: 1, to: 0.5 },
            ease: "Sine.InOut",
            repeat: -1,
            yoyo: true,
            duration: 500, 
        });
    }

    stopSouthWarning() {
        if (this.SWTween) { // South Wall should be normal
            this.SWTween.stop();
            this.SWarning.destroy();
        }
    }
    
    stopWarnings() {
        this.stopNorthWarning();
        this.stopEastWarning();
        this.stopSouthWarning();
        this.stopWestWarning();
    }
    
    notCaught() {
        this.blackedOutTween = this.tweens.add({
            targets: this.blackedOut,
            alpha: 0,
            duration: 3000,
            ease: "Linear",
        });
        this.playerChased = false;
        this.caught = false;
        this.warning.setAlpha(0);
        this.warningTween.stop();
        this.monsterLocation.r = -5;
        this.monsterLocation.c = -5;
        this.stopWarnings();
    }

    checkMonsterWarning() {     
        if (this.playerChased && !this.caught) {
            if (this.monsterLocation.r === this.location.r && this.monsterLocation.c === this.location.c) {
                if (this.player.alpha === 1 || this.questions[3] !== null) {
                    this.pauseMusic();
                    this.sound.play('doorSqueak');
                    this.scene.start('game over');
                }
                else {
                    this.timeSinceCaught = 0;
                
                    this.blackedOut = this.add.rectangle(0, 0, this.w, this.h)
                        .setOrigin(0,0)
                        .setFillStyle(0x000000);
                    this.caught = !this.caught;
                    let warningText = 'Stay hidden!\nShe\'s here.';
                    this.pauseMusic();
                    this.sound.play('doorSqueak');
                    this.sound.play('heartBeat');
                    this.pauseMusic('rushSong');
                    this.warning = this.add.text(this.w * 0.5, this.h * 0.3, warningText, { color: '#ffffff', fontSize: 150, fontStyle: 'bold' })
                        .setOrigin(0.5, 0.5)
                        .setAlign('center')
                        .setStroke(0x000000, 5);
                    this.warningTween = this.tweens.add({
                        targets: this.warning,
                        alpha: 0,
                        ease: "Linear",
                        repeat: -1,
                        yoyo: true,
                        duration: 5000,
                    });
                }
            }
            let row_diff = this.monsterLocation.r - this.location.r;
            let col_diff = this.monsterLocation.c - this.location.c;

            if(row_diff >= -1 && row_diff <= 1 && col_diff >= -1 && col_diff <= 1) { // North Wall should start flashing red
                this.stopWarnings();
                this.startNorthWarning();
                this.startWestWarning();
                this.startSouthWarning();
                this.startEastWarning();
            }
            else if ((col_diff >= -2 && col_diff <= 2) || (row_diff >= -2 && row_diff <= 2)) {
                if (row_diff === -2 && col_diff >= -2 && col_diff <= 2) { // north
                    this.startNorthWarning();
                }
                else {
                    this.stopNorthWarning();
                }

                if (row_diff === 2 && col_diff >= -2 && col_diff <= 2) { // north
                    this.startSouthWarning();
                }
                else {
                    this.stopSouthWarning();
                }

                if (col_diff === 2 && row_diff >= -2 && row_diff <= 2) { // north
                    this.startEastWarning();
                }
                else {
                    this.stopEastWarning();
                }

                if (col_diff === -2 && row_diff >= -2 && row_diff <= 2) { // north
                    this.startWestWarning();
                }
                else {
                    this.stopWestWarning();
                }
            }
            else {
                this.stopWarnings();
            }
        }

    }

    updateMonsterRow() { // moves the monster 1 row closer to the player
        if (this.monsterLocation.r < this.location.r) {
            this.monsterLocation.r++;
        }
        else if (this.monsterLocation.r > this.location.r) {
            this.monsterLocation.r--;
        }
    }

    updateMonsterColumn() { // moves the monster 1 column closer to the player
        if (this.monsterLocation.c < this.location.c) {
            this.monsterLocation.c++;
        }
        else if (this.monsterLocation.c > this.location.c) {
            this.monsterLocation.c--;
        }
    }

    onEnter() {
        console.warn('This GameScene did not implement onEnter():', this.constructor.name);
    }
}