# mail-worker
 email existence checker in node.js

This is a package about email in node.js

```
npm install --save mail-worker
```

```js
let MailWorker = require("./index");
let mailWorker = new MailWorker({
    port:3000,
    timeout:4000,
})

mailWorker.isEmailFormat("yay@example.com"); //return true || false

mailWorker.getDomainName("dane@example.com"); // return domain name

mailWorker.exists("jame@example.com",{
    sender:"YayPhat"
})
.then(result=>console.log(result))
.catch(e=>console.log(e))
```