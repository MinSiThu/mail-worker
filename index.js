const dns = require('dns')
const net = require('net')
const emailValidator = require("email-validator");
const domainExtractor = require("extract-domain");
const errorEnum  = require("./error_Enum");

class MailWorker{
    constructor({port=25,timeout=3000}){
        this.port = port;
        this.timeout = timeout;
    }

    isEmailFormat(email){
        return emailValidator.validate(email);
    }

    getDomainName(email){
        return domainExtractor(email);
    }

    async exists(email,{sender}){
        let THIS = this;

        if(this.isEmailFormat(email) == true){
            let domain = this.getDomainName(email);
            return new Promise((resolve,reject)=>{
                dns.resolveMx(domain,(err,addresses)=>{
                    if(err) reject(err);
                    else{
                        const sortedAddresses = addresses.sort((a, b) => a.priority - b.priority)
                        const exchange = sortedAddresses[0].exchange
                        const conn = net.createConnection(THIS.port, exchange);
                        
                        conn.setTimeout(THIS.timeout);
                        conn.on('error', reject);
                        conn.on('timeout', () => reject(errorEnum.CONNECTION_TIME_OUT));
                        
                        conn.on('connect', () => {
                            const EOL = '\r\n'
    
                            conn.write('HELO hi' + EOL)
                            conn.write(`MAIL FROM: <${sender}>` + EOL)
                            conn.write(`RCPT TO: <${email}>` + EOL)
                            conn.write('QUIT' + EOL)
                            
                            conn.on('data', data => {
                                const response = data.toString().trim()
                                if (debug) console.log(response)
                                if (response.startsWith('550')) resolve(errorEnum.NOT_FOUND)
                                if (response.startsWith('553')) resolve(errorEnum.INVALID_SYNTAX)
                            })
                            conn.on('end', () => resolve(errorEnum.MAY_EXIST))
                        })

                        
                    }
                })
            })
        }
        return errorEnum.INVALID_EMAIL;
    }
}

module.exports = MailWorker;