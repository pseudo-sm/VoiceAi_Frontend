import React, { useState, useEffect, useRef } from 'react';
import { initiateOutboundCall } from '../../services/voiceService';
import './Test.css';

const Test = () => {
    // --- Main Assistant State ---
    const [status, setStatus] = useState('disconnected');
    const [statusMessage, setStatusMessage] = useState('Disconnected');
    const [isRecording, setIsRecording] = useState(false);
    const [bargeInVisible, setBargeInVisible] = useState(false);

    // --- Outbound Call State ---
    const [callForm, setCallForm] = useState({
        phoneNumber: '7008765628',
        customerName: 'Piyush',
        callPurpose: 'service_confirmation',
        vehicleName: 'Tata Nexon',
        vehicleNumber: ''
    });
    const [callStatus, setCallStatus] = useState(null);
    const [isCalling, setIsCalling] = useState(false);

    // --- Local Test State ---
    const [localTestStatus, setLocalTestStatus] = useState('idle');
    const [localTestMessage, setLocalTestMessage] = useState('Enter customer details and click "Start Test Call" to begin');
    const [isLocalRecording, setIsLocalRecording] = useState(false);
    const [localForm, setLocalForm] = useState({
        customerName: '',
        vehicleName: '',
        callPurpose: 'test_drive',
        additionalContext: ''
    });

    // --- Refs for Main Assistant ---
    const wsRef = useRef(null);
    const audioContextRef = useRef(null);
    const mediaStreamRef = useRef(null);
    const audioQueueRef = useRef([]);
    const isPlayingRef = useRef(false);
    const currentAudioSourceRef = useRef(null);
    const analyserRef = useRef(null);
    const canvasRef = useRef(null);
    const animationFrameRef = useRef(null);

    // --- Refs for Local Test ---
    const localWsRef = useRef(null);
    const localAudioContextRef = useRef(null);
    const localMediaStreamRef = useRef(null);
    const localAudioQueueRef = useRef([]);
    const localIsPlayingRef = useRef(false);
    const localCurrentAudioSourceRef = useRef(null);
    const localAnalyserRef = useRef(null);
    const localCanvasRef = useRef(null);
    const localAnimationFrameRef = useRef(null);

    const SAMPLE_RATE = 24000;
    const WS_URL = 'ws://localhost:8000/microphone';
    const OUTBOUND_WS_URL = 'ws://localhost:8000/microphone-outbound';

    // --- Utility Functions ---
    const arrayBufferToBase64 = (buffer) => {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    };

    const base64ToArrayBuffer = (base64) => {
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    };

    // --- Main Assistant Logic ---
    const updateStatus = (msg, type) => {
        setStatusMessage(msg);
        setStatus(type);
    };

    const drawVisualizer = () => {
        if (!analyserRef.current || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            animationFrameRef.current = requestAnimationFrame(draw);
            analyserRef.current.getByteFrequencyData(dataArray);

            ctx.fillStyle = '#f1f5f9';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const barWidth = (canvas.width / dataArray.length) * 2.5;
            let x = 0;

            for (let i = 0; i < dataArray.length; i++) {
                const barHeight = (dataArray[i] / 255) * canvas.height;

                const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
                gradient.addColorStop(0, '#667eea');
                gradient.addColorStop(1, '#764ba2');

                ctx.fillStyle = gradient;
                ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

                x += barWidth + 1;
            }
        };
        draw();
    };

    const setupAudioCapture = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleRate: SAMPLE_RATE
                }
            });
            mediaStreamRef.current = stream;

            const audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: SAMPLE_RATE });
            audioContextRef.current = audioContext;

            analyserRef.current = audioContext.createAnalyser();
            analyserRef.current.fftSize = 256;

            const source = audioContext.createMediaStreamSource(stream);
            source.connect(analyserRef.current);

            // Start Visualizer
            if (canvasRef.current) {
                canvasRef.current.width = canvasRef.current.offsetWidth;
                canvasRef.current.height = canvasRef.current.offsetHeight;
                drawVisualizer();
            }

            const processor = audioContext.createScriptProcessor(4096, 1, 1);
            processor.onaudioprocess = (e) => {
                if (!isRecording) return;

                const inputData = e.inputBuffer.getChannelData(0);
                const pcm16 = new Int16Array(inputData.length);
                for (let i = 0; i < inputData.length; i++) {
                    const s = Math.max(-1, Math.min(1, inputData[i]));
                    pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                }

                if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                    wsRef.current.send(JSON.stringify({
                        event: 'audio',
                        audio: arrayBufferToBase64(pcm16.buffer)
                    }));
                }
            };

            source.connect(processor);
            processor.connect(audioContext.destination);
            return true;
        } catch (error) {
            console.error('Audio setup error:', error);
            updateStatus('Microphone access denied', 'disconnected');
            return false;
        }
    };

    const playAudio = async (audioData) => {
        if (!audioContextRef.current) return;
        audioQueueRef.current.push(audioData);
        if (!isPlayingRef.current) processAudioQueue();
    };

    const processAudioQueue = async () => {
        if (audioQueueRef.current.length === 0) {
            isPlayingRef.current = false;
            currentAudioSourceRef.current = null;
            return;
        }

        isPlayingRef.current = true;
        const audioData = audioQueueRef.current.shift();

        try {
            const audioBytes = base64ToArrayBuffer(audioData);
            const int16Array = new Int16Array(audioBytes);
            const float32Array = new Float32Array(int16Array.length);
            for (let i = 0; i < int16Array.length; i++) {
                float32Array[i] = int16Array[i] / (int16Array[i] < 0 ? 0x8000 : 0x7FFF);
            }

            const audioBuffer = audioContextRef.current.createBuffer(1, float32Array.length, SAMPLE_RATE);
            audioBuffer.getChannelData(0).set(float32Array);

            const source = audioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            currentAudioSourceRef.current = source;

            if (analyserRef.current) source.connect(analyserRef.current);
            source.connect(audioContextRef.current.destination);

            source.onended = () => {
                currentAudioSourceRef.current = null;
                processAudioQueue();
            };

            source.start();
        } catch (error) {
            console.error('Audio playback error:', error);
            currentAudioSourceRef.current = null;
            processAudioQueue();
        }
    };

    const clearAllAudio = () => {
        if (currentAudioSourceRef.current) {
            try {
                currentAudioSourceRef.current.stop();
                currentAudioSourceRef.current.disconnect();
            } catch (e) { }
            currentAudioSourceRef.current = null;
        }
        audioQueueRef.current = [];
        isPlayingRef.current = false;

        setBargeInVisible(true);
        updateStatus('Listening...', 'speaking');
        setTimeout(() => {
            setBargeInVisible(false);
            if (isRecording) updateStatus('Session started - Speak now', 'speaking');
        }, 2000);
    };

    const startSession = async () => {
        updateStatus('Connecting...', 'disconnected');
        wsRef.current = new WebSocket(WS_URL);

        wsRef.current.onopen = () => {
            // Wait for ready
        };

        wsRef.current.onmessage = async (event) => {
            const data = JSON.parse(event.data);
            switch (data.event) {
                case 'ready':
                    updateStatus('Ready - Click Start to begin', 'connected');
                    const audioReady = await setupAudioCapture();
                    if (audioReady) {
                        wsRef.current.send(JSON.stringify({ event: 'start' }));
                    } else {
                        wsRef.current.close();
                    }
                    break;
                case 'started':
                    updateStatus('Session started - Speak now', 'speaking');
                    setIsRecording(true);
                    break;
                case 'audio':
                    await playAudio(data.audio);
                    break;
                case 'clear_audio':
                    clearAllAudio();
                    break;
                case 'stopped':
                    updateStatus('Session stopped', 'disconnected');
                    setIsRecording(false);
                    cleanup();
                    break;
                case 'error':
                    updateStatus(`Error: ${data.message}`, 'disconnected');
                    break;
                default:
                    break;
            }
        };

        wsRef.current.onerror = () => updateStatus('Connection error', 'disconnected');
        wsRef.current.onclose = () => {
            updateStatus('Disconnected', 'disconnected');
            setIsRecording(false);
            cleanup();
        };
    };

    const stopSession = () => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ event: 'stop' }));
        }
    };

    const cleanup = () => {
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        audioQueueRef.current = [];
        isPlayingRef.current = false;
    };

    // --- Outbound Call Logic ---
    const handleCall = async () => {
        if (!callForm.phoneNumber || callForm.phoneNumber.length !== 10) {
            setCallStatus({ message: 'Please enter a valid 10-digit phone number', type: 'error' });
            return;
        }

        setIsCalling(true);
        setCallStatus({ message: 'Initiating call...', type: 'loading' });

        const payload = {
            customer_phone: callForm.phoneNumber,
            customer_name: callForm.customerName,
            call_purpose: callForm.callPurpose,
            vehicle_name: callForm.vehicleName,
            vehicle_number: callForm.vehicleNumber
        };

        const result = await initiateOutboundCall(payload);

        if (result.success) {
            setCallStatus({ message: `Call initiated! SID: ${result.data.call_sid || 'N/A'}`, type: 'success' });
            setCallForm({ ...callForm, phoneNumber: '', customerName: '', vehicleName: '', vehicleNumber: '' });
            setTimeout(() => setCallStatus(null), 5000);
        } else {
            setCallStatus({ message: `Failed: ${result.error || 'Unknown error'}`, type: 'error' });
        }
        setIsCalling(false);
    };

    // --- Local Test Logic ---
    const updateLocalStatus = (msg, type) => {
        setLocalTestMessage(msg);
        setLocalTestStatus(type);
    };

    const drawLocalVisualizer = () => {
        if (!localAnalyserRef.current || !localCanvasRef.current) return;

        const canvas = localCanvasRef.current;
        const ctx = canvas.getContext('2d');
        const bufferLength = localAnalyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            localAnimationFrameRef.current = requestAnimationFrame(draw);
            localAnalyserRef.current.getByteFrequencyData(dataArray);

            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const barWidth = (canvas.width / dataArray.length) * 2.5;
            let x = 0;

            for (let i = 0; i < dataArray.length; i++) {
                const barHeight = (dataArray[i] / 255) * canvas.height;
                const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
                gradient.addColorStop(0, '#e94560');
                gradient.addColorStop(1, '#ff6b6b');
                ctx.fillStyle = gradient;
                ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
                x += barWidth + 1;
            }
        };
        draw();
    };

    const setupLocalAudioCapture = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, sampleRate: SAMPLE_RATE }
            });
            localMediaStreamRef.current = stream;

            const audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: SAMPLE_RATE });
            localAudioContextRef.current = audioContext;

            localAnalyserRef.current = audioContext.createAnalyser();
            localAnalyserRef.current.fftSize = 256;

            const source = audioContext.createMediaStreamSource(stream);
            source.connect(localAnalyserRef.current);

            if (localCanvasRef.current) {
                localCanvasRef.current.width = localCanvasRef.current.offsetWidth;
                localCanvasRef.current.height = localCanvasRef.current.offsetHeight;
                drawLocalVisualizer();
            }

            const processor = audioContext.createScriptProcessor(4096, 1, 1);
            processor.onaudioprocess = (e) => {
                if (!isLocalRecording) return;
                const inputData = e.inputBuffer.getChannelData(0);
                const pcm16 = new Int16Array(inputData.length);
                for (let i = 0; i < inputData.length; i++) {
                    const s = Math.max(-1, Math.min(1, inputData[i]));
                    pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                }
                if (localWsRef.current && localWsRef.current.readyState === WebSocket.OPEN) {
                    localWsRef.current.send(JSON.stringify({ event: 'audio', audio: arrayBufferToBase64(pcm16.buffer) }));
                }
            };

            source.connect(processor);
            processor.connect(audioContext.destination);
            return true;
        } catch (error) {
            updateLocalStatus('Microphone access denied', 'error');
            return false;
        }
    };

    const playLocalAudio = async (audioData) => {
        if (!localAudioContextRef.current) return;
        localAudioQueueRef.current.push(audioData);
        if (!localIsPlayingRef.current) processLocalAudioQueue();
    };

    const processLocalAudioQueue = async () => {
        if (localAudioQueueRef.current.length === 0) {
            localIsPlayingRef.current = false;
            localCurrentAudioSourceRef.current = null;
            return;
        }
        localIsPlayingRef.current = true;
        const audioData = localAudioQueueRef.current.shift();
        try {
            const audioBytes = base64ToArrayBuffer(audioData);
            const int16Array = new Int16Array(audioBytes);
            const float32Array = new Float32Array(int16Array.length);
            for (let i = 0; i < int16Array.length; i++) {
                float32Array[i] = int16Array[i] / (int16Array[i] < 0 ? 0x8000 : 0x7FFF);
            }
            const audioBuffer = localAudioContextRef.current.createBuffer(1, float32Array.length, SAMPLE_RATE);
            audioBuffer.getChannelData(0).set(float32Array);
            const source = localAudioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            localCurrentAudioSourceRef.current = source;
            if (localAnalyserRef.current) source.connect(localAnalyserRef.current);
            source.connect(localAudioContextRef.current.destination);
            source.onended = () => {
                localCurrentAudioSourceRef.current = null;
                processLocalAudioQueue();
            };
            source.start();
        } catch (error) {
            localCurrentAudioSourceRef.current = null;
            processLocalAudioQueue();
        }
    };

    const clearLocalAudio = () => {
        if (localCurrentAudioSourceRef.current) {
            try {
                localCurrentAudioSourceRef.current.stop();
                localCurrentAudioSourceRef.current.disconnect();
            } catch (e) { }
            localCurrentAudioSourceRef.current = null;
        }
        localAudioQueueRef.current = [];
        localIsPlayingRef.current = false;
        setBargeInVisible(true);
        setTimeout(() => setBargeInVisible(false), 2000);
    };

    const startLocalTest = async () => {
        if (!localForm.customerName) {
            updateLocalStatus('Please enter a customer name', 'error');
            return;
        }
        updateLocalStatus('Connecting...', 'connecting');
        localWsRef.current = new WebSocket(OUTBOUND_WS_URL);

        localWsRef.current.onopen = () => { };

        localWsRef.current.onmessage = async (event) => {
            const data = JSON.parse(event.data);
            switch (data.event) {
                case 'ready':
                    updateLocalStatus('Connected - Starting session...', 'connecting');
                    const audioReady = await setupLocalAudioCapture();
                    if (audioReady) {
                        localWsRef.current.send(JSON.stringify({
                            event: 'start',
                            context: {
                                customer_name: localForm.customerName,
                                vehicle_name: localForm.vehicleName,
                                call_purpose: localForm.callPurpose,
                                additional_context: localForm.additionalContext
                            }
                        }));
                    } else {
                        localWsRef.current.close();
                    }
                    break;
                case 'started':
                    updateLocalStatus('📞 Call in progress - AI will greet the customer', 'connected');
                    setIsLocalRecording(true);
                    break;
                case 'audio':
                    await playLocalAudio(data.audio);
                    break;
                case 'clear_audio':
                    clearLocalAudio();
                    break;
                case 'call_ending':
                    const reasonLabels = {
                        'customer_busy': '📵 Customer Busy',
                        'customer_frustrated': '😤 Customer Frustrated',
                        'customer_declined': '❌ Customer Declined',
                        'booking_complete': '✅ Booking Complete',
                        'conversation_ended': '👋 Conversation Ended',
                        'customer_request': '🛑 Customer Request'
                    };
                    updateLocalStatus(`Call ending: ${reasonLabels[data.reason] || data.reason}${data.summary ? ' - ' + data.summary : ''}`, 'idle');
                    break;
                case 'stopped':
                    updateLocalStatus('Call ended', 'idle');
                    setIsLocalRecording(false);
                    cleanupLocal();
                    break;
                case 'error':
                    updateLocalStatus(`Error: ${data.message}`, 'error');
                    break;
                default:
                    break;
            }
        };

        localWsRef.current.onerror = () => updateLocalStatus('Connection error - is the server running?', 'error');
        localWsRef.current.onclose = () => {
            if (isLocalRecording) updateLocalStatus('Disconnected', 'idle');
            setIsLocalRecording(false);
            cleanupLocal();
        };
    };

    const stopLocalTest = () => {
        if (localWsRef.current && localWsRef.current.readyState === WebSocket.OPEN) {
            localWsRef.current.send(JSON.stringify({ event: 'stop' }));
        }
    };

    const cleanupLocal = () => {
        if (localMediaStreamRef.current) {
            localMediaStreamRef.current.getTracks().forEach(track => track.stop());
            localMediaStreamRef.current = null;
        }
        if (localAudioContextRef.current) {
            localAudioContextRef.current.close();
            localAudioContextRef.current = null;
        }
        if (localAnimationFrameRef.current) {
            cancelAnimationFrame(localAnimationFrameRef.current);
        }
        localAudioQueueRef.current = [];
        localIsPlayingRef.current = false;
    };

    useEffect(() => {
        return () => {
            if (isRecording) stopSession();
            if (isLocalRecording) stopLocalTest();
            cleanup();
            cleanupLocal();
        };
    }, []);

    return (
        <div className="test-page-container">


            {bargeInVisible && <div className="barge-in-indicator">Listening...</div>}

            <div className="brand">
                <div className="brand-name">Telivi</div>
                <div className="brand-tagline">Your Intelligent Voice Assistant</div>
            </div>
            <p className="subtitle">Speak naturally - Telivi will understand and respond</p>
            <div className="test-page-divider">
                {/* Left Column: Main Assistant & Outbound Call */}


                <div className="test-left-column">
                    <div className="test-card">


                        <div className={`status-indicator status-${status}`}>
                            {statusMessage}
                        </div>

                        <div className="visualizer-container">
                            <canvas ref={canvasRef} className="visualizer-canvas"></canvas>
                        </div>

                        <div className="controls-group">
                            <button
                                className="btn-control btn-start"
                                onClick={startSession}
                                disabled={isRecording}
                            >
                                Start Session
                            </button>
                            <button
                                className="btn-control btn-stop"
                                onClick={stopSession}
                                disabled={!isRecording}
                            >
                                Stop Session
                            </button>
                        </div>

                        <div className="info-box">
                            <strong>How to use:</strong> Click "Start Session" and allow microphone access. Speak naturally - Telivi will detect when you're speaking and respond automatically. You can interrupt Telivi at any time by speaking.
                        </div>


                    </div>
                </div>

                {/* <div className="divider-vertical">OR</div> */}

                {/* Right Column: Local Outbound Test */}
                <div className="test-right-column">

                    <div className="outbound-section">
                        <h3 className="section-title"><span>📞</span> Make Outbound Call</h3>

                        <div className="input-row">
                            <input
                                type="tel"
                                className="text-input"
                                placeholder="Enter 10-digit phone number"
                                value={callForm.phoneNumber}
                                onChange={(e) => setCallForm({ ...callForm, phoneNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                            />
                            <button className="btn-call" onClick={handleCall} disabled={isCalling}>
                                <span>📞</span> Call
                            </button>
                        </div>

                        <div className="options-grid">
                            <input
                                type="text"
                                className="text-input"
                                placeholder="Customer Name"
                                value={callForm.customerName}
                                onChange={(e) => setCallForm({ ...callForm, customerName: e.target.value })}
                            />
                            <select
                                className="select-input"
                                value={callForm.callPurpose}
                                onChange={(e) => setCallForm({ ...callForm, callPurpose: e.target.value })}
                            >
                                <option value="service_confirmation">Service Confirmation</option>
                                <option value="service_complete">Service Complete</option>
                                <option value="service_reminder">Service Reminder</option>
                                <option value="special_offer">Special Offer</option>
                                <option value="feedback">Feedback Collection</option>
                            </select>
                            <input
                                type="text"
                                className="text-input"
                                placeholder="Vehicle Name"
                                value={callForm.vehicleName}
                                onChange={(e) => setCallForm({ ...callForm, vehicleName: e.target.value })}
                            />
                            <input
                                type="text"
                                className="text-input"
                                placeholder="Vehicle Number (Optional)"
                                value={callForm.vehicleNumber}
                                onChange={(e) => setCallForm({ ...callForm, vehicleNumber: e.target.value })}
                            />
                        </div>

                        {callStatus && (
                            <div className={`call-status-msg msg-${callStatus.type}`}>
                                {callStatus.message}
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* <div className="divider">OR</div> */}
            <div className="local-test-card">
                <h3 className="local-test-title"><span>🧪</span> Local Outbound Test</h3>
                <p className="local-test-subtitle">
                    Test outbound call prompts locally without making real calls. The AI will speak first, simulating an outbound call experience.
                </p>

                <div className="input-row" style={{ flexDirection: 'column' }}>
                    <input
                        type="text"
                        className="text-input dark-input"
                        placeholder="Customer Name *"
                        value={localForm.customerName}
                        onChange={(e) => setLocalForm({ ...localForm, customerName: e.target.value })}
                    />
                    <input
                        type="text"
                        className="text-input dark-input"
                        placeholder="Vehicle of Interest"
                        value={localForm.vehicleName}
                        onChange={(e) => setLocalForm({ ...localForm, vehicleName: e.target.value })}
                    />
                    <select
                        className="select-input dark-input"
                        value={localForm.callPurpose}
                        onChange={(e) => setLocalForm({ ...localForm, callPurpose: e.target.value })}
                    >
                        <option value="test_drive">Test Drive Follow-up</option>
                        <option value="service_confirmation">Service Confirmation</option>
                        <option value="service_complete">Service Complete</option>
                        <option value="service_reminder">Service Reminder</option>
                        <option value="special_offer">Special Offer</option>
                        <option value="feedback">Feedback Collection</option>
                    </select>
                    <input
                        type="text"
                        className="text-input dark-input"
                        placeholder="Additional Context (Optional)"
                        value={localForm.additionalContext}
                        onChange={(e) => setLocalForm({ ...localForm, additionalContext: e.target.value })}
                    />
                </div>

                <div className="local-visualizer">
                    <canvas ref={localCanvasRef} className="visualizer-canvas"></canvas>
                </div>

                <div className="controls-group">
                    <button
                        className="btn-control btn-test-start"
                        onClick={startLocalTest}
                        disabled={isLocalRecording}
                    >
                        Start Test Call
                    </button>
                    <button
                        className="btn-control btn-test-stop"
                        onClick={stopLocalTest}
                        disabled={!isLocalRecording}
                    >
                        End Call
                    </button>
                </div>

                <div className={`local-status ${localTestStatus}`}>
                    {localTestMessage}
                </div>
            </div>

        </div>
    );
};

export default Test;
