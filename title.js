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

        let title = this.add.image(920 , -200, 'title');
        this.playText = this.add.image(990, 2000, 'start').setScale(.6).setInteractive();  
        this.credits = this.add.image(780, 2000, 'credits').setScale(.5).setInteractive();
        this.exit = this.add.image(1240, 2000, 'exit').setScale(.45).setInteractive();     

        const slideDownTitle = this.tweens.add({
            targets: title,
            y : 150,
            duration: 800,
            ease: 'Cosine.easeInOut'
        });
    
        slideDownTitle.play();


        const wiggleTween = this.tweens.add({
            targets: title,
            x: `+=${20}`,
            duration: 3000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
          });
        
        wiggleTween.play();

        const slideDownStart = this.tweens.add({
            targets: this.playText,
            y : 800,
            duration: 2000,
            ease: 'Sine.easeInOut'
        });

        const slideDownCredits = this.tweens.add({
            targets: this.credits,
            y : 980,
            duration: 2000,
            ease: 'Sine.easeInOut'
        });

        const slideDownExit = this.tweens.add({
            targets: this.exit,
            y : 980,
            duration: 2000,
            ease: 'Sine.easeInOut'
        });

        slideDownStart.play();
        slideDownCredits.play();
        slideDownExit.play();
        // Create interactive text    
         
        this.playText.on('pointerdown', () => {
            this.cameras.main.fade(500, 0, 0, 0);
            this.time.delayedCall(500, () => { 
                this.titleScreen.destroy();
                this.playText.destroy();
                this.credits.destroy();
                this.exit.destroy();
                title.destroy();
                this.scene.start('info'); 
            });
        });

        this.playText.on('pointerover', () => {
            this.playText.setScale(.8); 
        });

        this.playText.on('pointerout', () => {
            this.playText.setScale(.6); 
        });
 
        this.credits.on('pointerdown', () => {
            this.cameras.main.fade(500, 0, 0, 0);
            this.time.delayedCall(500, () => { 
                this.titleScreen.destroy();
                this.playText.destroy();
                this.credits.destroy();
                this.exit.destroy();
                title.destroy();
                this.scene.start('credits'); 
            });
        });

        this.credits.on('pointerover', () => {
            this.credits.setScale(.6); 
        });

        this.credits.on('pointerout', () => {
            this.credits.setScale(.5); 
        });

        this.exit.on('pointerdown', () => {
            this.cameras.main.fade(500, 0, 0, 0);
            this.time.delayedCall(500, () => { 
                this.titleScreen.destroy();
                this.playText.destroy();
                this.credits.destroy();
                this.exit.destroy();
                title.destroy();
                window.close();
            });
        });

        this.exit.on('pointerover', () => {
            this.exit.setScale(.55); 
        });

        this.exit.on('pointerout', () => {
            this.exit.setScale(.45); 
        });
        
    }
 }