const mqtt = require('mqtt');
const { URL } = require('url');

// 填写 MQTT 应用端订阅参数，在控制台获取
// 参考文档：https://www.thingscloud.xyz/docs/guide/api/project-mqtt-subscribe.html
// 只需填写以下 3 个参数，其它代码无需修改，即可运行
// (1) MQTT 地址
const mqtt_url = "wss://..."
// (2) ProjectViewKey
const project_view_key = ""
// (3) ProjectViewSecret
const project_view_secret = ""


// MQTT 连接配置
const brokerUrl = new URL(mqtt_url);
const options = {
    // 认证信息
    username: project_view_key,
    password: project_view_secret,
    clientId: 'client_' + Math.random().toString(16).substring(2, 8),

    // WebSocket配置
    protocol: 'wss',
    hostname: brokerUrl.hostname,
    port: brokerUrl.port || 443,
    path: brokerUrl.pathname, // 确保路径是/mqtt

    // 协议版本，对应 MQTT v3.1.1
    protocolVersion: 4,

    // TLS配置
    rejectUnauthorized: true
};

// 创建客户端
const client = mqtt.connect(options);

// 连接事件处理
client.on('connect', () => {
    console.log('Connected to ThingsCloud MQTT App broker');

    // 参考 ThingsCloud MQTT 应用端订阅文档，订阅需要的主题，可以订阅多个主题。
    // 注意：qos必须为0。
    const topic = `${project_view_key}/+/attributes`;
    client.subscribe(topic, { qos: 0 }, (err) => {
        if (err) {
            console.error('Subscription failed:', err);
        } else {
            console.log(`Subscribed to topic: ${topic}`);
        }
    });
});

// 消息接收处理
client.on('message', (topic, message) => {
    try {
        // 解析JSON数据
        const payload = JSON.parse(message.toString());
        console.log(`\nReceived from [${topic}]:`);
        console.log(JSON.stringify(payload, null, 2));
    } catch (err) {
        console.error('Invalid JSON:', message.toString());
    }
});

// 错误处理
client.on('error', (err) => {
    console.error('Connection error:', err);
    client.end();
});

client.on('close', () => {
    console.log('Connection closed');
});

// 处理程序退出
process.on('SIGINT', () => {
    console.log('\nDisconnecting...');
    client.end();
});