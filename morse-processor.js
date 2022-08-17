class MorseProcessor extends AudioWorkletProcessor {

    process(inputs, outputs, parameters) {
        _log("inputs.length : " + inputs.length + ", outputs.length : " + outputs.length + ", sample : " + outputs[0][0].length);
        const buffer = new Uint8Array(this.analyser.frequencyBinCount);
        _log(this.analyser.frequencyBinCount);
        this.analyser.getByteFrequencyData(buffer);

        var dotDuration = 1.2 / this.speed; // from wikipedia
        var frameDuration = outputs[0][0].length / 44100.0;

        var targetFrequencyIndex = parseInt(44100 / buffer.length * this.frequency) - 1;
        _log("Frequency : " + this.frequency + ", target - 1 : " + buffer[targetFrequencyIndex - 1] + ", target : " +  buffer[targetFrequencyIndex] + ", target + 1 : " +  buffer[targetFrequencyIndex + 1]);
        _log("Speed : " + this.speed + ", dotDuration : " + dotDuration + ", frameDuration : " + frameDuraton);

        return true;
    }

    constructor() {
        super();
        _log("MorseProcessor constructor");
        this._analyser = null;
        this._frequency = 600;
        this._speed = 20;
    }

    get analyser() {
        return this._analyser;
    }

    set analyser(value) {
        _log("set analyser with " + (typeof value));
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
