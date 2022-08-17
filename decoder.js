var inited = false, ac, stream, input, gain, analyser;

var frequency = document.querySelector("#freq");
var speed = document.querySelector("#speed");
var start = document.querySelector("#start");
var stop = document.querySelector("#stop");

start.addEventListener("click", async () => {
    ac = new AudioContext();

    var constraints = { audio: true, video: false };
    navigator.mediaDevices.getUserMedia(constraints).then(async (stream) => 
        /*async () =>*/ {
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

            _log("a");
        console.log("aaaa");
            await ac.audioWorklet.addModule('morse-processor.js');
            _log("b");
            const processor = new AudioWorkletNode(ac, 'morse-processor');
            _log("c");
            processor.analyser = analyser;
            _log("d");
            processor.frequency = parseInt(frequency.value);
            processor.speed = parseInt(speed);
            input.connect(processor);
            _log("e");

            ac.resume();
            _log("f");
        }
    );    
}, false);

stop.onclick = function() {
    analyser.disconnect();
}
