const dns = require("dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);
console.log("DNS servers set to 1.1.1.1 and 8.8.8.8");