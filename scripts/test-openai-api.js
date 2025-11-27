#!/usr/bin/env node

/**
 * OpenAI API 連線測試腳本
 * 
 * 用途: 快速驗證 OpenAI API Key 是否設定正確且有效
 * 
 * 使用方法:
 *   node scripts/test-openai-api.js
 */

require('dotenv').config({ path: '.env.local' });
const axios = require('axios');

async function testOpenAIConnection() {
  console.log('🔍 Testing OpenAI API connection...\n');

  // 1. 檢查環境變數
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ Error: OPENAI_API_KEY not found in .env.local');
    console.log('\n💡 Solution:');
    console.log('1. Create or edit .env.local file');
    console.log('2. Add: OPENAI_API_KEY=sk-proj-xxxxx');
    console.log('3. Get your API key from: https://platform.openai.com/api-keys');
    process.exit(1);
  }

  console.log('✅ API Key found:', apiKey.substring(0, 20) + '...');

  // 2. 測試 API 連線
  try {
    console.log('\n🚀 Sending test request to OpenAI...');
    
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o',
        messages: [
          { role: 'user', content: 'Say "Hello, API test successful!" in one sentence.' }
        ],
        max_tokens: 50,
        temperature: 0
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    const reply = response.data.choices[0].message.content;
    const usage = response.data.usage;

    console.log('\n✅ Success! OpenAI API is working correctly.\n');
    console.log('📝 Response:', reply);
    console.log('\n📊 Token Usage:');
    console.log('   - Prompt tokens:', usage.prompt_tokens);
    console.log('   - Completion tokens:', usage.completion_tokens);
    console.log('   - Total tokens:', usage.total_tokens);
    console.log('\n💰 Estimated cost: ~$0.0001 USD');
    console.log('\n🎉 Your OpenAI API is ready for resume parsing!');

  } catch (error) {
    console.error('\n❌ Error connecting to OpenAI API:\n');
    
    if (error.response) {
      const errorData = error.response.data.error;
      console.error('Error Type:', errorData.type);
      console.error('Error Code:', errorData.code);
      console.error('Error Message:', errorData.message);

      console.log('\n💡 Solutions:');
      
      if (errorData.type === 'insufficient_quota') {
        console.log('1. Your OpenAI account has no quota/credits');
        console.log('2. Visit: https://platform.openai.com/account/billing');
        console.log('3. Add a payment method or purchase credits');
        console.log('4. Wait a few minutes for the quota to update');
      } else if (errorData.code === 'invalid_api_key') {
        console.log('1. Your API key is invalid or expired');
        console.log('2. Generate a new key: https://platform.openai.com/api-keys');
        console.log('3. Update OPENAI_API_KEY in .env.local');
      } else {
        console.log('1. Check your internet connection');
        console.log('2. Verify your API key is correct');
        console.log('3. Check OpenAI status: https://status.openai.com/');
      }
    } else {
      console.error('Network error:', error.message);
      console.log('\n💡 Solutions:');
      console.log('1. Check your internet connection');
      console.log('2. Check if you need a proxy/VPN');
    }
    
    process.exit(1);
  }
}

testOpenAIConnection();

