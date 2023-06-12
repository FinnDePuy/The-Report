export default class Credits extends Phaser.Scene {
    constructor() {
        super('credits');
    }

    create() {
        this.transitionDuration = 250;
        this.cameras.main.fadeIn(this.transitionDuration, 0, 0, 0);
        this.cameras.main.setBackgroundColor('#000000');
        this.w = this.game.config.width;
        this.h = this.game.config.height;

        this.add.text(this.w * 0.5, this.h * 0.2, "Created By:").setFontSize(60).setOrigin(0.5, 0.5).setAlign('center');
        this.add.text(this.w * 0.5, this.h * 0.3, "Jackson Nadler-Block").setFontSize(60).setOrigin(0.5, 0.5).setAlign('center');
        this.add.text(this.w * 0.5, this.h * 0.4, "Miles Berman").setFontSize(60).setOrigin(0.5, 0.5).setAlign('center');
        this.add.text(this.w * 0.5, this.h * 0.5, "Finn Depuy").setFontSize(60).setOrigin(0.5, 0.5).setAlign('center');
        this.add.text(this.w * 0.5, this.h * 0.6, "Nicholas Schetman").setFontSize(60).setOrigin(0.5, 0.5).setAlign('center');

        let reload = this.add.image(this.w * 0.5, this.h * 0.8, 'restart')
        .setInteractive()
        .setDepth(2)
        .on('pointerover', () => reload.setScale(1.2))
        .on('pointerout', () => reload.setScale(1))
        .on('pointerdown', () => {
            location.reload();
        });
        // let reload = this.add.text(this.w * 0.5, this.h * 0.8, "Play Again").setFontSize(60).setOrigin(0.5, 0.5).setAlign('center')
        //     .setInteractive()
        //     .setDepth(2)
        //     .on('pointerover', () => reload.setScale(1.2))
        //     .on('pointerout', () => reload.setScale(1))
        //     .on('pointerdown', () => {
        //         location.reload();
        //     });     
    }
 }