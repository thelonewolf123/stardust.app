async function start() {
    let i = 0
    while (true) {
        console.log(i)
        i++
        await new Promise((r) => setTimeout(r, 1000))
    }
}

start()
