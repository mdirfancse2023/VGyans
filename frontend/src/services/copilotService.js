import { fetchJson, BASE_API_URL } from './apiConfig';

export const copilotService = {
  async sendMessage(message, topic = 'placement') {
    const res = await fetch(`${BASE_API_URL}/api/copilot/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ message, topic })
    });

    if (!res.ok) {
      throw new Error(`Copilot chat error ${res.status}`);
    }

    return await res.json();
  }
};
