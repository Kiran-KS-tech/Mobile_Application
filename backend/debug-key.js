require('dotenv').config();
const axios = require('axios');

const testAI = async () => {
    const AI_ENDPOINT = "https://api.siliconflow.cn/v1"; 
    const API_KEY = process.env.ollama; 
    const MODEL_NAME = "deepseek-ai/DeepSeek-V2.5";

    console.log('Using Key:', API_KEY?.substring(0, 10) + '...');

    try {
        const response = await axios.get(`${AI_ENDPOINT}/models`, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('Success! Models found:', response.data.data.length);
    } catch (error) {
        console.error('Error Details:', error.response?.status, error.response?.data);
    }
};

testAI();
