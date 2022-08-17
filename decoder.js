var inited = false, ac, stream, input, gain, analyser, lastDitdah = false, ditdahAmount = 0, gapAmount = 0;

var frequency = document.querySelector("#freq");
var speed = document.querySelector("#speed");
var start = document.querySelector("#start");
var stop = document.querySelector("#stop");

start.addEventListener("click", async () => {
    ac = new AudioContext();

    var constraints = { audio: true, video: false };
    navigator.mediaDevices.getUserMedia(constraints).then(async (stream) => {
        input = ac.createMediaStreamSource(stream);
        //input.connect(ac.destination);

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
                var DITDAH_THRESHOLD = 256 * 0.8;
                var ditdah = (buffer[peak-1] > DITDAH_THRESHOLD && buffer[peak] > DITDAH_THRESHOLD && buffer[peak+1] > DITDAH_THRESHOLD);

                if (ditdah) { // TODO : need to determine gap after a few ditdah, not with single gap. Or, after enough gap arrived.
                    if (lastDitdah == false) {
                        if (gapAmount < minDitDuration) { // noise
                            console.log("GAP NOISE, " + gapAmount);
                        } else if (gapAmount < maxDitDuration) { // inter-letter
                            console.log("INTER-LETTER GAP, " + gapAmount);
                            gapAmount = 0;
                            //_log(" ");
                        } else {
                            console.log("WORD GAP, " + gapAmount);
                            _log(" ");
                            _log(" ");
                            _log(" ");
                            gapAmount = 0;
                        }
                    }
                    ditdahAmount += frameDuration;
                    
                } else {
                    if (lastDitdah == true) {
                        if (ditdahAmount < minDitDuration) { // noise
                            console.log("DITDAH NOISE, " + ditdahAmount);
                        } else if (ditdahAmount < maxDitDuration) { // dit
                            console.log("DIT, " + ditdahAmount);
                            _log("・");
                        } else { // dah
                            console.log("DAH, " + ditdahAmount);
                            _log("-");
                        }
                    }
                    ditdahAmount = 0;
                    gapAmount += frameDuration;

                    // when enough gapAmount
                    if (gapAmount > ditDuration * 7 * 2) { // 5 or 7
                        console.log("MAX GAP, " + gapAmount);
                        _log(" ");
                        _log(" ");
                        _log(" ");
                        gapAmount = 0;
                    }
                }
                lastDitdah = ditdah;
            }
        };
        analyser.connect(processor);
        processor.connect(ac.destination);

        ac.resume();
    });
}, false);

stop.onclick = function() {
    gain.disconnect(analyser);
}
