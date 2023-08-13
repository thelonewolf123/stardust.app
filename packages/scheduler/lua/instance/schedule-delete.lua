-- Arguments passed from Node.js
local instanceId = ARGV[1] -- The unique identifier for the instance

local currentTime = tonumber(redis.call('TIME')[1])
local scheduledForDeletionAt = currentTime + 120 -- The date when the instance should be scheduled for deletion

-- Get the current 'physicalHost' data from Redis
local data = redis.call('GET', 'physicalHost')

-- Check if 'physicalHost' data exists in Redis
if not data then
    return nil -- If it doesn't exist, return nil as there are no instances to schedule
end

-- Decode the JSON data into a Lua table
local physicalHost = cjson.decode(data)

-- Find the instance with the given instanceId in the 'physicalHost' table
local targetInstanceIndex = nil
for i, instance in ipairs(physicalHost) do
    if instance.instanceId == instanceId then
        targetInstanceIndex = i
        break
    end
end

-- Check if the instance with the given instanceId was found
if not targetInstanceIndex then
    return nil -- If it was not found, return nil as we cannot schedule an instance that doesn't exist
end

-- Update the 'scheduledForDeletionAt' field of the target instance with the provided value
physicalHost[targetInstanceIndex].scheduledForDeletionAt = scheduledForDeletionAt

-- Encode the modified 'physicalHost' table back to JSON
local updatedData = cjson.encode(physicalHost)

-- Update the 'physicalHost' key in Redis with the updated data
redis.call('SET', 'physicalHost', updatedData)

-- Return the instanceId to confirm that the instance was scheduled for deletion successfully
return instanceId
