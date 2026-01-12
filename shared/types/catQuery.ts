export type CatOrder = "ASC" | "DESC" | "RAND";

export interface CatQuery {
    /** Number of images to return (1-100) */
    limit?: number;

    /** The page number to use when paginating (0-n) */
    page?: number;

    /** Order to return images (ASC, DESC, RAND) */
    order?: CatOrder;

    /** Only return images that have breed information (1 or 0) */
    has_breeds?: 1 | 0;

    /** Comma-delimited string of breed IDs, e.g. "beng,abys" */
    breed_ids?: string;

    /** Comma-delimited string of category IDs, e.g. "1,5,14" */
    category_ids?: string;

    /** Filter by sub_id used when uploading */
    sub_id?: string;
}
