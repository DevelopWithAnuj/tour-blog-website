export const formatBookingId = (id) => {
    if(!id) return '—';
    return`DRM-${String(id).slice(-8).toUpperCase()}`
}
