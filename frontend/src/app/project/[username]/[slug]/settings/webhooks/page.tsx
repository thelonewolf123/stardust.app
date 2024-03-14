export default async function WebhooksPage() {
    await new Promise((r) => setTimeout(r, 5000))
    return (
        <div>
            <h1>Webhooks</h1>
        </div>
    )
}
