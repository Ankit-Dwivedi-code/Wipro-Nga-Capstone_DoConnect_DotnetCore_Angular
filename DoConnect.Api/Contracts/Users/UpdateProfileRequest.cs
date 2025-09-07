using System.ComponentModel.DataAnnotations;

namespace DoConnect.Api.Contracts.Users
{
    public class UpdateProfileRequest
    {
        [Required, MinLength(3), MaxLength(30)]
        public string Username { get; set; } = default!;

        [Required, EmailAddress]
        public string Email { get; set; } = default!;

        public string? CurrentPassword { get; set; }

        [MinLength(8)]
        public string? NewPassword { get; set; }
    }
}
