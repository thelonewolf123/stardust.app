local key = ARGV[1]
local action = ARGV[2]

if action == "add" then
    local result = redis.call("HSETNX", key, "lock", "1")
    if result == 1 then
        return "added"
    else
        return "exists"
    end
elseif action == "remove" then
    local result = redis.call("HDEL", key, "lock")
    if result == 1 then
        return "released"
    else
        return "not_found"
    end
else
    return "failed"
end
