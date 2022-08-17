class MorseProcessor extends AudioWorkletProcessor {

    process(inputs, outputs, parameters) {
        /*output.forEach((channel) => {
            for (let i = 0; i < channel.length; i++) {
                channel[i] = Math.random() * 2 - 1;
            }
        })*/
        analyser.getByteFrequencyData(buffer);

        var targetFrequency = frequency.value;
        var targetSpeed = speed.value;
        var dotDuration = 1.2 / speed.value; // from wikipedia
        var frameDuration = outputs[0][0].length / 44100.0;

        var targetFrequencyIndex = parseInt(44100 / buffer.length * frequency.value) - 1;
        console.log("Frequency : " + frequency.value + ", target - 1 : " + buffer[targetFrequencyIndex - 1] + ", target : " +  buffer[targetFrequencyIndex] + ", target + 1 : " +  buffer[targetFrequencyIndex + 1]);
        console.log("Speed : " + speed.value + ", dotDuration : " + dotDuration + ", frameDuration : " + frameDuraton);



        return true;
    }
}
registerProcessor('morse-processor', MorseProcessor);
