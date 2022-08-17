var inited = false, ac, stream, input, gain, filter, analyser, processor, buffer;

const startProcessor = async (context, input, frequency, speed) => {
  await context.audioWorklet.addModule('morse-processor.js');
  const processor = new AudioWorkletNode(context, 'morse-processor');
  processor.frequency = frequency;
  processor.speed = speed;
  input.connect(processor);
};

function init() {
    ac = new AudioContext();

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

            startProcessor(ac, analyser, frequency.value, speed.value);
        }
    )
    inited = true;
}

var frequency = document.querySelector("#freq");
var speed = document.querySelector("#speed");
var start = document.querySelector("#start");
var stop = document.querySelector("#stop");

start.onclick = function() {
    if (!inited) init();
    
}
stop.onclick = function() {
    analyser.disconnect(processor);
}

