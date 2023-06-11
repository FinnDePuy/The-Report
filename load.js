export default class Load extends Phaser.Scene {
    constructor() {
        super('load');
    }
 
    preload() {
        this.cameras.main.setBackgroundColor('#000000');

        // Display a loading bar
        let progressBar = this.add.graphics();
        let progressBox = this.add.graphics();
        let w = this.cameras.main.width;
        let h = this.cameras.main.height;
        let loadingText = this.make.text({
            x: w / 2 + 10,
            y: h / 2 - 100,
            text: 'Loading...',
            style: {
                font: '66px monospace',
                fill: '#ffffff'
            }
        });
        loadingText.setOrigin(0.5, 0.5);

        progressBox.fillStyle(0xaaaaaa, 0.8);
        progressBox.fillRect(w / 2 - 320, h / 2 - 30, 640, 100);
        
        // Load your game assets here
        this.load.image('cabinetZone', 'assets/images/RedZone.png');
        this.load.image('fileCabinet', 'assets/images/File_Cabinet.png');
        this.load.image('hSprite', 'assets/images/hSprite.png');
        this.load.image('eSprite', 'assets/images/eSprite.png');
        this.load.image('speechBubble', 'assets/images/speechBubble.png');
        this.load.image('cabinet', 'assets/images/Cabinet.png');
        this.load.spritesheet('icon', 'sprites/alex/alexr.png', { frameWidth: 204, frameHeight: 204 });
        this.load.spritesheet('monica', 'assets/images/monicasheet.png', { frameWidth: 204, frameHeight: 204 });
        this.load.json('map', 'assets/json/map.json');

        this.load.image('arrowU', 'assets/touch/arrowU.png');
        this.load.image('arrowD', 'assets/touch/arrowD.png');
        this.load.image('arrowL', 'assets/touch/arrowL.png');
        this.load.image('arrowR', 'assets/touch/arrowR.png');
        this.load.image('touchButton', 'assets/touch/button.png');


        this.load.image('defaultFloor', 'assets/images/defaultFloor.png');
        this.load.image('defaultWall', 'assets/images/defaultWall.png');
        this.load.image('hiddenImage', 'assets/images/hiddenImage.png');
        this.load.image('titleTable', 'assets/images/titleTable.png');
        this.load.image('title', 'assets/images/Title.png');
        this.load.image('start', 'assets/images/start.png');
        this.load.image('restart', 'assets/images/restart.png');

        this.load.image('backpack', 'assets/images/backpack.png');

        this.load.image('lRed', 'assets/images/LEFTRED.png');
        this.load.image('rRed', 'assets/images/RIGHTRED.png');
        this.load.image('tRed', 'assets/images/TOPRED.png');
        this.load.image('bRed', 'assets/images/BOTTOMRED.png');


        this.load.image('lDoor', 'assets/images/LOCKEDDOOR.png');
        this.load.image('uDoor', 'assets/images/UNLOCKEDDOOR.png');

        //questions
        this.load.image('BLANKBLACK', 'assets/images/questions/BLANKBLACK.png');
        this.load.image('BLANKWHITE', 'assets/images/questions/BLANKWHITE.png');
        this.load.image('background', 'assets/images/questions/question1/background.png');
        //question 1
        this.load.image('question1', 'assets/images/questions/question1/QUESTION1TEXT.png');
        this.load.image('question1-1', 'assets/images/questions/question1/ACTINGOFFCHOICE.png');
        this.load.image('question1-2', 'assets/images/questions/question1/HARASSINGSOMEONECHOICE.png');
        this.load.image('question1-3', 'assets/images/questions/question1/SOUNDMENTALLYCHOICE.png');
        //question 2
        this.load.image('question2', 'assets/images/questions/question2/QUESTION2TEXT.png');
        this.load.image('question2-1', 'assets/images/questions/question2/BLACKMAILINGCHOICE.png');
        this.load.image('question2-2', 'assets/images/questions/question2/SUSPECTEDCHOICE.png');
        this.load.image('question2-3', 'assets/images/questions/question2/WAITING CHOICE.png');
        //question 3
        this.load.image('question3', 'assets/images/questions/question3/QUESTION3TEXT.png');
        this.load.image('question3-1', 'assets/images/questions/question3/BEING UNFAITHFUL.png');
        this.load.image('question3-2', 'assets/images/questions/question3/STARTEDDATING.png');
        this.load.image('question3-3', 'assets/images/questions/question3/WASVIOLATING.png');
        //question 4
        this.load.image('question4', 'assets/images/questions/question4/question4text.png');
        this.load.image('question4-1', 'assets/images/questions/question4/BYFATHER.png');
        this.load.image('question4-2', 'assets/images/questions/question4/BYOUTSIDE.png');
        this.load.image('question4-3', 'assets/images/questions/question4/DISCOURAGEDBYOTHERS.png');


        this.load.image('desk', 'assets/images/desk.png');
        this.load.image('chair', 'assets/images/chair.png');

        this.load.image('doorN', 'assets/images/doorN.png');
        this.load.image('doorS', 'assets/images/doorS.png');
        this.load.image('doorE', 'assets/images/doorE.png');
        this.load.image('doorW', 'assets/images/doorW.png');


        this.load.image('+Victory', 'assets/images/DANIELENDINGvictory.png');
        this.load.image('-Victory', 'assets/images/MONICAvictory.png');
        this.load.image('=Victory', 'assets/images/NEUTRALvictory.png');
        this.load.image('NegativeBackground', 'assets/images/negativeBackground.png');
        this.load.image('PositiveBackground', 'assets/images/positiveBackground.png');
        this.load.image('NeutralBackground', 'assets/images/NeutralBackground.png');


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



        this.load.image('xIcon', 'assets/images/x.png');
        this.load.image('rArrow', 'assets/images/rightArrow.png');
        this.load.image('lArrow', 'assets/images/leftArrow.png');

        this.load.image('phoneOption', 'assets/images/phoneOption.png');
        this.load.image('computerOption', 'assets/images/computerOption.png');
        this.load.image('cover', 'assets/images/introscene3.png');

        this.load.audio('doorOpen', "assets/audio/doorOpen.mp3");
        this.load.audio('doorClose', "assets/audio/doorClose.mp3");
        this.load.audio('fileOpen', "assets/audio/fileOpen.mp3");
        this.load.audio('fileClose', "assets/audio/fileClose.mp3");
        this.load.audio('heartBeat', "assets/audio/heartBeat.mp3");
        this.load.audio('doorSqueak', "assets/audio/doorSqueak.mp3");
        this.load.audio('writing', "assets/audio/writing.mp3");
        this.load.audio('walking', "assets/audio/walking.mp3");
        this.load.audio('paperPickup', "assets/audio/paperPickup.mp3");
        this.load.audio('itemPickup', "assets/audio/itemPickup.mp3");
        this.load.audio('voicemail', "assets/audio/Voicemail.mp3");

        //songs
        this.load.audio('introSong', 'assets/audio/introSong.mp3')
        this.load.audio('rushSong', 'assets/audio/rushSong.mp3')

        // Update the loading progress bar
        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(w / 2 - 310, h / 2 - 20, 600 * value, 80);
        });

        // Remove the loading screen and transition to the next scene
        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            this.scene.start('title');
        });
    }
 }
