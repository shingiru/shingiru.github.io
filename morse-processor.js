class MorseProcessor extends AudioWorkletProcessor {

    process(inputs, outputs, parameters) {
        /*output.forEach((channel) => {
            for (let i = 0; i < channel.length; i++) {
                channel[i] = Math.random() * 2 - 1;
            }
        })*/
        this.analyser.getByteFrequencyData(buffer);

        var dotDuration = 1.2 / this.speed; // from wikipedia
        var frameDuration = outputs[0][0].length / 44100.0;

        var targetFrequencyIndex = parseInt(44100 / buffer.length * this.frequency) - 1;
        console.log("Frequency : " + this.frequency + ", target - 1 : " + buffer[targetFrequencyIndex - 1] + ", target : " +  buffer[targetFrequencyIndex] + ", target + 1 : " +  buffer[targetFrequencyIndex + 1]);
        console.log("Speed : " + this.speed + ", dotDuration : " + dotDuration + ", frameDuration : " + frameDuraton);

        return true;
    }

    static get parameterDescriptors() {
        return [{name: "Morse Code Decoder"}];
    }

    constructor() {
        super();
        this._analyser = null;
        this._frequency = 600;
        this._speed = 20;
    }

    get analyser() {
        return this._analyser;
    }

    set analyser(value) {
        if (value instanceOf AnalyserNode) {
            this._analyser = value;
        }
    }

    get frequency() {
        return this._frequency;
    }

    set frequency(value) {
        this._frequency = parseInt(value);
    }

    get speed() {
        return this._speed;
    }

    set speed(value) {
        this._speed = parseInt(value);
    }
}
registerProcessor('morse-processor', MorseProcessor);
