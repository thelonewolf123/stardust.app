local containerSlug = ARGV[1]
local data = redis.call('GET', 'physicalHost')
local currentTime = tonumber(redis.call('TIME')[1])
---@diagnostic disable-next-line: undefined-global
local maxContainerCount = MAX_CONTAINER_PER_INSTANCE -- It'll be dynamically replace in ts
-- Check if 'physicalHost' key exists
if not data then
    return nil
end

-- Convert the JSON string to a Lua table
local physicalHost = cjson.decode(data)

-- Iterate through the physicalHost array to find the instance with less than 10 containers and scheduledForDeletionAt is null
for i, instance in ipairs(physicalHost) do
    if #instance.containers < maxContainerCount and instance.status ~= 'failed' and instance.instanceType == 'runner' then
        -- Add a new item to the containers array for the matching instance
        local newContainer = {
            containerSlug = containerSlug,
            status = 'pending',
            scheduledAt = currentTime, -- assuming you want to set the current timestamp
            updatedAt = currentTime
        }

        instance.updatedAt = currentTime
        instance.scheduledForDeletionAt = nil

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
