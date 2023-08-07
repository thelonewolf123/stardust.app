local containerSlug = ARGV[1]
local data = redis.call('GET', 'physicalHost')
local currentTime = tonumber(redis.call('TIME')[1])
-- Check if 'physicalHost' key exists
if not data then
    return nil
end

-- Convert the JSON string to a Lua table
local physicalHost = cjson.decode(data)

-- Iterate through the physicalHost array to find the instance with less than 10 containers and scheduledForDeletionAt is null
for i, instance in ipairs(physicalHost) do
    if #instance.containers < 10 and instance.status == 'running' and (not instance.scheduledForDeletionAt or instance.scheduledForDeletionAt == nil) then
        -- Add a new item to the containers array for the matching instance
        local newContainer = {
            containerSlug = containerSlug,
            status = 'pending',
            scheduledAt = currentTime -- assuming you want to set the current timestamp
        }
        table.insert(instance.containers, newContainer)

        -- Convert the modified physicalHost table back to JSON string
        local updatedData = cjson.encode(physicalHost)

        -- Update the 'physicalHost' key in Redis with the updated data
        redis.call('SET', 'physicalHost', updatedData)

        -- Return the instanceId of the matching instance
        return instance.instanceId
    end
end

-- Return nil if no matching instance is found
return nil
