class Pcm16Processor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.recording = false;

        this.port.onmessage = (event) => {
            if (event?.data?.type === 'recording') {
                this.recording = Boolean(event.data.value);
            }
        };
    }

    process(inputs) {
        if (!this.recording) {
            return true;
        }

        const input = inputs[0];
        if (!input || input.length === 0) {
            return true;
        }

        const channelData = input[0];
        const pcm16 = new Int16Array(channelData.length);

        for (let i = 0; i < channelData.length; i++) {
            const sample = Math.max(-1, Math.min(1, channelData[i]));
            pcm16[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
        }

        this.port.postMessage({ type: 'pcm16', buffer: pcm16.buffer }, [pcm16.buffer]);
        return true;
    }
}

registerProcessor('pcm16-processor', Pcm16Processor);

