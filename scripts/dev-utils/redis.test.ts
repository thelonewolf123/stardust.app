import redis from '../../packages/core/redis'

redis
    .runLuaScript(
        'getPhysicalHosts',
        'return redis.call("GET", "physicalHost")',
        []
    )
    .then((result) => {
        console.log(result)
        process.exit(0)
    })
