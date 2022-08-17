class MorseProcessor extends AudioWorkletProcessor {

    process(inputs, outputs, parameters) {
        console.log("inputs.length : " + inputs.length + ", outputs.length : " + outputs.length + ", sample : " + outputs[0][0].length);
        const buffer = new Uint8Array(this.analyser.frequencyBinCount);
        console.log(this.analyser.frequencyBinCount);
        this.analyser.getByteFrequencyData(buffer);

        var dotDuration = 1.2 / this.speed; // from wikipedia
        var frameDuration = outputs[0][0].length / 44100.0;

        var targetFrequencyIndex = parseInt(44100 / buffer.length * this.frequency) - 1;
        console.log("Frequency : " + this.frequency + ", target - 1 : " + buffer[targetFrequencyIndex - 1] + ", target : " +  buffer[targetFrequencyIndex] + ", target + 1 : " +  buffer[targetFrequencyIndex + 1]);
        console.log("Speed : " + this.speed + ", dotDuration : " + dotDuration + ", frameDuration : " + frameDuraton);

        return true;
    }

    constructor() {
        super();
        console.log("MorseProcessor constructor");
        this.analyser = null;
        this.frequency = 600;
        this.speed = 20;
    }

    get analyser() {
        return this.analyser;
    }

    set analyser(value) {
        console.log("set analyser with " + (typeof value));
        this.analyser = value;
    }

    get frequency() {
        return this.frequency;
    }

    set frequency(value) {
        this.frequency = value;
    }

    get speed() {
        return this.speed;
    }

    set speed(value) {
        this.speed = value;
    }
}
registerProcessor('morse-processor', MorseProcessor);
