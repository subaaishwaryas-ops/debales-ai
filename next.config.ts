/** @type {import('next').NextConfig} */
const dns = require("dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const nextConfig = {};
module.exports = nextConfig;