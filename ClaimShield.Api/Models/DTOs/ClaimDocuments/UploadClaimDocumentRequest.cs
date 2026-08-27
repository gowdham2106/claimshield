using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace ClaimShield.Api.Models.DTOs.ClaimDocuments
{
    public class UploadClaimDocumentRequest
    {
        [Required]
        public Guid ClaimId { get; set; }

        [Required]
        public int DocumentTypeId { get; set; }

        [Required]
        public IFormFile File { get; set; } = default!;
    }
}
