export default class Title extends Phaser.Scene {
    constructor() {
        super('title');
    }

    create() {
        this.cameras.main.fadeIn(250, 0, 0, 0);
        this.cameras.main.setBackgroundColor('#000000')
        this.titleScreen = this.add.image(0, 0, 'titleTable');
        this.titleScreen.setOrigin(0, 0);
        this.titleScreen.displayWidth = this.cameras.main.width;
        this.titleScreen.displayHeight = this.cameras.main.height;

        this.playText = this.add.image(990, 875, 'start').setScale(.8);
        let title = this.add.image(920 , 150, 'title');

        const wiggleTween = this.tweens.add({
            targets: title,
            x: `+=${20}`,
            duration: 3000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
          });
        
        wiggleTween.play();

        // Create interactive text
        this.playText.setInteractive();
        
        this.playText.on('pointerdown', () => {
            this.cameras.main.fade(500, 0, 0, 0);
            this.time.delayedCall(500, () => { 
                this.titleScreen.destroy();
                this.playText.destroy();
                title.destroy();
                this.scene.start('info'); 
            });
        });

        this.playText.on('pointerover', () => {
            this.playText.setScale(1); 
        });

        this.playText.on('pointerout', () => {
            this.playText.setScale(.8); 
        });
        
    }
 }