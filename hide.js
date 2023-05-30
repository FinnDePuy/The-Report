class hide extends Phaser.GameObjects.Sprite
{
    constructor(scene, map) {
        super(scene);
        this.hideableObjects = [];
        this.map = map;
    }

    preload(){
        this.load.image('cabinetZone', 'assets/RedZone.png');
        this.load.image('hSprite', 'assets/hSprite.png');
        this.load.image('eSprite', 'assets/eSprite.png');
        this.load.image('cabinet', 'assets/Cabinet.png')
    }

    // hide(){

    // }

    //sets opacity and returns true if the object is hideable
    checkHideable(player/*, keys*/) {
        for (let i = 0; i < this.hideableObjects.length; i++) {
            let object = this.hideableObjects[i];
            if (this.isOverlap(player, object.zoneObject)) {
                if (object.hSprite.alpha === 0) {
                    object.hSprite.setAlpha(1);
                    return true;
                }
            }
            else {
                if (object.hSprite.alpha === 1) {
                    object.hSprite.setAlpha(0);
                }
            }
        }
        return false;
    }

    createObject(object, zone, h, x, y) {
        var sprite = this.add.sprite(object, x, y); // object asset;
        return sprite;
        //return { 
            //hidingObject : this.add.sprite(object, x, y), // object asset
            //zoneObject : this.add.sprite(zone, x, y + 50), // zone around object in which players can interact
            //hSprite : this.add.sprite(h, x + 50, y) // shows player they can press h when in the zone
        //};
    }

    initializeCabinet() {
        //this.hideableObjects = [];
        //console.log("In Initialize Cabinet");
        let cabinet = this.map.Cabinets;
        if (cabinet) {
            console.log(cabinet);
            for (let i = 0; i < cabinet.length; i++) {
                this.hideableObjects.push(this.createObject('cabinet', 'cabinetZone', 'hSprite', cabinet[i].x, cabinet[i].y));
            }
        }
    }

    // show() {
        
    // }

    //checks if item1 and item2 are overlapping
    isOverlap(player, zone){
        var bound1 = player.getBounds();
        var bound2 = zone.getBounds();
        //the bound increase below is for a fix hitbox increase
        bound2.width += 300;
        bound2.height += 300;
        return Phaser.Geom.Intersects.RectangleToRectangle(bound1, bound2);
    }

}




