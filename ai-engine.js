// ===== ULIKI AI ENGINE - پیش‌رفته =====
// پشتیبانی از سه مدل: Claude (Groq), Groq, Google AI Studio

const AIEngine = {
  models: {
    'Luolaf.3': {
      name: 'Luolaf.3 (Claude)',
      provider: 'claude',
      icon: '🤖',
      desc: 'Claude AI - بسیار قدرتمند و دقیق',
      color: '#4FA8D5'
    },
    'Uliki.2': {
      name: 'Uliki.2 (Groq)',
      provider: 'groq',
      icon: '⚡',
      desc: 'Groq AI - سریع و کارآمد',
      color: '#9B59B6'
    },
    'Uliki.3': {
      name: 'Uliki.3 (Google AI)',
      provider: 'google',
      icon: '🔍',
      desc: 'Google AI Studio - نسل بعدی',
      color: '#E74C3C'
    }
  },

  currentModel: 'Luolaf.3',
  apiKeys: {},

  // ===== مدل‌های هوش مصنوعی بخش چت =====
  chatAIs: {
    'Luolaf': {
      name: 'Luolaf',
      provider: 'groq',
      icon: '🔮',
      desc: 'هوش مصنوعی Groq - سریع‌تر'
    },
    'Uliki': {
      name: 'Uliki',
      provider: 'google',
      icon: '✨',
      desc: 'هوش مصنوعی Google - هوشمند‌تر'
    }
  },

  currentChatAI: 'Luolaf',

  // تنظیم API Key
  setAPIKey(provider, key) {
    this.apiKeys[provider] = key;
    localStorage.setItem(`uliki_api_${provider}`, key);
  },

  getAPIKey(provider) {
    return this.apiKeys[provider] || localStorage.getItem(`uliki_api_${provider}`) || '';
  },

  // ===== تولید محتوا با فرمت‌های ویژه =====
  async generateContent(type, prompt, options = {}) {
    const model = this.models[this.currentModel];
    const provider = model.provider;
    const apiKey = this.getAPIKey(provider);

    if (!apiKey) {
      return { error: `لطفاً API Key برای ${model.name} را تنظیم کنید` };
    }

    try {
      switch (type) {
        case 'code':
          return await this.generateCode(prompt, options, provider, apiKey);
        case 'image':
          return await this.generateImage(prompt, options, provider, apiKey);
        case 'video':
          return await this.generateVideo(prompt, options, provider, apiKey);
        case 'music':
          return await this.generateMusic(prompt, options, provider, apiKey);
        case 'text':
          return await this.generateText(prompt, options, provider, apiKey);
        default:
          return await this.generateText(prompt, options, provider, apiKey);
      }
    } catch (error) {
      return { error: error.message };
    }
  },

  // ===== تولید کد (در جعبه کد)
  async generateCode(prompt, options, provider, apiKey) {
    const language = options.language || 'javascript';
    const messageContent = `
[CODE_GENERATION_REQUEST]
زبان: ${language}
توضیح: ${prompt}
نوع: ${options.type || 'write'}

لطفاً کد کامل، کارآمد و مناسب تولید کن.
فقط کد تولید کن، بدون توضیح اضافی.
`;

    const response = await this.callAI(provider, messageContent, apiKey);
    
    if (response.error) return response;

    // استخراج کد از پاسخ
    const codeMatch = response.text.match(/```[\w]*\n([\s\S]*?)\n```/) || 
                      [null, response.text];
    const code = codeMatch[1] || response.text;

    return {
      type: 'code',
      language,
      code: code.trim(),
      formatted: `\`\`\`${language}\n${code.trim()}\n\`\`\``,
      text: response.text
    };
  },

  // ===== تولید تصویر
  async generateImage(prompt, options, provider, apiKey) {
    // استفاده از Pollinations API (رایگان)
    const style = options.style || 'realistic';
    const imgPrompt = `${prompt} style: ${style}`;
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(imgPrompt)}`;

    return {
      type: 'image',
      prompt,
      style,
      url: imageUrl,
      generated: true
    };
  },

  // ===== تولید ویدیو
  async generateVideo(prompt, options, provider, apiKey) {
    const messageContent = `
[VIDEO_GENERATION_REQUEST]
توضیف ویدیو: ${prompt}
مدت زمان: ${options.duration || '30 ثانیه'}
سبک: ${options.style || 'animated'}

لطفاً یک اسکریپت ویدیو کامل تولید کن با:
1. توصیف صحنه‌های متوالی
2. زمان هر صحنه (به ثانیه)
3. توضیح انتقال‌ها
4. نوشتار (اگر لازم)

فرمت:
[SCENE_1]
توضیف: ...
مدت: ... ثانیه
انتقال: ...
`;

    const response = await this.callAI(provider, messageContent, apiKey);
    
    if (response.error) return response;

    return {
      type: 'video',
      prompt,
      duration: options.duration || '30 ثانیه',
      style: options.style || 'animated',
      script: response.text,
      isProcessing: false
    };
  },

  // ===== تولید موسیقی
  async generateMusic(prompt, options, provider, apiKey) {
    const messageContent = `
[MUSIC_GENERATION_REQUEST]
توضیف: ${prompt}
سبک: ${options.genre || 'ambient'}
حال و هوا: ${options.mood || 'calm'}
مدت: ${options.duration || '1 دقیقه'}

لطفاً موسیقی‌ای درخواست‌شده را تولید کن.
نتیجه باید شامل:
1. متن آهنگ (اگر لازم)
2. شرح آهنگ
3. تکنیک‌های صوتی
`;

    const response = await this.callAI(provider, messageContent, apiKey);
    
    if (response.error) return response;

    return {
      type: 'music',
      prompt,
      genre: options.genre || 'ambient',
      mood: options.mood || 'calm',
      duration: options.duration || '1 دقیقه',
      text: response.text,
      generated: true
    };
  },

  // ===== تولید متن عمومی
  async generateText(prompt, options, provider, apiKey) {
    const contentType = options.contentType || 'article';
    const messageContent = `
[TEXT_GENERATION_REQUEST]
نوع محتوا: ${contentType}
موضوع: ${prompt}
زبان: فارسی
سبک: ${options.style || 'formal'}

لطفاً متن کامل و جذاب تولید کن.
`;

    const response = await this.callAI(provider, messageContent, apiKey);
    
    if (response.error) return response;

    return {
      type: 'text',
      contentType,
      prompt,
      text: response.text,
      generated: true
    };
  },

  // ===== فراخوانی API های مختلف
  async callAI(provider, message, apiKey) {
    switch (provider) {
      case 'groq':
        return await this.callGroqAPI(message, apiKey);
      case 'google':
        return await this.callGoogleAPI(message, apiKey);
      case 'claude':
        return await this.callClaudeAPI(message, apiKey);
      default:
        return { error: 'مدل نامشخص است' };
    }
  },

  // ===== Groq API
  async callGroqAPI(message, apiKey) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'mixtral-8x7b-32768',
          messages: [{
            role: 'user',
            content: message
          }],
          temperature: 0.7,
          max_tokens: 2048
        })
      });

      if (!response.ok) {
        throw new Error(`Groq API Error: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        text: data.choices[0].message.content,
        model: 'groq',
        tokens: data.usage.total_tokens
      };
    } catch (error) {
      return { error: error.message };
    }
  },

  // ===== Google AI Studio API
  async callGoogleAPI(message, apiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: message
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2048
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Google API Error: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        text: data.candidates[0].content.parts[0].text,
        model: 'google',
        tokens: 0
      };
    } catch (error) {
      return { error: error.message };
    }
  },

  // ===== Claude API
  async callClaudeAPI(message, apiKey) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 2048,
          messages: [{
            role: 'user',
            content: message
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Claude API Error: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        text: data.content[0].text,
        model: 'claude',
        tokens: data.usage.input_tokens + data.usage.output_tokens
      };
    } catch (error) {
      return { error: error.message };
    }
  },

  // ===== چت هوشمند
  async chat(message, aiName = 'Luolaf') {
    const ai = this.chatAIs[aiName];
    if (!ai) return { error: 'مدل چت نامشخص است' };

    const apiKey = this.getAPIKey(ai.provider);
    if (!apiKey) {
      return { error: `لطفاً API Key برای ${aiName} را تنظیم کنید` };
    }

    return await this.callAI(ai.provider, message, apiKey);
  },

  // ===== تبدیل تصاویر به ویدیو
  async createVideoFromImages(images, options = {}) {
    return {
      type: 'video_from_images',
      frameCount: images.length,
      framesPerSecond: options.fps || 24,
      duration: (images.length / (options.fps || 24)).toFixed(2) + 's',
      images: images,
      isProcessing: true,
      progress: 0
    };
  }
};

// صادرات برای استفاده در index.html
if (typeof window !== 'undefined') {
  window.AIEngine = AIEngine;
}
