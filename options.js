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

        let closed = false;

        this.add.text(this.w * 0.5, this.h * 0.12, "Which device are you playing on?").setFont('bold 60px Arial').setOrigin(0.5, 0.5);

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
                            touchMode: true,
                            cc: closed
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
                            touchMode: false,
                            cc: closed
                        });
                    });
                }
            }); 

        let cc = this.add.image(this.w * 0.48, this.h * 0.85, 'cc')
            .setAlpha(0.2)
            .setScale(0.8)
            .setInteractive()
            .on('pointerover', () => {
                cc.setScale(0.9);
            })
            .on('pointerout', () => {
                cc.setScale(0.8);
            })
            .on('pointerdown', () => {
                if (cc.alpha === 0.2) {
                    closed = true;
                    cc.setAlpha(1);
                }
                else {
                    closed = false;
                    cc.setAlpha(0.2);
                }
            }); 
    }
 }