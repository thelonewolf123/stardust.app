export function GET(req: Request) {
    return new Response(
        JSON.stringify({
            success: true
        }),
        {
            status: 201,
            headers: {
                'content-type': 'application/json',
                'set-cookie':
                    'token=; Max-Age=0; HttpOnly; SameSite=Strict; Path=/'
            }
        }
    )
}
