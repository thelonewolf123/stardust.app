local key = ARGV[1]
local action = ARGV[2]

if action == "add" then
    local result = redis.call("HSETNX", "lock", key, "1")
    if result == 1 then
        return "added"
    else
        return "exists"
    end
elseif action == "release" then
    local result = redis.call("HDEL", "lock", key)
    if result == 1 then
        return "released"
    else
        return "not_found"
    end
else
    return "failed"
end
