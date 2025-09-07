// AuthController: returns email in login/register responses and reads /me
// using multiple possible claim types for robustness.

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using DoConnect.Api.Data;
using DoConnect.Api.Dtos;
using DoConnect.Api.Models;
using DoConnect.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DoConnect.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly JwtTokenService _jwt;

        public AuthController(AppDbContext db, JwtTokenService jwt)
        {
            _db = db; _jwt = jwt;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            if (await _db.Users.AnyAsync(u => u.Username == dto.Username || u.Email == dto.Email))
                return Conflict(new { message = "Username or email already exists" });

            var user = new User
            {
                Username = dto.Username,
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = RoleType.User
            };
            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            var (token, expires) = _jwt.Create(user);

            return Ok(new
            {
                token,
                expires,
                user = new { user.Id, user.Username, user.Email, role = user.Role.ToString() }
            });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var user = await _db.Users
                .FirstOrDefaultAsync(u => u.Username == dto.UsernameOrEmail || u.Email == dto.UsernameOrEmail);

            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                return Unauthorized(new { message = "Invalid credentials" });

            var (token, expires) = _jwt.Create(user);

            return Ok(new
            {
                token,
                expires,
                user = new { user.Id, user.Username, user.Email, role = user.Role.ToString() }
            });
        }

        [Authorize]
        [HttpGet("me")]
        public IActionResult Me()
        {
            string? Get(params string[] types)
            {
                foreach (var t in types)
                {
                    var v = User.FindFirst(t)?.Value;
                    if (!string.IsNullOrWhiteSpace(v)) return v;
                }
                return null;
            }

            var id = Get(JwtRegisteredClaimNames.Sub, ClaimTypes.NameIdentifier) ?? "";
            var username = Get(ClaimTypes.Name, JwtRegisteredClaimNames.UniqueName, "unique_name") ?? "";
            var email = Get(JwtRegisteredClaimNames.Email, ClaimTypes.Email, "email") ?? "";
            var role = Get("role", ClaimTypes.Role) ?? "";

            return Ok(new { id, username, email, role });
        }
    }
}
