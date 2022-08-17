var inited = false, ac, stream, input, gain, analyser, lastDitdah = false, ditdahAmount = 0;

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
        //analyser.minDecibels = -90;
        //analyser.maxDecibels = -10;
        analyser.smoothingTymeConstant = 0;
        analyser.fftSize = 512;
        gain.connect(analyser);

        await ac.audioWorklet.addModule('morse-processor.js');
        const processor = new AudioWorkletNode(ac, 'morse-processor');
        processor.port.onmessage = (event) => {
            if (event.data.message === 'NEW_SAMPLE_LENGTH') {
                const buffer = new Uint8Array(analyser.frequencyBinCount);
                analyser.getByteFrequencyData(buffer);

                var ditDuration = 1.2 / parseInt(speed.value); // from wikipedia
                var minDitDuration = ditDuration * 0.5;
                var maxDitDuration = ditDuration * 2.0;
                var frameDuration = event.data.sampleLength / 44100.0;

                var peak = parseInt(parseInt(frequency.value) / (44100 / 2 / analyser.frequencyBinCount)) + 1;
                var DITDAH_THRESHOLD = 256 * 0.75;
                var ditdah = (buffer[peak-1] > DITDAH_THRESHOLD && buffer[peak] > DITDAH_THRESHOLD && buffer[peak+1] > DITDAH_THRESHOLD);

                if (ditdah) {
                    ditdahAmount += frameDuration;
                } else {
                    if (lastDitdah == true) {
                        if (ditdahAmount < minDitDuration) { // noise
                            console.log("NOISE, " + ditdahAmount);
                        } else if (ditdahAmount < maxDitDuration) { // dit
                            console.log("DIT, " + ditdahAmount);
                        } else { // dah
                            console.log("DAH, " + ditdahAmount);
                        }
                    }
                    ditdahAmount = 0;
                }
                lastDitdah = ditdah;
            }
        };
        input.connect(processor);

        ac.resume();
    });
}, false);

stop.onclick = function() {
    gain.disconnect(analyser);
}
