export default class Title extends Phaser.Scene {
    constructor() {
        super('title');
    }

    create() {
        this.titleScreen = this.add.image(0, 0, 'titleTable');
        this.titleScreen.setOrigin(0, 0);
        this.titleScreen.displayWidth = this.cameras.main.width;
        this.titleScreen.displayHeight = this.cameras.main.height;

        this.playText = this.add.image(990, 875, 'start').setScale(.8);
        this.title = this.add.image(920 , 150, 'title');

        // Create interactive text
        this.playText.setInteractive();
        
        this.playText.on('pointerdown', () => {
            this.titleScreen.destroy();
            this.playText.destroy();
            this.title.destroy();
            this.scene.start('start');
        });

        this.playText.on('pointerover', () => {
            this.playText.setScale(1); 
        });

        this.playText.on('pointerout', () => {
            this.playText.setScale(.8); 
        });
        
    }
 }