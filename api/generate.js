// api/generate.js (豆包/火山引擎图像生成版本)

import fetch from 'node-fetch'; 

// 密钥从 Vercel 的环境变量中获取
const DOUBAO_API_KEY = process.env.DOUBAO_API_KEY; 

// 豆包图像生成 API 的通用接入点 (请注意：如果 API 有变动，可能需要更新此URL)
const DOUBAO_IMAGE_URL = "https://ark.cn-beijing.volces.com/api/v3/sdk/image/generate"; 

// 使用一个常用的 Stable Diffusion 模型
const IMAGE_MODEL = "stable-diffusion-xl"; 

// 导出函数，供 Vercel 调用
export default async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    if (!DOUBAO_API_KEY) {
        return res.status(500).json({ error: '服务器配置错误: 缺少 DOUBAO_API_KEY 环境变量。' });
    }

    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt 不能为空' });
        }
        
        // 1. 调用豆包/火山引擎 API
        const apiResponse = await fetch(DOUBAO_IMAGE_URL, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                // 关键：将您的 API Key 作为 Bearer Token 进行鉴权
                'Authorization': `Bearer ${DOUBAO_API_KEY}` 
            },
            body: JSON.stringify({
                // 火山引擎/豆包 API 的标准请求体
                prompt: prompt,
                model: IMAGE_MODEL,
                size: "1024x1024", 
                n: 1,
                response_format: "b64_json" // 要求返回 Base64 编码
            }),
        });
        
        const apiData = await apiResponse.json();

        // 2. 检查 API 错误
        if (apiData.error || apiData.code) {
            return res.status(apiResponse.status).json({ 
                error: `豆包 API 错误: ${apiData.message || apiData.error}` 
            });
        }
        
        // 3. 解析 Base64 数据
        const base64Image = apiData.data[0].b64_json;

        // 返回 Base64 数据给前端
        res.status(200).json({ image_base64: base64Image });

    } catch (error) {
        console.error('Server error:', error.message);
        res.status(500).json({ error: `服务器内部错误: ${error.message}` });
    }
};