-- Arguments passed from Node.js
local containerSlug = ARGV[1]  -- The slug identifier for the container

-- Get the current 'physicalHost' data from Redis
local data = redis.call('GET', 'physicalHost')

-- Check if 'physicalHost' data exists in Redis
if not data then
    return nil  -- If it doesn't exist, return nil as there are no containers to remove
end

-- Decode the JSON data into a Lua table
local physicalHost = cjson.decode(data)

-- Function to find the index of a container based on its slug
local function findContainerIndex()
    for i, instance in ipairs(physicalHost) do
        for j, container in ipairs(instance.containers) do
            if container.containerSlug == containerSlug then
                return i, j
            end
        end
    end
end

-- Find the container index using the provided containerSlug
local instanceIndex, containerIndex = findContainerIndex()

-- Check if the container was found
if not instanceIndex or not containerIndex then
    return nil  -- If it was not found, return nil as we cannot remove a non-existent container
end

-- Remove the container from the 'containers' array
table.remove(physicalHost[instanceIndex].containers, containerIndex)

-- Encode the modified 'physicalHost' table back to JSON
local updatedData = cjson.encode(physicalHost)

-- Update the 'physicalHost' key in Redis with the updated data
redis.call('SET', 'physicalHost', updatedData)

-- Return the containerSlug to confirm that the container was removed successfully
return containerSlug
