// Here we define the data transfer objects (DTOs) for user registration and login. The RegisterDto is used for user registration, while the LoginDto is used for user login.

using System.ComponentModel.DataAnnotations;

namespace DoConnect.Api.Dtos
{
    public class RegisterDto
    {
        [Required, MaxLength(40)] public string Username { get; set; } = default!;
        [Required, EmailAddress] public string Email { get; set; } = default!;
        [Required, MinLength(6)] public string Password { get; set; } = default!;
    }

    public class LoginDto
    {
        [Required] public string UsernameOrEmail { get; set; } = default!;
        [Required] public string Password { get; set; } = default!;
    }
}
