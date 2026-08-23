namespace ClaimShield.Api.Models.DTOs.Claims
{
    // Deliberately minimal - this is served from an [AllowAnonymous]
    // endpoint, so it must NEVER include customer name, contact
    // details, full policy/vehicle numbers, or financial amounts.
    // Just enough for someone with the exact claim number to see its
    // status, matching a typical "track your order" pattern.
    public class PublicClaimTrackingDto
    {
        public string ClaimNumber { get; set; } = string.Empty;

        public string StatusName { get; set; } = string.Empty;

        public DateTime IncidentDate { get; set; }

        // Last 4 characters only - enough to help someone confirm
        // "yes, that's my vehicle" without exposing the full plate.
        public string? VehicleRegistrationMasked { get; set; }
    }
}