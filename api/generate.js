// api/generate.js (豆包/火山引擎图像生成版本 - 最终修正版)

import fetch from 'node-fetch'; 

// 密钥从 Vercel 的环境变量中获取
const DOUBAO_API_KEY = process.env.DOUBAO_API_KEY; 

// 修正：使用 curl 示例中正确的 API URL
const DOUBAO_IMAGE_URL = "https://ark.cn-beijing.volces.com/api/v3/images/generations"; 

// 修正：使用 curl 示例中提供的模型名称
const IMAGE_MODEL = "doubao-seedream-4-0-250828"; 

// 导出函数，供 Vercel 调用
export default async (req, res) => {
    // 允许跨域请求的设置
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Content-Type', 'application/json');

    // 处理 OPTIONS 预检请求
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    // 只允许 POST 方法
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // 检查环境变量
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
                // 请求参数根据您的 curl 示例和前端需求设置
                prompt: prompt,
                model: IMAGE_MODEL,
                size: "1024x1024", // 常用尺寸
                n: 1,
                // 前端 app.js 期望接收 Base64 数据，因此这里请求 b64_json
                response_format: "b64_json" 
            }),
        });
        
        const apiData = await apiResponse.json();

        // 2. 检查 API 错误 (无论状态码是否为 200/202)
        if (apiData.error || apiData.code) {
            return res.status(apiResponse.status).json({ 
                error: `豆包 API 错误: ${apiData.message || apiData.error}` 
            });
        }
        
        // 3. 解析 Base64 数据
        // 数据结构: apiData.data[0].b64_json
        if (!apiData.data || !apiData.data[0] || !apiData.data[0].b64_json) {
             return res.status(500).json({ 
                error: '豆包 API 返回结构异常，未找到 Base64 图片数据。' 
            });
        }
        
        const base64Image = apiData.data[0].b64_json;

        // 返回 Base64 数据给前端
        res.status(200).json({ image_base64: base64Image });

    } catch (error) {
        console.error('Server error:', error.message);
        res.status(500).json({ error: `服务器内部错误: ${error.message}` });
    }
};