local domain = ARGV[1]
local ipPort = redis.call("HGET", "domainMap", domain)
if ipPort then
    return ipPort
end
