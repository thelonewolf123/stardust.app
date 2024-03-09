export async function POST(req: Request) {
    const { token } = await req.json()
    return new Response(JSON.stringify({ success: true }), {
        headers: {
            'content-type': 'application/json',
            // set cookie to expire in 60 hour
            'set-cookie': `token=${token}; Max-Age=216000; HttpOnly; SameSite=Strict; Path=/`
        }
    })
}
