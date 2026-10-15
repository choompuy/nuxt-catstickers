export type CatOrder = "ASC" | "DESC" | "RANDOM";

export interface CatQuery {
    /** Maximum number of results to return (1-100, default 10) */
    limit?: number;

    /** Zero-based page index */
    page?: number;

    /** Sort order of the results */
    order?: CatOrder;

    /** Filter images by species identifier */
    species_id?: string;

    /** Comma-separated list of breed groups to include in the response */
    breed_groups?: string;

    /** Comma-separated list of breed groups to exclude from the response */
    exclude_breed_groups?: string;

    /** Return translated fields when available for the requested language code */
    lang?: string;

    /** Filter to images that have breed metadata */
    has_breeds?: boolean;

    /** Include breed information in the response */
    include_breeds?: boolean;

    /** Include category information in the response */
    include_categories?: boolean;

    /** Return images belonging to this account */
    account_id?: string;

    /** Filter results by breed identifier */
    breed_id?: string;

    /** Filter results by one or more comma-separated breed identifiers */
    breed_ids?: string;

    /** Filter images by a single colour/pattern variant identifier */
    colour_id?: string;

    /** Filter images by one or more comma-separated colour/pattern variant identifiers */
    colour_ids?: string;

    /** Filter images by registry colour/pattern code, e.g. "b 22" for FIFe colourpoints */
    colour_code?: string;

    /** Filter to images that have a registered colour/pattern variant */
    has_colours?: boolean;

    /** Include colour/pattern variant information in the response */
    include_colours?: boolean;

    /** Minimum pet age at time of photo, in months */
    age_months_min?: number;

    /** Maximum pet age at time of photo, in months */
    age_months_max?: number;

    /** Filter results by sub identifier */
    sub_id?: string;

    /** Field to order results by (e.g. created_at, sub_id, breeds, id) */
    order_by?: string;
}
