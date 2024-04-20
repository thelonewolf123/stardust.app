export async function POST() {
    return new Response(
        JSON.stringify({
            token: 'token'
        }),
        {
            headers: {
                'content-type': 'application/json'
            },
            status: 200
        }
    )
}
