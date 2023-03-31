<template>
  <div>
    <!-- 输入框 -->
    <textarea v-model="userInput" @keydown.enter="sendMessage($event)" @keydown.shift.enter.prevent></textarea>
    <!-- 输出框 -->
    <div class="output" v-html="assistantOutput"></div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      userInput: '', // 用户输入
      assistantOutput: '', // 程序回复
    }
  },
  methods: {
    sendMessage(event) {
      if (event.shiftKey) return; // 按下shift+enter不发送消息
      this.assistantOutput += '<p>' + this.userInput + '</p>'; // 显示用户输入
      // 调用后端API获取程序回复
      // ...
      // 将程序回复显示到输出框
      this.assistantOutput += '<p>' + response + '</p>';
      this.userInput = ''; // 清空输入框
    }
  }
}
</script>

<style scoped>
textarea {
  width: 100%;
  height: 200px;
  border: none;
  padding: 10px;
  font-size: 16px;
}

.output {
  margin-top: 20px;
  border: 1px solid #ccc;
  padding: 10px;
  font-size: 16px;
}
</style>
