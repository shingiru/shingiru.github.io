var inited = false, ac, stream, input, gain, analyser;

var frequency = document.querySelector("#freq");
var speed = document.querySelector("#speed");
var start = document.querySelector("#start");
var stop = document.querySelector("#stop");

start.addEventListener("click", async () => {
    ac = new AudioContext();

    var constraints = { audio: true, video: false };
    navigator.mediaDevices.getUserMedia(constraints).then(async (stream) => {
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

        await ac.audioWorklet.addModule('morse-processor.js');
        const processor = new AudioWorkletNode(ac, 'morse-processor');
        processor.port.onmessage = (event) => {
            if (event.data.message === 'NEW_SAMPLE_LENGTH') {
                //console.log("sample length : " + event.data.sampleLength);
                const buffer = new Uint8Array(analyser.frequencyBinCount);
                //console.log("frequencyBinCount : " + analyser.frequencyBinCount);
                analyser.getByteFrequencyData(buffer);

                var dotDuration = 1.2 / parseInt(speed.value); // from wikipedia
                var frameDuration = event.data.sampleLength / 44100.0;

                var targetFrequencyIndex = parseInt(parseInt(frequency.value) / (44100 / analyser.frequencyBinCount)) + 1;
                console.log("targetFrequencyIndex : " + targetFrequencyIndex + ", target : " + buffer[targetFrequencyIndex - 1] + ", target : " +  buffer[targetFrequencyIndex] + ", target + 1 : " +  buffer[targetFrequencyIndex + 1]);
                //console.log("Speed : " + parseInt(speed.value) + ", dotDuration : " + dotDuration + ", frameDuration : " + frameDuration);
            }
        };
        input.connect(processor);

        ac.resume();
    });
}, false);

stop.onclick = function() {
    gain.disconnect(analyser);
}
