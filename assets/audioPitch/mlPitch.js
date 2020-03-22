window.AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext = null;
var mic = null;
var pitch = null
var noteStrings01 = ["Sub-contra","Contra", "Great", "Small", "One-lined", "Two-lined", "Three-lined", "Four-lined", "Five-lined"];
var noteStrings02 = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

cc.Class({
    extends: cc.Component,
 
    properties: {
        label: {
            default: null,
            type: cc.Label
        },
        // defaults, set visually when attaching this script to the Canvas
        text: 'audio',
        keyboard: cc.Node,
        
    },
 
    // use this for initialization
    onLoad: function () {
        this.label.string = this.text;
        audioContext = new AudioContext();
        mic = new p5.AudioIn();
        
        mic.start(this.startPitch);
        
        this.time = 0;
    },
    
    startPitch() {
        //var json = this.model.json
        pitch = ml5.pitchDetection('./res/raw-assets/audioPitch/ml5/model', audioContext, mic.stream, null);
        if(pitch == null)
            console.log("pitch fail")  
      },
    // called every frame
    update: function (dt) {
        this.time += dt;
        if(this.time > 0.1){
            this.time = 0;
            if(pitch != null)
                this.getPitch();
            else
                this.label.string = "loading";
        }
    },
    modelLoaded() {
        console.log("pitch load")
        this.getPitch();
    },

    getPitch() {
        pitch.getPitch(function(err, frequency){
        audioContext.resume();
          if (frequency) {
            // console.log(frequency);
            var note =  this.noteFromPitch(frequency);
            this.label.string = "" + noteStrings01[Math.floor(note/12)-1] + ":" + noteStrings02[note%12];
            this.keyboardSwitch(frequency);
          }
        }.bind(this))
    },
    noteFromPitch( frequency ) {
        var noteNum = 12 * (Math.log( frequency / 440 )/Math.log(2) );
        return Math.round( noteNum ) + 69;
    },
    keyboardRefresh(){
        var node = this.keyboard;
        var i,j;
        var arr01 = node.children;
        for(i=0;i<arr01.length;i++){
            var arr02 = arr01[i].children;
            for(j=0;j<arr02.length;j++){
                var note = arr02[j];
                note.children[0].active = true;
                note.children[1].active = false;
            }
        }
    },
    keyboardSwitch(frequency){
        var note =  this.noteFromPitch(frequency);
        var lineName = noteStrings01[Math.floor(note/12)-1];
        var noteName = noteStrings02[note%12];
        var noteNode,activeNode,steadyNode;
        
        this.keyboardRefresh();
        switch(lineName){
            // case "Great", "Small", "One-lined", "Two-lined"
            case "Great":
                // noteNode = this.keyboard.getChildByName("Great").getChildByName(noteName);
                // cc.log(noteNode);
                // activeNode = this.keyboard.getChildByName("Great").getChildByName(noteName).getChildByName("activeNode");
                // cc.log(activeNode);
                // activeNode.active = true;
                // steadyNode = this.keyboard.getChildByName("Great").getChildByName(noteName).getChildByName("steadyNode");
                // steadyNode.active = false;

                
                activeNode = this.keyboard.getChildByName("Great").getChildByName(noteName).children[1];
                // cc.log(activeNode);
                activeNode.active = true;
                steadyNode = this.keyboard.getChildByName("Great").getChildByName(noteName).children[0];
                steadyNode.active = false;
                break;
            case "Small":
                // noteNode = this.keyboard.getChildByName("Small").getChildByName(noteName);
                // cc.log(noteNode);
                // activeNode = this.keyboard.getChildByName("Small").getChildByName(noteName).getChildByName("activeNode");
                // cc.log(activeNode);
                // activeNode.active = true;
                // steadyNode = this.keyboard.getChildByName("Small").getChildByName(noteName).getChildByName("steadyNode");
                // steadyNode.active = false;

                
                activeNode = this.keyboard.getChildByName("Small").getChildByName(noteName).children[1];
                // cc.log(activeNode);
                activeNode.active = true;
                steadyNode = this.keyboard.getChildByName("Small").getChildByName(noteName).children[0];
                steadyNode.active = false;
                break;
            case "One-lined":
                // noteNode = this.keyboard.getChildByName("One-lined").getChildByName(noteName);
                // cc.log(noteNode);
                // activeNode = this.keyboard.getChildByName("One-lined").getChildByName(noteName).getChildByName("activeNode");
                // cc.log(activeNode);
                // activeNode.active = true;
                // steadyNode = this.keyboard.getChildByName("One-lined").getChildByName(noteName).getChildByName("steadyNode");
                // steadyNode.active = false;

                activeNode = this.keyboard.getChildByName("One-lined").getChildByName(noteName).children[1];
                // cc.log(activeNode);
                activeNode.active = true;
                steadyNode = this.keyboard.getChildByName("One-lined").getChildByName(noteName).children[0];
                steadyNode.active = false;
                break;
            case "Two-lined":
                // noteNode = this.keyboard.getChildByName("Two-lined").getChildByName(noteName);
                // cc.log(noteNode);
                // activeNode = this.keyboard.getChildByName("Two-lined").getChildByName(noteName).getChildByName("activeNode");
                // cc.log(activeNode);
                // activeNode.active = true;
                // steadyNode = this.keyboard.getChildByName("Two-lined").getChildByName(noteName).getChildByName("steadyNode");
                // steadyNode.active = false;

                activeNode = this.keyboard.getChildByName("Two-lined").getChildByName(noteName).children[1];
                // cc.log(activeNode);
                activeNode.active = true;
                steadyNode = this.keyboard.getChildByName("Two-lined").getChildByName(noteName).children[0];
                steadyNode.active = false;
                break;
            default:;
        }
    },
});
 
