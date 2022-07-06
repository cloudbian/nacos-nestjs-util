import { Inject, Injectable, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
const NacosNamingClient = require('nacos').NacosNamingClient;
@Injectable()
export class HookService implements OnApplicationBootstrap, OnApplicationShutdown {
    private client;
    private serviceName: string = process.env.DISCOVERY_APPNAME;
    /**
     * 应用关闭时触发
     */
    async onApplicationShutdown(signal?: string) {
        console.log('应用关闭，信号:' + signal + '...');
        if ('SIGINT' === signal || 'SIGBREAK' === signal || 'SIGTERM' === signal) {
            console.log('卸载服务发现客户端');
            // deregister instance
            await this.client.deregisterInstance(this.serviceName, {
                ip: this.getIPAdress(),
                port: this.getPort()
            });
        }
    }

    /**
     * 应用启动时触发
     */
    async onApplicationBootstrap() {
        console.log('初始化服务发现客户端...');
        this.client = new NacosNamingClient({
            logger: console,
            serverList: process.env.DISCOVERY_SERVERLIST,
            namespace: process.env.DISCOVERY_NAMESPACE
        });
        await this.client.ready();
        // registry instance
        await this.client.registerInstance(this.serviceName, {
            ip: this.getIPAdress(),
            port: this.getPort()
        }, process.env.DISCOVERY_GROUP);
    }

    /**
     * 获取注册的IP
     */
    getIPAdress(): string {
        let ipAddr: string = '127.0.0.1';
        if (process.env.HOST_IP) { //如果配置环境变量
            ipAddr = process.env.HOST_IP;
        } else if (process.env.SERVICE_IP) { //本地配置文件
            ipAddr = process.env.SERVICE_IP;
        } else { //自动获取IP
            var interfaces = require('os').networkInterfaces();
            for (var devName in interfaces) {
                var iface = interfaces[devName];
                for (var i = 0; i < iface.length; i++) {
                    var alias = iface[i];
                    if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                        ipAddr = alias.address;
                        break;
                    }
                }
            }
        }

        return ipAddr;
    }

    /**
     * 获取注册的port
     */
    getPort(): String {
        let port: string = '3000';
        if (process.env.SERVER_PORT) { //如果服务器配置
            port = process.env.SERVER_PORT;
        } else if (process.env.PORT) { //获取本地配置
            port = process.env.PORT;
        } else {
            console.log('>>>>>>>>>>没有获取到配置，使用默认端口:3000进行注册');
        }
        return port;
    }
}
