class MorseProcessor extends AudioWorkletProcessor {

    process(inputs, outputs, parameters) {
        console.log("inputs.length : " + inputs.length + ", outputs.length : " + outputs.length + ", sample : " + outputs[0][0].length);
        const buffer = new Uint8Array(this._analyser.frequencyBinCount);
        console.log(this._analyser.frequencyBinCount);
        this._analyser.getByteFrequencyData(buffer);

        var dotDuration = 1.2 / this._speed; // from wikipedia
        var frameDuration = outputs[0][0].length / 44100.0;

        var targetFrequencyIndex = parseInt(44100 / buffer.length * this._frequency) - 1;
        console.log("Frequency : " + this._frequency + ", target - 1 : " + buffer[targetFrequencyIndex - 1] + ", target : " +  buffer[targetFrequencyIndex] + ", target + 1 : " +  buffer[targetFrequencyIndex + 1]);
        console.log("Speed : " + this._speed + ", dotDuration : " + dotDuration + ", frameDuration : " + frameDuraton);

        return true;
    }

    constructor() {
        super();
        console.log("MorseProcessor constructor");
        this._analyser = null;
        this._frequency = 600;
        this._speed = 20;
    }

    get analyser() {
        return this._analyser;
    }

    set analyser(value) {
        console.log("set analyser with " + (typeof value));
        this._analyser = value;
    }

    get frequency() {
        return this._frequency;
    }

    set frequency(value) {
        this._frequency = value;
    }

    get speed() {
        return this._speed;
    }

    set speed(value) {
        this._speed = value;
    }
}
registerProcessor('morse-processor', MorseProcessor);
