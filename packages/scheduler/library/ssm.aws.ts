import invariant from 'invariant'

// Import the required AWS SDK modules
import {
    GetParameterCommand,
    PutParameterCommand,
    SSMClient
} from '@aws-sdk/client-ssm'

import { env } from '../../env'

// Function to set a parameter in the SSM Parameter Store
async function setSSMParameter(name: string, value: string) {
    // Create an SSM client
    const ssmClient = new SSMClient({ region: env.AWS_REGION })

    // Prepare the PutParameterCommand
    const params = {
        Name: name,
        Value: value,
        Type: 'String', // Change the type if required (String, SecureString, or StringList)
        Overwrite: true
    }

    // Call PutParameterCommand to set the parameter in the Parameter Store
    try {
        const data = await ssmClient.send(new PutParameterCommand(params))
        console.log(`Parameter "${name}" set successfully.`)
        return data
    } catch (error: any) {
        console.error(`Error setting parameter "${name}": ${error.message}`)
        throw error
    }
}

// Function to get a parameter from the SSM Parameter Store
async function getSSMParameter(name: string) {
    // Create an SSM client
    const ssmClient = new SSMClient({ region: env.AWS_REGION })

    // Prepare the GetParameterCommand
    const params = {
        Name: name,
        WithDecryption: true // Set to true if the parameter is of type SecureString
    }

    // Call GetParameterCommand to retrieve the parameter from the Parameter Store
    try {
        const data = await ssmClient.send(new GetParameterCommand(params))
        invariant(data.Parameter?.Value, `Parameter "${name}" not found.`)
        console.log(`Parameter "${name}" retrieved successfully.`)
        return data.Parameter.Value
    } catch (error: any) {
        console.error(`Error getting parameter "${name}": ${error.message}`)
        throw error
    }
}

export default { setSSMParameter, getSSMParameter }
