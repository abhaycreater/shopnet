const dns = require("dns");

dns.setServers([
    "8.8.8.8",
    "1.1.1.1"
]);

dns.resolveSrv(
    "_mongodb._tcp.shopnet.wlepe62.mongodb.net",
    (err, addresses) => {
        if (err) {
            console.error("DNS ERROR:", err);
            return;
        }

        console.log("DNS SUCCESS:");
        console.log(addresses);
    }
);