const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
    || 'https://telvi-voice-ai-fnfafecbhqa9edfp.centralindia-01.azurewebsites.net';

export const initiateOutboundCall = async (payload) => {
    try {
        const response = await fetch(`${API_BASE_URL}/outbound-call`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        return { success: response.ok && data.success, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};
