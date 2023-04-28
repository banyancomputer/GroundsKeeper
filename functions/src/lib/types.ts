export interface Bucket {
    // Metadata
    id: string;
    name: string;
    owner: string;
    apiKey: string;
    createdAt: Date;
    updatedAt: Date;

    // Data
    rootCid: string;
    rootKey: string;
}