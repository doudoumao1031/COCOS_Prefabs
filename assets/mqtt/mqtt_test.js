// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html
//var mqtt = require('mqtt.min.js')
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
       
            msg: {
                default: null,
                type: cc.Label
            },
            push:{
                default: null,
                type: cc.Button
            },
            input:{
                default: null,
                type: cc.EditBox
            },
           
           client: null,
            

    },

    // LIFE-CYCLE CALLBACKS:

     onLoad () {

        /*
        var options = {
            username:'75829',
            clientId:'2287004',
            password:'IIOu0oFUg1guk20ornTK1uzAcnM=',
            keepalive: 60,
          }
          //{host:'183.230.40.39',port: '6002',}
        //var client  = mqtt.connect('mqtt://183.230.40.39:6002',options);
        */
        var roomId = '225';   //默认订阅该topic，订阅相同topic的client相当于处于一个聊天群
        this.client  = mqtt.connect('ws://49.234.194.5:9001'); 
        // 连接成功后在该回调函数中订阅一个主题
        this.client.on('connect', function () {
            this.client.subscribe(roomId, function (err) {
                if (!err) {
                    this.client.publish(roomId, 'Hello mqtt')
                }
            }.bind(this))
        }.bind(this))

        //接收消息回调，收到订阅topic的实时消息后调用里面的function
        this.client.on('message', function (topic, message) {
        // message is Buffer
        console.log(message.toString());
        this.msg.string = message.toString();
        }.bind(this))


        this.push.node.on('click', function (button) {
            //this.msg.string = 'click';
            let msg = this.input.string;
            this.client.publish(roomId, msg)  // 对roomId这个主题推送消息
         }.bind(this))

     },

    start () {

    },

    update (dt) {


    },
    onDestroy()
    {
        if(this.client != null)
            this.client.end();
    }
});
