class GameLevel extends Phaser.Scene {
    init(data) {
        this.location = data.location || {r: 6, c: 3}; 
        this.playerLocation = data.playerLocation || {x: 912, y: 800};
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
        

        if (!this.anims.exists('backw')) {
            this.anims.create({ key: 'backw', frames: this.anims.generateFrameNames('player', { prefix: 'backw', start: 1, end: 3, suffix: ".png"}), frameRate: 3,  repeat: -1});
            this.anims.create({ key: 'frontw', frames: this.anims.generateFrameNames('player', { prefix: 'walkf', start: 1, end: 3, suffix: ".png"}), frameRate: 3, repeat: -1});
            this.anims.create({ key: 'leftw', frames: this.anims.generateFrameNames('player', { prefix: 'leftw', start: 1, end: 3, suffix: ".png"}), frameRate: 3, repeat: -1});
            this.anims.create({ key: 'rightw', frames: this.anims.generateFrameNames('player', { prefix: 'rightw', start: 1, end: 3, suffix: ".png"}), frameRate: 3, repeat: -1});
            this.anims.create({ key: 'idle', frames: this.anims.generateFrameNames('player', { prefix: 'idle', start: 1, end: 2, suffix: ".png"}), frameRate: 1.5, repeat: -1});
        }


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
        this.i = this.add.image(this.w * 0.9, this.h * 0.858, json, i).setAlpha(1).setScale(4.5); // i == 0 is neutral, i == 1 is irritated
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
                questions: this.questions
            });
        });
    }

    finalChase() {
        if(this.finalChaseTime) { // if the final chase is ready to begin
            if (this.location.r === 5 && this.location.c === 3) { // if the player just left the safe room
                this.finalChaseTime = false;
                this.timeMove = 3250;
                this.showTextBox('  You won\'t escape me!!!', 50, 0, 'monica');
                this.chase('final');
            }
        }
    }

    chase(c) {  // CHANGE 
        if (!this.playerChased) {
            this.playerChased = true;
            let run = this.add.text(this.w * 0.52, this.h * 0.3, "Run!", { color: '#710C04', fontSize: 150 })
                .setOrigin(0.5, 0.5)
                .setStroke(0x000000, 5);
            this.tweens.add({
                targets: run,
                alpha: 0,
                ease: "Linear",
                duration: 4000, 
            });
            this.monsterLocation.r = c === 'final' ? this.location.r + 3 : this.location.r - 3;
            this.monsterLocation.c = Phaser.Math.Between(this.location.c - 2, this.location.c + 2);
        }

        if (this.playerChased && this.location.r == 6 && this.location.c == 3) { // safe room stops the player from being chased
            this.playerChased = false;
        }
    }

    checkSafe() {
        if (this.playerChased) {
            if (this.location.r === 6 && this.location.c === 3) { // if player is in safe room
                this.playerChased = false;
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
        this.checkMonsterWarning();
    }

    notCaught() {
        this.blackedOut.setAlpha(0);
        this.playerChased = false;
        this.caught = false;
        this.warning.setAlpha(0);
        this.warningTween.stop();
    }

    checkMonsterWarning() {     
        if (this.playerChased && !this.caught) {
            if (this.monsterLocation.r === this.location.r && this.monsterLocation.c === this.location.c) {
                if (this.player.alpha === 1) {
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
                    let warningText = 'Something is here.\nStay hidden!';
                    this.pauseMusic();
                    this.sound.play('doorSqueak');
                    this.sound.play('heartBeat');
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
                        duration: 3000, 
                    });
                }
            }
            let row_diff = this.monsterLocation.r - this.location.r;
            let col_diff = this.monsterLocation.c - this.location.c;
            if(row_diff === -1 && col_diff >= -1 && col_diff <= 1) { // North Wall should start flashing red
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
            else if (this.NWarning) { // North Wall should be normal
                this.NWTween.stop();
                this.NWarning.destroy();
            }
            
            if(row_diff === 1 && col_diff >= -1 && col_diff <= 1) { // South Wall should start flashing red
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
            else if (this.SWTween) { // South Wall should be normal
                this.SWTween.stop();
                this.SWarning.destroy();
            }

            if(col_diff === 1 && row_diff >= -1 && row_diff <= 1) { // East Wall should start flashing red
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
            else if (this.EWTween) { // East Wall should be normal
                this.EWTween.stop();
                this.EWarning.destroy();
            }

            if(col_diff === -1 && row_diff >= -1 && row_diff <= 1) { // West Wall should start flashing red
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
            else if (this.WWTween) { // West Wall should be normal
                this.WWTween.stop();
                this.WWarning.destroy();
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