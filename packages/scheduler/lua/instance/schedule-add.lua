-- Extract the arguments passed from Node.js
local instanceId = ARGV[1] -- The unique identifier for the instance
local amiId = ARGV[2]      -- The AMI (Amazon Machine Image) ID of the instance
local publicIp = ARGV[3]   -- The public IP address of the instance

-- Get the current 'physicalHost' data from Redis
local data = redis.call('GET', 'physicalHost')

-- Check if 'physicalHost' data exists in Redis
if not data then
    data = {}                 -- If it doesn't exist, initialize an empty table
else
    data = cjson.decode(data) -- If it exists, decode the JSON data into a Lua table
end

-- Create a new instance object with the provided information and an empty 'containers' array
local newInstance = {
    instanceId = instanceId,
    amiId = amiId,
    scheduledForDeletionAt = nil,
    status = 'scheduled',
    publicIp = publicIp,
    containers = {}
}

-- Insert the new instance into the 'data' table
table.insert(data, newInstance)

-- Update the 'physicalHost' key in Redis with the modified data
redis.call('SET', 'physicalHost', cjson.encode(data))

-- Return the 'instanceId' to confirm that the instance was added successfully
return instanceId
