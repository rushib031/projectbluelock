import axios from 'axios';

const OpenAIBot = async (message, setState) => {
    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: message }],
                max_tokens: 150,
                temperature: 0.7,
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const botMessage = response.data.choices[0].message.content;
        setState((prev) => ({
            ...prev,
            messages: [...prev.messages, { type: 'bot', text: botMessage }],
        }));
    } catch (error) {
        console.error('Error fetching GPT-3 response:', error);
        setState((prev) => ({
            ...prev,
            messages: [...prev.messages, { type: 'bot', text: 'Oops, something went wrong!' }],
        }));
    }
};

export default OpenAIBot;
