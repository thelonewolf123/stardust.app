import { Express } from 'express'

export default function ContainerRoute(app: Express) {
    app.get('/api/container', (req, res) => {
        return res.send('Container')
    })
    app.get('/api/container/:id', (req, res) => {
        return res.send('Container')
    })
    app.post('/api/container', (req, res) => {
        return res.send('Container')
    })
    app.put('/api/container/:id', (req, res) => {
        return res.send('Container')
    })
    app.delete('/api/container/:id', (req, res) => {
        return res.send('Container')
    })
}
