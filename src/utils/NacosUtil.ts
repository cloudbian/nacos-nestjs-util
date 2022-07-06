const NacosNamingClient = require('nacos').NacosNamingClient;


export class NacosUtil {
    private static client;

    /**
     * 根据服务名返回健康并启用的实例URI
     * @param serviceName 需要调用的服务名
     * @param groupName 分组名称，如果传空默认DEFAULT_GROUP
     * @return uri
     */
    static async getServiceUri(serviceName: string, groupName: string) {
        this.initClient();
        NacosUtil.client.ready();
        const instanceList = await NacosUtil.client.selectInstances(serviceName, groupName);
        for (let i of instanceList) {
            if (i.healthy && i.enabled) {
                return process.env.HTTP_PREFIX + i.ip + ":" + i.port + "/" + i.serviceName.substr(i.serviceName.indexOf("@@") + 2);
            }
        }
    }

    /**
     * 随机返回一个健康并启用的实例URI
     * @param serviceName 需要调用的服务名
     * @param groupName 分组名称，如果传空默认DEFAULT_GROUP
     * @return uri
     */
    static async getServiceUriWithLB(serviceName: string, groupName: string) {
        this.initClient();
        NacosUtil.client.ready();
        const instanceList = await NacosUtil.client.selectInstances(serviceName, groupName);
        //健康的实例URI集合
        let healthInstanceList: string[] = [];
        for (let i of instanceList) {
            if (i.healthy && i.enabled) {
                healthInstanceList.push(process.env.HTTP_PREFIX + i.ip + ":" + i.port + "/" + i.serviceName.substr(i.serviceName.indexOf("@@") + 2));
            }
        }
        let randNum: number = Math.floor(Math.random() * healthInstanceList.length);
        return healthInstanceList[randNum];
    }

    /**
     * 根据服务名和组名获取服务实例集合
     * @param serviceName 需要调用的服务名
     * @param groupName 分组名称，如果传空默认DEFAULT_GROUP
     * @return instanceList 
     */
    static async getInstanceListBySerName(serviceName: string, groupName: string) {
        this.initClient();
        NacosUtil.client.ready();
        const instanceList = await NacosUtil.client.selectInstances(serviceName, groupName);
        //健康的实例URI集合
        return instanceList;
    }

    /**
     * 初始化客户端，如果存在不会重复初始化
     */
    private static initClient() {
        if (!NacosUtil.client) {
            NacosUtil.client = new NacosNamingClient({
                logger: console,
                serverList: process.env.DISCOVERY_SERVERLIST,
                namespace: process.env.DISCOVERY_NAMESPACE
            });
        }
    }
}
