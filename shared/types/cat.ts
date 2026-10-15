export interface Category {
    name: string;
    species_id: string;
    id: string;
}

export interface Colour {
    id: string;
    species_id: string;
    breed_id?: string;
    code: string;
    name: string;
    base_colour: string;
    pattern: string;
    standard: string;
    description?: string;
}

export interface Review {
    approved: boolean;
    public: boolean;
    pending: boolean;
    rejected: boolean;
    flagged: boolean;
    is_portrait: boolean;
}

export interface CatExpansion {
    indoor: boolean;
    lap: boolean;
    adaptability: number;
    affection_level: number;
    child_friendly: number;
    cat_friendly: number;
    dog_friendly: number;
    energy_level: number;
    grooming: number;
    health_issues: number;
    intelligence: number;
    shedding_level: number;
    social_needs: number;
    stranger_friendly: number;
    vocalisation: number;
    experimental: boolean;
    hairless: boolean;
    natural: boolean;
    rare: boolean;
    rex: boolean;
    suppressed_tail: boolean;
    short_legs: boolean;
    hypoallergenic: boolean;
    cfa_url?: string;
    vetstreet_url?: string;
    vcahospitals_url?: string;
}

export interface DogExpansion {
    model?: string;
    male_height_inches?: string;
    male_height_cm?: string;
    female_height_inches?: string;
    female_height_cm?: string;
    male_weight_pounds?: string;
    male_weight_kg?: string;
    female_weight_pounds?: string;
    female_weight_kg?: string;
    family_friendly?: string;
    good_with_other_dogs_score?: number;
    good_with_other_dogs_context?: string;
    shedding_score?: number;
    shedding_reason?: string;
    grooming_score?: number;
    grooming_type?: string;
    daily_exercise_time_minutes?: string;
    exercise_type?: string;
    bidability_score?: number;
    bidability_characteristics?: string;
    prey_drive_score?: number;
    prey_drive_reason?: string;
    barking_score?: number;
    barking_characteristics?: string;
    language?: string;
}

export interface HorseExpansion {
    height_hands?: string;
    common_uses?: string;
    notable_traits?: string;
}

export interface Expansions {
    cat?: CatExpansion;
    dog?: DogExpansion;
    horse?: HorseExpansion;
}

export interface VenomCode {
    code: string;
    name: string;
    is_primary: boolean;
}

export interface CatBreed {
    id: string;
    name: string;
    species_id?: string;
    life_span: string | null;
    temperament: string | null;
    origin: string | null;
    country_codes: string | null;
    country_code: string | null;
    description: string | null;
    history: string | null;
    alt_names?: string;
    wikipedia_url?: string;
    reference_image_id: string | null;
    bred_for: string | null;
    perfect_for: string | null;
    breed_group: string | null;
    weight: {
        imperial: string;
        metric: string;
    } | null;
    height: {
        imperial: string;
        metric: string;
    } | null;
    indoor?: boolean;
    lap?: boolean;
    adaptability?: number;
    affection_level?: number;
    child_friendly?: number;
    cat_friendly?: number;
    dog_friendly?: number;
    energy_level?: number;
    grooming?: number;
    health_issues?: number;
    intelligence?: number;
    shedding_level?: number;
    social_needs?: number;
    stranger_friendly?: number;
    vocalisation?: number;
    experimental?: boolean;
    hairless?: boolean;
    natural?: boolean;
    rare?: boolean;
    rex?: boolean;
    suppressed_tail?: boolean;
    short_legs?: boolean;
    hypoallergenic?: boolean;
    cfa_url?: string;
    vetstreet_url?: string;
    vcahospitals_url?: string;
    male_height_inches?: string;
    male_height_cm?: string;
    female_height_inches?: string;
    female_height_cm?: string;
    male_weight_pounds?: string;
    male_weight_kg?: string;
    female_weight_pounds?: string;
    female_weight_kg?: string;
    family_friendly?: string;
    good_with_other_dogs_score?: number;
    good_with_other_dogs_context?: string;
    shedding_score?: number;
    shedding_reason?: string;
    grooming_score?: number;
    grooming_type?: string;
    daily_exercise_time_minutes?: string;
    exercise_type?: string;
    bidability_score?: number;
    bidability_characteristics?: string;
    prey_drive_score?: number;
    prey_drive_reason?: string;
    barking_score?: number;
    barking_characteristics?: string;
    language?: string;
    expansions?: Expansions;
    image: {
        species_id: string;
        id: string;
        url: string;
        width: number;
        height: number;
    } | null;
    venom_codes?: VenomCode[];
}

export interface Cat {
    species_id: string;
    id: string;
    url: string;
    width: number;
    height: number;
    sub_id?: string;
    breeds?: CatBreed[];
    categories?: Category[];
    colours?: Colour[];
    tags?: string[];
    age_months?: number;
    unsafe_reasons?: string[];
    created_at?: string;
    credit_name?: string;
    credit_url?: string;
    review?: Review;
    childImages?: unknown[];
}
