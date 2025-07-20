export interface ImageData {
    cropped: boolean;
    cropping: boolean;
    loaded: boolean;
    name: string;
    previousUrl: string;
    type: string;
    url: string;
}

export type DataAction = 'restore' | 'remove' | 'clear' | 'crop';