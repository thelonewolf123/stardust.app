local containerSlug = ARGV[1]
local projectSlug = ARGV[2]

local data = redis.call('GET', 'physicalHost')
local currentTime = tonumber(redis.call('TIME')[1])
---@diagnostic disable-next-line: undefined-global
local maxContainerCount = MAX_CONTAINER_PER_INSTANCE -- It'll be dynamically replaced in ts
-- Check if 'physicalHost' key exists
if not data then
    return nil
end

-- Convert the JSON string to a Lua table
local physicalHost = cjson.decode(data)

-- Iterate through the physicalHost array to find the instance with less than maxContainerCount containers and scheduledForDeletionAt is null
for _, instance in ipairs(physicalHost) do
    if instance.status ~= 'failed' and instance.instanceType == 'builder' then
        -- Check if any existing container in the instance has the same projectSlug
        for idx, container in ipairs(instance.containers) do
            if container.projectSlug == projectSlug then
                container.containerSlug = containerSlug
                container.status = 'pending'
                container.scheduledAt = currentTime
                container.updatedAt = currentTime
                table.remove(instance.containers, idx)
                table.insert(instance.containers, container) -- Update the containerSlug and status of the matching container
                local updatedData = cjson.encode(physicalHost)
                redis.call('SET', 'physicalHost', updatedData)

                -- Return the instanceId of the matching instance
                return instance.instanceId
            end
        end

        if #instance.containers < maxContainerCount then
            -- Add a new item to the containers array for the matching instance
            local newContainer = {
                containerSlug = containerSlug,
                projectSlug = projectSlug,
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
end

-- Return nil if no matching instance is found
return nil
