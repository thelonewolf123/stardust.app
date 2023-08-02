import { Express } from 'express'

export default function InstanceRoute(app: Express) {
    app.get('/api/instance', (req, res) => {
        return res.send('Instance')
    })
}
