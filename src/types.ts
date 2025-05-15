// src/types.ts
export interface ComponentData {
    name: string;
    lightIntensity: number;
    numOfLights: number;
    isLightOn: boolean;
    autoOn: string;
    autoOff: string;
    usage: number[];
    element?: HTMLElement;
}

export interface ComponentsDataRecord {
    [key: string]: ComponentData;
}

export interface WiFiConnection {
    id: number;
    wifiName: string;
    signal: 'excellent' | 'good' | 'moderate' | 'poor';
}

export interface NotificationOptions {
    message: string;
    position: InsertPosition;
    container: HTMLElement;
}

// Add strict types for DOM elements
export type LightSwitchElement = HTMLButtonElement & {
    dataset: {
        lightOn?: string;
    };
};

export type LightSliderElement = HTMLInputElement & {
    value: string;
};

// New interfaces for the WiFi functionality
export interface WifiState {
    isActive: boolean;
    currentConnection: WiFiConnection | null;
    availableConnections: WiFiConnection[];
}