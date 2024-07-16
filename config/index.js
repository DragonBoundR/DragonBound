class Configuration{
    constructor() {
        this.ssl = {
            path: '',
            key: '',
        };
        this.ports = {
            http: 3000,
            https: 3000,
        };
        this.ws = {
            port: 9001
        };
        this.is_http = false;
        this.is_https = false;
        this.db = {
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'game',
            connectionLimit: 500
        }
    }

    getConfigDB(){
        return { ...this.db };
    }

    static getInstance(){
        return new Configuration();
    }

    getPortWS(){
        return this.ws.port;    
    }

    getIsHttps(){
        return this.is_https;
    }

    getPort(){
        return this.is_https ? this.ports.https : this.ports.http;
    }

    getConfigHttp(){
        return {};
    }

    getConfigHttps(){
        return {
            //pfx: require('fs').readFileSync(path_ssl),
            //passphrase: this.ssl.key,
        };
    }
}

module.exports = Configuration;