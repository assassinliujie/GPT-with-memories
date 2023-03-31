const express = require('express');
const app = express();
const axios = require('axios');
const mongodb = require('mongodb');

// 中间件：解析 HTTP 请求体中的 JSON 数据
app.use(express.json());

// 处理响应格式
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json;charset=utf-8');
  next();
});

// 定义路由：处理机器人请求
app.post('/api/chatbot', async (req, res) => {
  try {
    const userInput = req.body.user; // 用户输入

    // 调用 Tencent NLP API 进行关键词提取
    const keywordRes = await axios.post('https://api.ai.qq.com/fcgi-bin/nlp/nlp_textkeywords', {
      text: userInput,
      mode: 1,
      candidate_num: 10,
      topn: 10,
      format: 1,
      app_id: 'YOUR_APP_ID',
      app_key: 'YOUR_APP_KEY',
    });
    const keywords = keywordRes.data.keyword_list.map(item => item.word); // 提取出的关键词

    // 拼接关键词，调用 Google search API 进行搜索
    const sek = keywords.join(' ');
    const searchRes = await axios.get(`https://www.googleapis.com/customsearch/v1?key=YOUR_API_KEY&cx=YOUR_SEARCH_ENGINE_CX&q=${encodeURIComponent(sek)}&num=3`);

    // 查询 MongoDB 数据库，获取最相关的回复
    const client = await mongodb.MongoClient.connect('mongodb://localhost:27017', { useUnifiedTopology: true });
    const db = client.db('YOUR_DB_NAME');
    const col = db.collection('longmem');
    const results = await col.aggregate([
      {
        $match: {
          context: {
            $in: keywords,
          },
        },
      },
      {
        $addFields: {
          similarity: {
            $reduce: {
              input: '$context',
              initialValue: 0,
              in: {
                $cond: [
                  { $in: ['$$this', keywords] },
                  { $add: ['$$value', 1] },
                  '$$value',
                ],
              },
            },
          },
        },
      },
      {
        $match: {
          similarity: { $gte: 5 }, // 最低匹配度为5
        },
      },
      {
        $project: {
          _id: 0,
          context: 1,
          data: 1,
          similarity: 1,
        },
      },
      {
        $sort: {
          similarity: -1, // 按照匹配度降序排序
        },
      },
      {
        $limit: 10, // 最多返回10个结果
      },
    ]).toArray();

    // 拼接回复内容
    let assistantOutput = '';
    results.forEach((item, index) => {
      assistantOutput += `第${index + 
