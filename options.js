export default class Options extends Phaser.Scene {
    constructor() {
        super('options');
    }

    create() {
        this.transitionDuration = 250;
        this.cameras.main.fadeIn(this.transitionDuration, 0, 0, 0);
        this.cameras.main.setBackgroundColor('#000000')
        this.w = this.game.config.width;
        this.h = this.game.config.height;

        this.add.text(this.w * 0.5, this.h * 0.12, "Which device are you playing on?").setFontSize(60).setOrigin(0.5, 0.5);

        let sceneChange = false;

        this.phone = this.add.image(this.w * 0.3, this.h * 0.5, 'phoneOption')
            .setScale(2)
            .setOrigin(0.5, 0.5)
            .setInteractive()
            .on('pointerover', () => {
                this.phone.setScale(2.2);
            })
            .on('pointerout', () => {
                this.phone.setScale(2);
            })
            .on('pointerdown', () => {
                if (!this.sceneChange) {
                    this.sceneChange = true;
                    this.cameras.main.fade(this.transitionDuration, 0, 0, 0);
                    this.time.delayedCall(this.transitionDuration, () => {
                        this.computer.destroy();
                        this.phone.destroy();
                        this.scene.start('start', {
                            touchMode: true
                        });
                    });
                }
            });

        

        this.computer = this.add.image(this.w * 0.7, this.h * 0.5, 'computerOption')
            .setScale(2)
            .setOrigin(0.5, 0.5)
            .setInteractive()
            .on('pointerover', () => {
                this.computer.setScale(2.2);
            })
            .on('pointerout', () => {
                this.computer.setScale(2);
            })
            .on('pointerdown', () => {
                if (!this.sceneChange) {
                    this.sceneChange = true;
                    this.cameras.main.fade(this.transitionDuration, 0, 0, 0);
                    this.time.delayedCall(this.transitionDuration, () => {
                        this.computer.destroy();
                        this.phone.destroy();
                        this.scene.start('start', {
                            touchMode: false
                        });
                    });
                }
            });       
    }
 }