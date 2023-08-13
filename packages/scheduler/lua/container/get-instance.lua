-- Arguments passed from Node.js
local containerId = ARGV[1] -- The unique identifier for the container

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
            if container.containerId == containerId then
                return i, j
            end
        end
    end
end

-- Find the container index using the provided containerId or containerId
local instanceIndex, containerIndex = findContainerIndex()

-- Check if the container was found
if not instanceIndex or not containerIndex then
    return nil -- If it was not found, return nil as we cannot update a non-existent container
end

-- Get the existing container object
local instanceId = physicalHost[instanceIndex].instanceId

return instanceId
