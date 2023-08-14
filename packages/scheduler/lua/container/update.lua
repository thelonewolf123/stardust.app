-- Arguments passed from Node.js
local containerSlug = ARGV[1]     -- The unique identifier for the container
local keyValuePairsJson = ARGV[2] -- The JSON string containing the key-value pairs to update or add
local currentTime = tonumber(redis.call('TIME')[1])

-- Get the current 'physicalHost' data from Redis
local data = redis.call('GET', 'physicalHost')

-- Check if 'physicalHost' data exists in Redis
if not data then
    return nil -- If it doesn't exist, return nil as there are no containers to update
end

-- Decode the JSON data into a Lua table
local physicalHost = cjson.decode(data)

-- Function to find the index of a container based on its ID or slug
local function findContainerIndex()
    for i, instance in ipairs(physicalHost) do
        for j, container in ipairs(instance.containers) do
            if container.containerSlug == containerSlug then
                return i, j
            end
        end
    end
end

-- Find the container index using the provided containerSlug or containerSlug
local instanceIndex, containerIndex = findContainerIndex()

-- Check if the container was found
if not instanceIndex or not containerIndex then
    return nil -- If it was not found, return nil as we cannot update a non-existent container
end

-- Get the existing container object
local container = physicalHost[instanceIndex].containers[containerIndex]

-- Decode the JSON string containing the key-value pairs to update or add
local keyValuePairs = cjson.decode(keyValuePairsJson)

-- Update the 'updatedAt' field of the container with the current timestamp
container.updatedAt = currentTime

-- Update or add the key-value pairs in the container object
for key, value in pairs(keyValuePairs) do
    container[key] = value
end

-- Encode the modified 'physicalHost' table back to JSON
local updatedData = cjson.encode(physicalHost)

-- Update the 'physicalHost' key in Redis with the updated data
redis.call('SET', 'physicalHost', updatedData)

-- Return the containerSlug to confirm that the container was updated successfully
return containerSlug
