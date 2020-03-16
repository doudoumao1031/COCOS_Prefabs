// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
        width: {
            default: 800,
            type: cc.Integer,
            notify: function(){
                this.node.width = this.width;
            },
        },
        height: {
            default: 600,
            type: cc.Integer,
            notify: function(){
                this.node.height = this.height;
            },
        },
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        this.node.width = this.width;
        this.node.height = this.height;

        this.pageRightMask = this.node.getChildByName("pageRightMask");
        this.pageRightMask.anchorX = 1;
        this.pageRightMask.anchorY = 0.5;

        this.pageRight = this.pageRightMask.getChildByName("pageRight");
        this.pageRight.anchorX = 0;
        this.pageRight.anchorY = 0.5;

        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    },

    onTouchMove(e,customData){
        // cc.log(e);
        var touchPoint = e.currentTouch._point;
        var touchPointBook = this.node.convertToNodeSpaceAR(touchPoint);
        cc.log(touchPointBook);
        // 斜率 
        var gradient = (touchPointBook.y)/(this.node.width/2 - touchPointBook.x);
        var angle = (Math.atan(gradient)/Math.PI)*180;
        // cc.log(touchPointBook.x,touchPointBook.y,gradient,angle);

        
        this.pageRightMask.x = (touchPointBook.x+this.node.width/2)/2;
        this.pageRightMask.y = touchPointBook.y/2;
        this.pageRightMask.angle = -angle;
        // this.scheduleOnce(()=>{
        var touchPointRightMask = this.pageRightMask.convertToNodeSpaceAR(touchPoint);
        this.pageRight.x = touchPointRightMask.x;
        this.pageRight.y = touchPointRightMask.y;
        this.pageRight.angle = -angle;
        // },0);
        // cc.log()
    }

    // update (dt) {},
});
