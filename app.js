document.getElementById('generate-btn').addEventListener('click', async () => {
    const prompt = document.getElementById('logo-prompt').value;
    const resultDiv = document.getElementById('logo-result');
    const generateBtn = document.getElementById('generate-btn'); 
    
    if (!prompt) {
        resultDiv.innerHTML = '<p style="color: red;">请输入 Logo 描述！</p>';
        return;
    }

    // 禁用按钮并显示加载信息
    generateBtn.disabled = true;
    resultDiv.innerHTML = '<p>正在努力生成中，请稍候...</p>';
    
    try {
        // 向 Vercel API 路由发起请求
        const response = await fetch('/api/generate', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: prompt })
        });

        const data = await response.json();

        // 检查是否成功返回了图片数据
        if (data.error) {
            resultDiv.innerHTML = `<p style="color: red;">生成失败: ${data.error}</p>`;
            return;
        }

        if (data.image_base64) { 
            // 接收 Base64 编码的图片数据并显示
            resultDiv.innerHTML = `<img src="data:image/jpeg;base64,${data.image_base64}" alt="Generated Logo" class="generated-img">`;
        } else {
            resultDiv.innerHTML = '<p style="color: red;">生成失败：未收到图片数据。</p>';
        }

    } catch (error) {
        console.error('Fetch error:', error);
        resultDiv.innerHTML = '<p style="color: red;">网络请求失败，请检查服务器连接。</p>';
    } finally {
        // 重新启用按钮
        generateBtn.disabled = false;
    }
});