class MorseProcessor extends AudioWorkletProcessor {
    process(inputs, outputs, parameters) {
        this.port.postMessage({
            message: "NEW_SAMPLE_LENGTH",
            sampleLength: outputs[0][0].length
        });
        return true;
    }
}
registerProcessor('morse-processor', MorseProcessor);
