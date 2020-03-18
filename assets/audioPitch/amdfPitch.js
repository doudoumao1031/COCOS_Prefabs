window.AudioContext = window.AudioContext || window.webkitAudioContext;
var buflen = 1024;
//var buf = new Float32Array( buflen );
var audioContext = null;
var mediaStreamSource = null;
var analyser = null;
var MIN_SAMPLES = 0;  // will be initialized when AudioContext is created.
var GOOD_ENOUGH_CORRELATION = 0.95; // this is the "bar" for how close a correlation needs to be
var noteStrings = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
 
const DEFAULT_MIN_FREQUENCY = 82;
const DEFAULT_MAX_FREQUENCY = 1000;
const DEFAULT_RATIO = 5;
const DEFAULT_SENSITIVITY = 0.1;
const DEFAULT_SAMPLE_RATE = 44100
const sampleRate =  DEFAULT_SAMPLE_RATE;
const minFrequency =  DEFAULT_MIN_FREQUENCY;
const maxFrequency =  DEFAULT_MAX_FREQUENCY;
const sensitivity =  DEFAULT_SENSITIVITY;
const ratio =  DEFAULT_RATIO;
const amd = [];
cc.Class({
    extends: cc.Component,
 
    properties: {
        label: {
            default: null,
            type: cc.Label
        },
        // defaults, set visually when attaching this script to the Canvas
        text: 'Hello, World!',
        
    },
 
    // use this for initialization
    onLoad: function () {
        this.label.string = this.text;
        audioContext = new AudioContext();
        this.toggleLiveInput();
       // audioContext.resume();
    },
 
    // called every frame
    update: function (dt) {
        if(analyser != null)
          this.updatePitch();
    },
 
   getUserMedia(dictionary, callback) {
        try {
            navigator.getUserMedia = 
                navigator.getUserMedia ||
                navigator.webkitGetUserMedia ||
                navigator.mozGetUserMedia;
                navigator.getUserMedia(dictionary, callback, function (e) {
                alert('Error getting audio');
                console.log(e);
            });
        } catch (e) {
            alert('getUserMedia threw exception :' + e);
        }
    },
 
    gotStream(stream) {
        // Create an AudioNode from the stream.
       // this._audioContext = new AudioContext();
         //audioContext = new AudioContext();
        mediaStreamSource = audioContext.createMediaStreamSource(stream);
        // Connect it to the destination.
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        mediaStreamSource.connect( analyser );
        this.updatePitch();
        audioContext.resume();
    },

 
    toggleLiveInput() {
        var self = this;
        self.getUserMedia(
            {
                "audio": {
                    "mandatory": {
                        "googEchoCancellation": "false",
                        "googAutoGainControl": "false",
                        "googNoiseSuppression": "false",
                        "googHighpassFilter": "false"
                    },
                    "optional": []
                },
            }, self.gotStream.bind(this));
    },
 
    noteFromPitch( frequency ) {
        var noteNum = 12 * (Math.log( frequency / 440 )/Math.log(2) );
        return Math.round( noteNum ) + 69;
    },
    updatePitch( time ) {
        //var cycles = new Array;
        var buf = new Float32Array( buflen );
        analyser.getFloatTimeDomainData( buf );
        //console.log(buf);
        //var ac = this.autoCorrelate( buf, audioContext.sampleRate );
        var ac = this.AMDFDetector( buf, audioContext.sampleRate );
        if(ac != -1 && ac != null){
          console.log(ac);
          var note =  this.noteFromPitch(ac);
          this.label.string = ""+ noteStrings[note%12];
        }
    
    },
 
 
    AMDFDetector(float32AudioBuffer,sampleRate) {
        "use strict";
        const maxPeriod = Math.ceil(sampleRate / minFrequency);
        const minPeriod = Math.floor(sampleRate / maxFrequency);
 
        const maxShift = float32AudioBuffer.length;
    
        let t = 0;
        let minval = Infinity;
        let maxval = -Infinity;
        var frames1, frames2, calcSub, i, j, u, aux1, aux2;
    
        var rms = 0;
        var SIZE = float32AudioBuffer.length;    
        for (var i=0;i<SIZE;i++) {
            var val = float32AudioBuffer[i];
            rms += val*val;
        }
        rms = Math.sqrt(rms/SIZE);
        if (rms<0.01) // not enough signal
            return null;
 
        // Find the average magnitude difference for each possible period offset.
        for (i = 0; i < maxShift; i++) {
          if (minPeriod <= i && i <= maxPeriod) {
            for (
              aux1 = 0, aux2 = i, t = 0, frames1 = [], frames2 = [];
              aux1 < maxShift - i;
              t++, aux2++, aux1++
            ) {
              frames1[t] = float32AudioBuffer[aux1];
              frames2[t] = float32AudioBuffer[aux2];
            }
    
            // Take the difference between these frames.
            const frameLength = frames1.length;
            calcSub = [];
            for (u = 0; u < frameLength; u++) {
              calcSub[u] = frames1[u] - frames2[u];
            }
    
            // Sum the differences.
            let summation = 0;
            for (u = 0; u < frameLength; u++) {
              summation += Math.abs(calcSub[u]);
            }
            amd[i] = summation;
          }
        }
    
        for (j = minPeriod; j < maxPeriod; j++) {
          if (amd[j] < minval) minval = amd[j];
          if (amd[j] > maxval) maxval = amd[j];
        }
    
        const cutoff = Math.round(sensitivity * (maxval - minval) + minval);
        for (j = minPeriod; j <= maxPeriod && amd[j] > cutoff; j++);
    
        const search_length = minPeriod / 2;
        minval = amd[j];
        let minpos = j;
        for (i = j - 1; i < j + search_length && i <= maxPeriod; i++) {
          if (amd[i] < minval) {
            minval = amd[i];
            minpos = i;
          }
        }
    
        if (Math.round(amd[minpos] * ratio) < maxval) {
          return sampleRate / minpos;
        } else {
          return null;
        }
      },

    /*  autoCorrelate( buf, sampleRate ) {
        var SIZE = buf.length;
        var MAX_SAMPLES = Math.floor(SIZE/2);
        var best_offset = -1;
        var best_correlation = 0;
        var rms = 0;
        var foundGoodCorrelation = false;
        var correlations = new Array(MAX_SAMPLES);
    
        for (var i=0;i<SIZE;i++) {
            var val = buf[i];
            rms += val*val;
        }
        rms = Math.sqrt(rms/SIZE);
        if (rms<0.01) // not enough signal
            return -1;
    
        var lastCorrelation=1;
        for (var offset = MIN_SAMPLES; offset < MAX_SAMPLES; offset++) {
            var correlation = 0;
    
            for (var i=0; i<MAX_SAMPLES; i++) {
                correlation += Math.abs((buf[i])-(buf[i+offset]));
            }
            correlation = 1 - (correlation/MAX_SAMPLES);
            correlations[offset] = correlation; // store it, for the tweaking we need to do below.
            if ((correlation>GOOD_ENOUGH_CORRELATION) && (correlation > lastCorrelation)) {
                foundGoodCorrelation = true;
                if (correlation > best_correlation) {
                    best_correlation = correlation;
                    best_offset = offset;
                }
            } else if (foundGoodCorrelation) {
                // short-circuit - we found a good correlation, then a bad one, so we'd just be seeing copies from here.
                // Now we need to tweak the offset - by interpolating between the values to the left and right of the
                // best offset, and shifting it a bit.  This is complex, and HACKY in this code (happy to take PRs!) -
                // we need to do a curve fit on correlations[] around best_offset in order to better determine precise
                // (anti-aliased) offset.
    
                // we know best_offset >=1, 
                // since foundGoodCorrelation cannot go to true until the second pass (offset=1), and 
                // we can't drop into this clause until the following pass (else if).
                var shift = (correlations[best_offset+1] - correlations[best_offset-1])/correlations[best_offset];  
                return sampleRate/(best_offset+(8*shift));
            }
            lastCorrelation = correlation;
        }
        if (best_correlation > 0.01) {
            // console.log("f = " + sampleRate/best_offset + "Hz (rms: " + rms + " confidence: " + best_correlation + ")")
            return sampleRate/best_offset;
        }
        return -1;
    //	var best_frequency = sampleRate/best_offset;
    },
    */
 
});
 
