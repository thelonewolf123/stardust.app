-- Arguments passed from Node.js
local instanceId = ARGV[1]        -- The unique identifier for the instance
local keyValuePairsJson = ARGV[2] -- The JSON string containing the key-value pairs to update or add

-- Get the 'physicalHost' data from Redis
local data = redis.call('GET', 'physicalHost')

-- Check if 'physicalHost' data exists in Redis
if not data then
    return nil -- If it doesn't exist, return nil as there are no instances to update
end

-- Decode the JSON data into a Lua table
local physicalHost = cjson.decode(data)

-- Find the instance index using the provided instanceId
local instanceIndex = nil
for i, instance in ipairs(physicalHost) do
    if instance.instanceId == instanceId then
        instanceIndex = i
        break
    end
end

-- Check if the instance was found
if not instanceIndex then
    return nil -- If it was not found, return nil as we cannot update a non-existent instance
end

-- Get the existing instance object
local instance = physicalHost[instanceIndex]

-- Decode the JSON string containing the key-value pairs to update or add
local keyValuePairs = cjson.decode(keyValuePairsJson)

-- Update or add the key-value pairs in the instance object
for key, value in pairs(keyValuePairs) do
    instance[key] = value
end

-- Encode the modified 'physicalHost' table back to JSON
local updatedData = cjson.encode(physicalHost)

-- Update the 'physicalHost' key in Redis with the updated data
redis.call('SET', 'physicalHost', updatedData)

-- Return the instanceId to confirm that the instance was updated successfully
return instanceId
