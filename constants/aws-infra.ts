export const EC2_INSTANCE_TYPE = 't2.micro'
export const EC2_INSTANCE_NAME = 'soulForgeBaseInstance'
export const EC2_PRIVATE_KEY_NAME = 'ec2-privateKey.pem'
export const EC2_PUBLIC_KEY_NAME = 'ec2-publicKey.pub'
export const SSH_KEY_NAME = 'infra-soulbound-keypair'
export const EC2_AMI_NAME = 'soulForgeBaseAmi'
export const EC2_SECURITY_GROUP_NAME = 'soulForgeSecurityGroup'

export const EC2_EXPOSED_PORTS = [22, 80, 443, 2376]

export const SSM_PARAMETER_KEYS = {
    baseAmiId: 'base-ami-id',
    baseSecurityGroup: 'base-security-group',
    baseKeyParName: 'base-key-pair-name',
    dockerSnapshotBucket: 'docker-snapshot-bucket',
    dockerRemotePassword: 'docker-remote-host-password'
}

export const MAX_CONTAINER_PER_INSTANCE = 2
