export const initiateOutboundCall = async (payload) => {
    try {
        const response = await fetch('https://948252be6504.ngrok-free.app/outbound-call', {
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
