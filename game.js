class GameLevel extends Phaser.Scene {
    init(data) {
        this.location = data.location || {r: 3, c: 1};
        this.playerLocation = data.playerLocation || {x: 912, y: 492};
        this.playerChased = data.playerChased || false;
        this.monsterLocation = data.monsterLocation || {r: 0, c: 0};
        this.chaseTime = data.chaseTime || 0;
        this.caught = data.caught || false;
        this.everChased = data.everChased || false;
    }

    constructor(key, name) {
        super(key);
        this.name = name;
    }

    create() {
        this.transitionDuration = 500;

        this.w = this.game.config.width;
        this.h = this.game.config.height;
        this.s = this.game.config.width * 0.01;

        this.speed = 500;

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

        // textBox
        this.shown = false;
        this.input.keyboard.on('keydown-' + 'T', () => { 
            if (!this.shown) {
                this.showTextBox("Hi! How are you?", 100, 0);
            } else {
                this.hideTextBox();
            }
            this.shown = !this.shown;
        });

        this.onEnter();
    }

    showTextBox(t, size, i) { // text, font size, which spritesheet icon to use
        this.bubble = this.add.image(this.w * 0.44, this.h * 0.85, 'speechBubble').setOrigin(0.5, 0.5).setAlpha(1).setScale(1.16, 1);
        this.text = this.add.text(this.w * 0.35, this.h * 0.85, t, { color: '#000000', fontSize: size })
            .setOrigin(0.5, 0.5)
            .setStroke(0x000000, 5);
        this.i = this.add.image(this.w * 0.9, this.h * 0.81, 'icon', i).setAlpha(1).setScale(3); // i == 0 is neutral, i == 1 is irritated
    }

    hideTextBox() {
        this.bubble.setAlpha(0);
        this.text.setAlpha(0);
        this.i.setAlpha(0);
    }

    initializePlayer() {
        this.player = this.physics.add.image(this.playerLocation.x, this.playerLocation.y, 'player')
            .setOrigin(0, 0);
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
                monsterLocation: this.monsterLocation,
                caught: this.caught,
                everChased: this.everChased
            });
        });
    }

    chase(c) {
        if (!this.playerChased && ((this.location.r == 0 && !this.everChased) || c == 1)) { // Player starts getting chased when they reach the top of the map
            this.everChased = true;
            this.playerChased = !this.playerChased;
            let run = this.add.text(this.w * 0.52, this.h * 0.3, "Run!", { color: '#710C04', fontSize: 150 })
                .setOrigin(0.5, 0.5)
                .setStroke(0x000000, 5);
            this.tweens.add({
                targets: run,
                alpha: 0,
                ease: "Linear",
                duration: 4000, 
            });
            if (c == 1) { // if key was pressed to start chase
                if (this.location.r == 0 || this.location.r == 1) {
                    this.monsterLocation.r = 2; // Monster at least 2 rooms below player
                }
                else {
                    this.monsterLocation.r = 0; // Monster at least 2 rooms below player
                }
            }
            else {
                this.monsterLocation.r = 2; // Monster at least 2 rooms below player
            }
            this.monsterLocation.c = Phaser.Math.Between(0, 2); // Monster in a random column 
        }
        if (this.playerChased && this.location.r == 3 && this.location.c == 1) { // safe room stops the player from being chased
            this.playerChased = !this.playerChased;
            this.everChased = false;
        }
    }

    updateMonsterLocation() {
        let r = Phaser.Math.Between(0, 2);
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

    checkMonsterWarning() {
        // if you escape when cross
        if(this.playerChased && this.caught && (this.monsterLocation.r != this.location.r || this.monsterLocation.c != this.location.c)) { // if the player was caught but got away
            this.playerChased = !this.playerChased;
            this.caught = !this.caught;
            //console.log("No longer being chased");
        }
        
        if (this.playerChased) {
            if (this.monsterLocation.r == this.location.r && this.monsterLocation.c == this.location.c) {
                this.blackedOut = this.add.rectangle(0, 0, this.w, this.h)
                    .setOrigin(0,0)
                    .setFillStyle(0x000000);
                this.caught = !this.caught;
                let warning = this.add.text(this.w * 0.5, this.h * 0.3, "Get out now!", { color: '#ffffff', fontSize: 150, fontStyle: 'bold' })
                    .setOrigin(0.5, 0.5)
                    .setAlign('center')
                    .setStroke(0x000000, 5);
                this.tweens.add({
                    targets: warning,
                    alpha: 0,
                    ease: "Linear",
                    duration: 3000, 
                });
            }
            let row_diff = this.monsterLocation.r - this.location.r;
            let col_diff = this.monsterLocation.c - this.location.c;
            if(row_diff == -1 && col_diff >= -1 && col_diff <= 1) { // North Wall should start flashing red
                this.NW.setFillStyle(0x710C04);
                this.NWTween = this.tweens.add({
                    targets: this.NW,
                    alpha: { from: 1, to: 0.5 },
                    ease: "Sine.InOut",
                    repeat: -1,
                    yoyo: true,
                    duration: 500, 
                });
            }
            else if (this.NWTween){ // North Wall should be normal
                this.NWTween.stop();
                this.NW.setFillStyle(0x323232);
            }

            if(row_diff == 1 && col_diff >= -1 && col_diff <= 1) { // South Wall should start flashing red
                this.SW.setFillStyle(0x710C04);
                this.SWTween = this.tweens.add({
                    targets: this.SW,
                    alpha: { from: 1, to: 0.5 },
                    ease: "Sine.InOut",
                    repeat: -1,
                    yoyo: true,
                    duration: 500, 
                });
            }
            else if (this.SWTween){ // South Wall should be normal
                this.SWTween.stop();
                this.SW.setFillStyle(0x323232);
            }

            if(col_diff == 1 && row_diff >= -1 && row_diff <= 1) { // East Wall should start flashing red
                this.EW.setFillStyle(0x710C04);
                this.EWTween = this.tweens.add({
                    targets: this.EW,
                    alpha: { from: 1, to: 0.5 },
                    ease: "Sine.InOut",
                    repeat: -1,
                    yoyo: true,
                    duration: 500, 
                });
            }
            else if (this.EWTween) { // East Wall should be normal
                this.EWTween.stop();
                this.EW.setFillStyle(0x323232);
            }

            if(col_diff == -1 && row_diff >= -1 && row_diff <= 1) { // West Wall should start flashing red
                this.WW.setFillStyle(0x710C04);
                this.WWTween = this.tweens.add({
                    targets: this.WW,
                    alpha: { from: 1, to: 0.5 },
                    ease: "Sine.InOut",
                    repeat: -1,
                    yoyo: true,
                    duration: 500, 
                });
            }
            else if (this.WWTween) { // West Wall should be normal
                this.WWTween.stop();
                this.WW.setFillStyle(0x323232);
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

    //checks if item1 and item2 are overlapping
    isOverlap(item1, item2){
        var bound1 = item1.getBounds();
        var bound2 = item2.getBounds();
        //the bound increase below is for a fix hitbox increase
        bound2.width += 300;
        bound2.height += 300;
        return Phaser.Geom.Intersects.RectangleToRectangle(bound1, bound2);
    }

    // isClose(item1, item2){
    //     var bound1 = item1.getBounds() 
    // }

    onEnter() {
        console.warn('This GameScene did not implement onEnter():', this.constructor.name);
    }
}