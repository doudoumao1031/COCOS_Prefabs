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
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        var that = this;

        console.log("agora sdk version: " + AgoraRTC.VERSION + " compatible: " + AgoraRTC.checkSystemRequirements())
        if(!AgoraRTC.checkSystemRequirements()){
            return
        }

        // 布局视频播放器容器
        var Cocos2dGameContainer = document.getElementById('Cocos2dGameContainer');
        var videocont = document.createElement('div');
        videocont.id = "VideoContainer";
        videocont.style.position = 'absolute';
        videocont.style.top = '0';
        videocont.style.left = '0';
        Cocos2dGameContainer.appendChild(videocont);
        // rtc object
        window.rtc = {
            client: null,
            joined: false,
            published: false,
            localStream: null,
            remoteStreams: [],
            params: {}
        };
        
        // Options for joining a channel
        window.option = {
            appID: "b417fc3f0e2b4050a9477442295022fb",
            channel: "232579",
            uid: null,
            token: "006b417fc3f0e2b4050a9477442295022fbIAA7zxLwoRX8UTpR2zwW8PGpQbTCAAZbMTiSPb8HMmJvnD76cakAAAAAEACrNb9skzt4XgEAAQCVO3he"
        }
  
        // Create a client
        rtc.client = AgoraRTC.createClient({mode: "live", codec: "h264"});

        // Initialize the client
        rtc.client.init(option.appID, function () {
            console.log("init success");
        }, (err) => {
            console.error(err);
        });

        // The value of role can be "host" or "audience".
        rtc.client.setClientRole("host"); 

        // Join a channel
        rtc.client.join(option.token ? option.token : null, option.channel, option.uid ? +option.uid : null, function (uid) {
            console.log("join channel: " + option.channel + " success, uid: " + uid);
            rtc.params.uid = uid;
            that.createLocalStream();
            that.listenRemoteStream();
        }, function(err) {
            console.error("client join failed", err)
        })

        
    },

    // update (dt) {},

    // 创建并发布本地流
    createLocalStream(){
        // Create a local stream
        rtc.localStream = AgoraRTC.createStream({
            streamID: rtc.params.uid,
            audio: true,
            video: true,
            screen: false,
        });
        // Initialize the local stream
        rtc.localStream.init(function () {
            console.log("init local stream success");
            // Publish the local stream
            rtc.client.publish(rtc.localStream, function (err) {
                console.log("publish failed");
                console.error(err);
            })
        }, function (err) {
            console.error("init local stream failed ", err);
        });
  
  
    },

    // 监听并订阅远端频道
    listenRemoteStream(){
        var that = this;
        rtc.client.on("stream-added", function (evt) {  
            var remoteStream = evt.stream;
            var id = remoteStream.getId();
            if (id !== rtc.params.uid) {
                rtc.client.subscribe(remoteStream, function (err) {
                    console.log("stream subscribe failed", err);
                })
            }
            console.log('stream-added remote-uid: ', id);
        });

        rtc.client.on("stream-subscribed", function (evt) {
            var remoteStream = evt.stream;
            var id = remoteStream.getId();
            // Add a view for the remote stream.
            that.addView(id);
            // Play the remote stream.
            remoteStream.play("remote_video_" + id);
            console.log('stream-subscribed remote-uid: ', id);
        })

        rtc.client.on("stream-removed", function (evt) {
            var remoteStream = evt.stream;
            var id = remoteStream.getId();
            // Stop playing the remote stream.
            remoteStream.stop("remote_video_" + id);
            // Remove the view of the remote stream. 
            that.removeView(id);
            console.log('stream-removed remote-uid: ', id);
        })
    },

    addView (id, show) {
        var VideoContainer = document.getElementById('VideoContainer');
        // var video0 = document.getElementsByClassName('cocosVideo')[0];
        // video0.id = "remote_video_" + id;
        // cc.log("初始化播放器", video0);
        // 不能video里面加video

        cc.log("初始化播放器", VideoContainer);
        var videocont = document.createElement('div');
        videocont.id = "remote_video_" + id;
        videocont.style.width = '480px';
        videocont.style.height = '320px';
        VideoContainer.appendChild(videocont);  

        // if (!$("#" + id)[0]) {
        //   $("<div/>", {
        //     id: "remote_video_panel_" + id,
        //     class: "video-view",
        //   }).appendTo("#video");
        //   $("<div/>", {
        //     id: "remote_video_" + id,
        //     class: "video-placeholder",
        //   }).appendTo("#remote_video_panel_" + id);
        //   $("<div/>", {
        //     id: "remote_video_info_" + id,
        //     class: "video-profile " + (show ? "" :  "hide"),
        //   }).appendTo("#remote_video_panel_" + id);
        //   $("<div/>", {
        //     id: "video_autoplay_"+ id,
        //     class: "autoplay-fallback hide",
        //   }).appendTo("#remote_video_panel_" + id);
        // }
    },

    removeView (id) {
        if ($("#remote_video_panel_" + id)[0]) {
          $("#remote_video_panel_"+id).remove();
        }
    },

    // 获取当前输入设备
    getDevices(){
        AgoraRTC.getDevices(function (items) {
            items.filter(function (item) {
                return ['audioinput', 'videoinput'].indexOf(item.kind) !== -1
            })
            .map(function (item) {
                return {
                name: item.label,
                value: item.deviceId,
                kind: item.kind,
                }
            });
            var videos = [];
            var audios = [];
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                if ('videoinput' == item.kind) {
                    var name = item.label;
                    var value = item.deviceId;
                    if (!name) {
                    name = "camera-" + videos.length;
                    }
                    videos.push({
                    name: name,
                    value: value,
                    kind: item.kind
                    });
                }
                if ('audioinput' == item.kind) {
                    var name = item.label;
                    var value = item.deviceId;
                    if (!name) {
                    name = "microphone-" + audios.length;
                    }
                    audios.push({
                    name: name,
                    value: value,
                    kind: item.kind
                    });
                }
            }
            // next({videos: videos, audios: audios});
            cc.log("当前输入设备:", {videos: videos, audios: audios});
        });
    },
});
