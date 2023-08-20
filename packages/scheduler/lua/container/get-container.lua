-- Arguments passed from Node.js
local containerSlug = ARGV[1] -- The unique identifier for the container
local projectSlug = ARGV[2]   -- The unique identifier for the container

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
    for _, instance in ipairs(physicalHost) do
        for _, container in ipairs(instance.containers) do
            if container.containerSlug == containerSlug or container.projectSlug == projectSlug then
                return container
            end
        end
    end
    return nil
end

-- Find the container index using the provided containerId or containerId
local container = findContainerIndex()


-- Check if the container was found
if not container then
    return nil -- If it was not found, return nil as we cannot update a non-existent container
else
    local containerJson = cjson.encode(container)
    return containerJson
end
