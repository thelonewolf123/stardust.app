-- Arguments passed from Node.js
local containerSlug = ARGV[1] -- The unique identifier for the container
local projectSlug = ARGV[2]   -- The unique identifier for the project

-- Get the current 'physicalHost' data from Redis
local data = redis.call('GET', 'physicalHost')

-- Check if 'physicalHost' data exists in Redis
if not data then
    return nil -- If it doesn't exist, return nil as there are no containers to update
end

-- Decode the JSON data into a Lua table
local physicalHost = cjson.decode(data)

-- Function to find the index of a container based on its slug or project slug
local function findContainerIndex()
    for _, instance in ipairs(physicalHost) do
        for index, container in ipairs(instance.containers) do
            if container.containerSlug == containerSlug or container.projectSlug == projectSlug then
                return instance, index -- Return both the instance and the index
            end
        end
    end
    return nil
end

-- Find the container instance and index using the provided containerSlug or projectSlug
local containerInstance, containerIndex = findContainerIndex()

-- Check if the container was found
if not containerInstance then
    return nil -- If it was not found, return nil as we cannot update a non-existent container
else
    local containerJson = cjson.encode(containerInstance.containers[containerIndex])
    return containerJson
end
