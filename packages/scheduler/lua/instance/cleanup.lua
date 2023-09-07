-- Get the current timestamp in seconds
local currentTime = tonumber(redis.call('TIME')[1])

-- Get the 'physicalHost' data from Redis
local data = redis.call('GET', 'physicalHost')

-- Check if 'physicalHost' data exists in Redis
if not data then
    return nil -- If it doesn't exist, return nil as there are no instances to check
end

-- Decode the JSON data into a Lua table
local physicalHost = cjson.decode(data)

-- Function to check if an instance is scheduled for deletion and past 2 minutes
local function isScheduledForDeletionPastTwoMinutes(instance)
    local scheduledForDeletionAt = instance.scheduledForDeletionAt
    if scheduledForDeletionAt and scheduledForDeletionAt ~= nil then
        local scheduledTimestamp = tonumber(scheduledForDeletionAt)
        if currentTime - scheduledTimestamp >= 120 then -- 120 seconds = 2 minutes
            return true
        end
    end
    return false
end

-- Function to add schedule delete timestamp to an instance
local function scheduleInstancesDeletion(instance)
    if (not instance.scheduledForDeletionAt and #instance.containers == 0) or instance.status == 'failed' then
        instance.scheduledForDeletionAt = currentTime
    end
end

-- Iterate through the 'physicalHost' data and remove instances scheduled for deletion past 2 minutes
local idx = 1
local deletedInstances = {}
for i, instance in ipairs(physicalHost) do
    scheduleInstancesDeletion(instance) -- Add schedule delete timestamp to instances with no containers or failed status
    if isScheduledForDeletionPastTwoMinutes(instance) then
        table.insert(deletedInstances, idx, instance.instanceId)
        table.remove(physicalHost, i)
        idx = idx + 1
    end
end

-- Encode the modified 'physicalHost' table back to JSON
local updatedData = cjson.encode(physicalHost)
local deletedInstances = cjson.encode(deletedInstances)

-- Update the 'physicalHost' key in Redis with the updated data
redis.call('SET', 'physicalHost', updatedData)

-- Return the instanceIds of the deleted instances (if any)
return deletedInstances
