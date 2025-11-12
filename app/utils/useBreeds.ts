export function useBreeds() {
    const {
        data: breeds,
        pending,
        error,
    } = useFetch("/api/breeds", {
        lazy: true,
        default: () => [],
    });

    return { breeds, pending, error };
}
