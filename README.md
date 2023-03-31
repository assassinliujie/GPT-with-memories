# GPT-with-memories
增加由NLP算法和神经网络维护的数据库，使chatgpt可以突破4096tokens数的限制，记忆长度从hours达到days级别
概述：该程序通过调用openai的chatgpt的api，配合由NLP和神经网络维护的记忆数据库，再加上由VUE3写的网页前端，构成了一个可以和机器人进行长期对话，具有方便简洁输入方式的程序。

接下来是按照各个部分进行功能细节描述：

一、变量定义

| 变量名    | 类型   | 含义备注                    |
| --------- | ------ | --------------------------- |
| user      | string | 用户输入的内容              |
| assistant | string | 程序输出的回复              |
| keyword[] | char   | NLP算法提取出的关键字       |
| SEK       | string | 由NLP算法提取出的关键字拼接 |
| search    | string | google search API返回的结果 |

二、前端

前端包括两个最基本的功能：

1.一个供用户输入的输入框，要求用户在输入字符后按回车可以进行发送，按shift+enter可以进行换行，输入的内容存入user变量

2.一个供程序输出的输出文本框，要求支持markdown语法输出渲染，输出的内容源自assistant变量

3.一个开关，可以选择是否启用使用google search API进行搜索的功能

其他要求：前端使用VUE3，尽量用一些开源的对话程序模板来让页面简洁好看

三、后端

后端包括以下步骤来实现功能

1.将user变量通过tencent NLP API里的KeywordsExtraction进行处理，提取十个关键字，提取的关键字/词以字符串形式存入字符数组keyword[]

2.将提取出的十个关键字keyword[]拼接为一个字符串SEK用Google search API进行搜索，返回的搜索结果存入字符串search中

3.将提取出的十个关键字keyword[]利用tencent NLP API里的TextSimilarity向MongoDB数据库中的mem库内的longmem集合进行搜索，得到和这十个关键词一起最关联的文件，返回十个最优的搜索结果，文件和关键词的匹配度满足一个最低值，不满足最低值时不作为结果输出，不满十个的用空文件补齐十个，存入mem库内的shortmem中

4.在search字符串前添加“（这是根据用户所说的搜索结果，仅供参考，无需说明你的信息来源于搜索）”，并将添加后的search字符串拼接到user字符串后面

5.将第三步中存入shortmem中的十个结果，按照匹配符合度顺序，依次拼接到user字符串后，例如结果一的符合度是99，结果2的是97，结果三的是98，则拼接结果是user+"第一匹配结果："+结果一+"第二匹配结果："+结果三+"第三匹配结果："+结果二以此类推，直至当下一个结果拼接进来的话字符串超过5000字长度时，不把下一个结果拼接进来，直接停止拼接。或者十个shortmmem都拼接进来了，也停止拼接

6.将处理完的user字符串利用openai API发送，使用chatgpt-3.5-turbo进行处理，得到回复，并将回复内容存入assistant变量

7.将assistant变量按照逗号句号和感叹号等表示句子结束或者句子进行了比较长的标点符号进行拆分，并且将拆分后的每个值存入数据库的longmem集合中

8.删除shortmem中的十个结果

四、数据库

数据库采用monggoDB，包含以下结构：

在名为mem的库中的longmem集合里的文件格式要包括：

1.conntext项，用于存放被搜索的内容，以及存放assistant拆分后的值

2.data，用于记录该项目被存入的日期

在名为mem的库中的longmem集合里的文件格式要包括：

1.conntext项，用于存放搜索结果

2.num项，用于存储根据NLP算法所得到的符合度值，越高越匹配

五、特殊说明

对于调用tencent的部分，请按照如下规则书写，请假定有这么一个已经写好了的自定义函数，分别是KE，对应KeywordsExtraction，和TS，对应TextSimilarity，他们只需在调用的时候将输入值和返回值填进括号内，就能自动完美处理好数据。
