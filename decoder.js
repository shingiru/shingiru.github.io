var ac, analyser, processor, lastDitdah = false, ditdahAmount = 0, gapAmount = 0;

var frequency = document.querySelector("#freq");
var speed = document.querySelector("#speed");
var hangul = document.querySelector("#hangul");
var start = document.querySelector("#start");
var stop = document.querySelector("#stop");

start.addEventListener("click", async () => {
    ac = new AudioContext();

    var constraints = { audio: true, video: false };
    navigator.mediaDevices.getUserMedia(constraints).then(async (stream) => {
        var input = ac.createMediaStreamSource(stream);
        //input.connect(ac.destination);

        var gain = ac.createGain();
        input.connect(gain);

        analyser = ac.createAnalyser();
        //analyser.minDecibels = -90;
        //analyser.maxDecibels = -10;
        analyser.smoothingTymeConstant = 0;
        analyser.fftSize = 512;
        gain.connect(analyser);

        await ac.audioWorklet.addModule('morse-processor.js');
        processor = new AudioWorkletNode(ac, 'morse-processor');
        
        const buffer = new Uint8Array(analyser.frequencyBinCount);
        processor.port.onmessage = (event) => {
            if (event.data.message === 'NEW_SAMPLE_LENGTH') {
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
                        } else {
                            console.log("WORD GAP, " + gapAmount);
                            makeCharacter();
                            //_log("   ");
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
                            if (hangul.checked == false) _log("·");
                            addToLetter(true);
                        } else { // dah
                            console.log("DAH, " + ditdahAmount);
                            if (hangul.checked == false) _log("―");
                            addToLetter(false);
                        }
                    }
                    ditdahAmount = 0;
                    gapAmount += frameDuration;

                    // when enough gapAmount
                    if (gapAmount > ditDuration * 7 * 2) { // 5 or 7
                        console.log("MAX GAP, " + gapAmount);
                        makeCharacter();
                        _log("   ");
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

var ditdahs = "";
var hangulLetters = [];
var previousLetter = "";
function addToLetter(ditdah) { // ditdat - dit:true, dah:false
    ditdahs += (ditdah ? "." : "-");
}
function makeCharacter() {
    if ("undefined" != typeof MORSE[ditdahs]) {
        var letter = MORSE[ditdahs];
        if ("undefined" != typeof PROSIGN[letter]) {
            if (hangul.checked && hangulLetters.length > 0) {
                _log2(Hangul.assemble(hangulLetters));
                hangulLetters = [];
            }
            _log(PROSIGN[letter]);
            previousLetter = "";
        } else {
            if (hangul.checked) {
                if (hangulLetters.length == 0) { // with current letter, 2 letters
                    _log(letter);
                    if ("undefined" != typeof HANGUL[ditdahs]) {
                        hangulLetters.push(HANGUL[ditdahs]);
                    }
                } else if (hangulLetters.length == 1) { // with current letter, 3 letters
                    if ("undefined" != typeof HANGUL[ditdahs]) {
                        hangulLetters.push(HANGUL[ditdahs]);
                        var characters = Hangul.assemble(hangulLetters);
                        if (characters.length != 1) {
                            hangulLetters.shift();
                            _log(letter);
                        } else {
                            if (Hangul.isComplete(characters)) {
                                _log2(characters);
                            } else {
                                _log2(characters);
                                // _log2(previousLetter + letter);
                            }
                        }
                    } else {
                        hangulLetters.shift();
                        _log(letter);
                    }
                } else { // with current letter, 3 letters or more
                    if ("undefined" != typeof HANGUL[ditdahs]) {
                        hangulLetters.push(HANGUL[ditdahs]);
                        var characters = Hangul.assemble(hangulLetters);
                        if (characters.length == 1) {
                            _log2(characters);
                        } else { // characters.length == 2
                            if (Hangul.isComplete(characters.charAt(0)) == false) {
                                _log2(previousLetter + previousLetter); // ㄲ, ㄸ, ㅃ, ㅆ, ㅉ, ㄸ
                                hangulLetters.shift();
                                hangulLetters.shift();
                                _log(letter);
                            } else {
                                _log2(characters.charAt(0));
                                var hangulCharacters = Hangul.disassemble(characters, true);
                                hangleLetters = hangulCharacters[1];
                                _log(characters.charAt(1));
                            }
                        }
                    } else {
                        var characters = Hangul.assemble(hangulLetters);
                        if (Hangul.isComplete(characters)) {
                            _log2(character);
                        } else {
                            _log2(previousLetter + previousLetter); // ㄲ, ㄸ, ㅃ, ㅆ, ㅉ, ㄸ
                        }
                        _log(letter);
                        hangulLetters = [];
                    }
                }
            } else {
                _log(letter);
            }
        }
        previousLetter = letter;
    }
    
    ditdahs = "";
}

stop.onclick = function() {
    analyser.disconnect(processor);
}

MORSE = {
    ".-": "A",
    "-...": "B",
    "-.-.": "C",
    "-..": "D",
    ".": "E",
    "..-.": "F",
    "--.": "G",
    "....": "H",
    "..": "I",
    ".---": "J",
    "-.-": "K",
    ".-..": "L",
    "--": "M",
    "-.": "N",
    "---": "O",
    ".--.": "P",
    "--.-": "Q",
    ".-.": "R",
    "...": "S",
    "-": "T",
    "..-": "U",
    "...-": "V",
    ".--": "W",
    "-..-": "X",
    "-.--": "Y",
    "--..": "Z",
     
    ".----": "1",
    "..---": "2",
    "...--": "3",
    "....-": "4",
    ".....": "5",
    "-....": "6",
    "--...": "7",
    "---..": "8",
    "----.": "9",
    "-----": "0",
     
    ".-.-.-": ".",
    "--..--": ",",
    "..--..": "?",
    "-..-.": "/",
    ".-.-.": "+",
    "-....-": "-",
    "-...-": "=",
    "---...": ":",
    "-.-.-.": ";",
    "-.--.": "(",
    "-.--.-": ")",
    ".----.": "'",
    ".-..-.": "\"",
    ".--.-.": "@",
     
    // for prosign
    ".-...": "&",
    "...-.": "Ŝ",
    // non-standard
    "-...-.-": "[",
    "...-.-": "]",
    "-.-.-": "^"
};

HANGUL = {
    ".-..": "ㄱ",
    "..-.": "ㄴ",
    "-...": "ㄷ",
    "...-": "ㄹ",
    "--": "ㅁ",
    ".--": "ㅂ",
    "--.": "ㅅ",
    "-.-": "ㅇ",
    ".--.": "ㅈ",
    "-.-.": "ㅊ",
    "-..-": "ㅋ",
    "--..": "ㅌ",
    "---": "ㅍ",
    ".---": "ㅎ",
    ".": "ㅏ",
    "..": "ㅑ",
    "-": "ㅓ",
    "...": "ㅕ",
    ".-": "ㅗ",
    "-.": "ㅛ",
    "....": "ㅜ",
    ".-.": "ㅠ",
    "-..": "ㅡ",
    "..-": "ㅣ",
    "-.--": "ㅔ",
    "--.-": "ㅐ"
};

PROSIGN = {
    "+": "<AR>",
    "(": "<KN>",
    "&": "<AS>",
    "=": "<BT>",
    "Ŝ": "<SN>",
    // non-standard
    "[": "<BK>",
    "]": "<SK>",
    "]": "<VA>",
    "^": "<KA>"
};
