## 1.0.8更新内容
1.服务注册逻辑：
  (1)注册服务时，如果服务器设置了环境变量HOST_IP和SERVER_PORT，那么会把HOST_IP和SERVER_PORT作为服务的IP和PORT进行注册。
  (2)如果服务器没有设置环境变量，那么获取.env相关配置(SERVICE_IP,PORT)作为服务的IP和PORT进行注册。
  (3)如果本地未配置，那么自动获取服务器IP以及使用默认端口3000进行服务注册。
2.新增获取服务实例集合方法
## 介绍
本工具基于NestJs8.0以及nacos2.2.1，用于微服务中服务发现注册，注销，以及访问服务等。
## 要求
1. 需要开启nest框架中的shutdownHooks,再应用的生命周期中做注册以及注销。
2. 设置globalPrefix需要和注册的服务名称一致（被调用的服务一样，context-path也需要与服务名一致）
3. 注册服务的端口号和应用的端口号一致
## 使用
1. 安装
```
>npm install nacos-nestjs-util --save
>npm install nacos --save
```
2. 在.env文件中增加如下配置,注意：NestJs获取.env文件需要添加ConfigModule，具体参考[官方文档](https://docs.nestjs.cn/8/techniques?id=%e9%85%8d%e7%bd%ae)
```ConfigModule示例（在app.module中导入配置）
    imports:[ConfigModule.forRoot({
      envFilePath: ['.env', '.env.' + process.env.NODE_ENV],
    })],
```
```.env文件示例
DISCOVERY_SERVERLIST = 192.168.56.101:1234 #配置nacos服务地址
DISCOVERY_NAMESPACE = public #配置nacos的空间名称（服务也是注册到此空间）
DISCOVERY_GROUP = UAT #配置nacos的分组名称
DISCOVERY_APPNAME = node-service #本服务名称
SERVICE_IP = 192.168.1.111 #本服务IP（可选）
PORT = 3000 #本服务端口号（可选）
HTTP_PREFIX = http:// #访问URI的前缀
```
3. 开启shutdownHooks
```javascript
  app.enableShutdownHooks();
```
4. 配置全局前缀以及端口号
```javascript
  app.setGlobalPrefix(process.env.DISCOVERY_APPNAME); //请求前缀
  await app.listen(process.env.PORT);
```
5. 在根module导入HookModule
```javascript
imports:[HookModule]
```

6. 调用服务示例
```javascript
        //获取服务temp-service的uri
        const uri = await NacosUtil.getServiceUriWithL('temp-service');
        //如果配置了分组请传入所属分组
        #const uri = await NacosUtil.getServiceUriWithL('temp-service', 'groupName');
        //调用temp-service提供的/demo/user/list接口
        const result = await axios.post(uri + '/demo/user/list', {});
```

## API列表
```javascript
    /**
     * 根据服务名返回健康并启用的实例URI
     * @param serviceName 需要调用的服务名
     * @param groupName 分组名称，如果传空默认DEFAULT_GROUP 
     * @return uri
     */
    static async getServiceUri(serviceName: string, groupName: string);

    /**
     * 随机返回一个健康并启用的实例URI
     * @param serviceName 需要调用的服务名
     * @param groupName 分组名称，如果传空默认DEFAULT_GROUP
     * @return uri
     */
    static async getServiceUriWithLB(serviceName: string, groupName: string);

    /**
     * 根据服务名和组名获取服务实例集合
     * @param serviceName 需要调用的服务名
     * @param groupName 分组名称，如果传空默认DEFAULT_GROUP
     * @return instanceList 
     */
    static async getInstanceListBySerName(serviceName: string, groupName: string);
```