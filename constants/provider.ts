import { ProviderType } from '@/types'

export const CLOUD_PROVIDER: ProviderType = 'aws-spot'
export const SPOT_INSTANCE_PRICE_PER_HOUR = undefined // NOTE: Using this parameter because it can lead to increased interruptions.
export const SPOT_INSTANCE_REQUIREMENTS = {
    VCpuCount: { Min: 1, Max: 2 },
    MemoryMiB: { Max: 8192, Min: 4096 }
} as const
