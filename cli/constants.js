import path from 'path'
import os from 'os'
import { readFileSync } from 'fs'

/**
 * @typedef {Object} Config
 * @property {string} accessToken
 * @property {string} username
 * @property {string} password
 */

export const config_path = path.join(os.homedir(), '.fusion', 'config.json')

/**
 * fetch config from config file
 * @returns {Config}
 */
function getConfig() {
    try {
        const config = JSON.parse(
            readFileSync(config_path, { encoding: 'utf-8' }).toString()
        )
        return config
    } catch (err) {
        return {
            accessToken: '',
            username: '',
            password: ''
        }
    }
}

export const config = getConfig()
