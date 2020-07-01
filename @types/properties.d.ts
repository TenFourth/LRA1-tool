export interface SerialProperties {
    path: string,
    baudrate: number
}

export interface DeviceProperties {
    gps: SerialProperties,
    lora: SerialProperties
}

export interface appProperties {
    device: DeviceProperties,
    savePath: string
}
