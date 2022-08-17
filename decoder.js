var inited = false, ac, stream, input, gain, analyser;

const startProcessor = async (context, input, frequency, speed) => {
    await context.audioWorklet.addModule('morse-processor.js?t=2');
    const processor = new AudioWorkletNode(context, 'morse-processor');
    processor.frequency = frequency;
    processor.speed = speed;
    input.connect(processor);
};

var frequency = document.querySelector("#freq");
var speed = document.querySelector("#speed");
var start = document.querySelector("#start");
var stop = document.querySelector("#stop");

start.addEventListener("click", async () => {
    ac = new AudioContext();

    var constraints = { audio: true, video: false };
    navigator.mediaDevices.getUserMedia(constraints).then((stream) => 
        async () => {
            input = ac.createMediaStreamSource(stream);
            input.connect(ac.destination);

            gain = ac.createGain();
            input.connect(gain);

            analyser = ac.createAnalyser();
            analyser.minDecibels = -90;
            analyser.maxDecibels = -10;
            analyser.smoothingTymeConstant = 0;
            analyser.fftSize = 512;
            gain.connect(analyser);

            await startProcessor(ac, analyser, frequency.value, speed.value);
            ac.resume();
        }
    );    
}, false);

stop.onclick = function() {
    analyser.disconnect();
}

