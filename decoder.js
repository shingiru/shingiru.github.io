var inited = false, ac, stream, input, gain, filter, analyser, processor, buffer;

function init() {
    ac = new AudioContext();
    ac.audioWorklet.addModule('morse-processor.js');
    processor = new AudioWorkletNode(ac, 'morse-processor');

    var constraints = { audio: true, video: false};
    navigator.mediaDevices.getUserMedia(constraints).then(
        function(stream) {
            input = ac.createMediaStreamSource(stream);
            input.connect(ac.destination);

            gain = ac.createGain();
            input.connect(gain);

            filter = ac.createBiquadFilter();
            gain.connect(filter);

            analyser = ac.createAnalyser();
            analyser.minDecibels = -90;
            analyser.maxDecibels = -10;
            analyser.smoothingTymeConstant = 0;
            analyser.fftSize = 512;
            filter.connect(analyser);
            buffer = new Uint8Array(analyser.frequencyBinCount);

            //processor = createMorseProcessor();
            analyser.connect(processor);
        }
    )
    inited = true;
}

async function createMorseProcessor(ac) {
    try {
        await ac.resume();
        await ac.audioWorklet.addModule("morse-processor.js");
    } catch (e) {
        console.log("fail to create morse processor");
        return null;
    }

    return new AudioWorkletNode(ac, "morse-processor");
}

var frequency = document.querySelector("#frequency");
var speed = document.querySelector("#speed");
var start = document.querySelector("#start");
var stop = document.querySelector("#stop");

start.onclick = function() {
    if (!inited) init();
    
}
stop.onclick = function() {
    analyser.disconnect(processor);
}
