window.AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext = null;
var mic = null;
var pitch = null
var noteStrings = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

cc.Class({
    extends: cc.Component,
 
    properties: {
        label: {
            default: null,
            type: cc.Label
        },
        // defaults, set visually when attaching this script to the Canvas
        text: 'audio',
        
    },
 
    // use this for initialization
    onLoad: function () {
        this.label.string = this.text;
        audioContext = new AudioContext();
        mic = new p5.AudioIn();
        mic.start(this.startPitch);
    },
    
    startPitch() {
        //var json = this.model.json
        pitch = ml5.pitchDetection('./res/raw-assets/audioPitch/ml5/model', audioContext, mic.stream, null);
        if(pitch == null)
            console.log("pitch fail")  
      },
    // called every frame
    update: function (dt) {
        if(pitch != null)
            this.getPitch();
        else
            this.label.string = "loading";
    },
    modelLoaded() {
        console.log("pitch load")
        this.getPitch();
      },

    getPitch() {
        pitch.getPitch(function(err, frequency){
        audioContext.resume();
          if (frequency) {
           console.log(frequency);
           var note =  this.noteFromPitch(frequency);
           this.label.string = ""+ noteStrings[note%12];
          }
        }.bind(this))
    },
    noteFromPitch( frequency ) {
        var noteNum = 12 * (Math.log( frequency / 440 )/Math.log(2) );
        return Math.round( noteNum ) + 69;
    },
});
 
