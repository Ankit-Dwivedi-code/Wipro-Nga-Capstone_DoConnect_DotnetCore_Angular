using System.Security.Claims;
using BCrypt.Net;
using DoConnect.Api.Contracts.Users;
using DoConnect.Api.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DoConnect.Api.Controllers
{
    [ApiController]
    [Route("api/users/me")]
    [Authorize]
    public class UsersMeController : ControllerBase
    {
        private readonly AppDbContext _db;
        public UsersMeController(AppDbContext db) { _db = db; }

        [HttpPut]
        public async Task<IActionResult> UpdateMe([FromBody] UpdateProfileRequest dto, CancellationToken ct)
        {
            var uidStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (uidStr is null) return Unauthorized();

            var uid = Guid.Parse(uidStr);
            var user = await _db.Users.FirstAsync(u => u.Id == uid, ct);

            // Unique checks when changed
            if (!string.Equals(user.Username, dto.Username, StringComparison.OrdinalIgnoreCase) &&
                await _db.Users.AnyAsync(u => u.Username == dto.Username && u.Id != uid, ct))
                return BadRequest(new { message = "Username already taken" });

            if (!string.Equals(user.Email, dto.Email, StringComparison.OrdinalIgnoreCase) &&
                await _db.Users.AnyAsync(u => u.Email == dto.Email && u.Id != uid, ct))
                return BadRequest(new { message = "Email already in use" });

            // Optional password change
            if (!string.IsNullOrWhiteSpace(dto.NewPassword))
            {
                if (string.IsNullOrWhiteSpace(dto.CurrentPassword) ||
                    !BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
                    return BadRequest(new { message = "Current password is incorrect" });

                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            }

            user.Username = dto.Username;
            user.Email = dto.Email;
            await _db.SaveChangesAsync(ct);

            return Ok(new
            {
                message = "Profile updated",
                user = new
                {
                    user.Id,
                    user.Username,
                    user.Email,
                    user.Role,
                    user.CreatedAt
                }
            });
        }
    }
}
