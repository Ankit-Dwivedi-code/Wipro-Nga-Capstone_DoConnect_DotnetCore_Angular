// Using C# 13.0 features
// JwtTokenService creates JWTs and now includes Name + multiple Email/Role claims
// so /api/Auth/me (and your frontend) can always read them reliably.

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using DoConnect.Api.Models;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace DoConnect.Api.Services
{
    public class JwtSettings
    {
        public string Key { get; set; } = default!;
        public string Issuer { get; set; } = default!;
        public string Audience { get; set; } = default!;
        public int ExpiresMinutes { get; set; } = 120;
    }

    public class JwtTokenService
    {
        private readonly JwtSettings _cfg;
        public JwtTokenService(IOptions<JwtSettings> cfg) => _cfg = cfg.Value;

        public (string token, DateTime expires) Create(User user)
        {
            var claims = new List<Claim>
            {
                // IDs
                new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new(ClaimTypes.NameIdentifier, user.Id.ToString()),

                // Name (in multiple common types)
                new(ClaimTypes.Name, user.Username),
                new(JwtRegisteredClaimNames.UniqueName, user.Username),

                // Email (in multiple common types)
                new(JwtRegisteredClaimNames.Email, user.Email),
                new(ClaimTypes.Email, user.Email),
                new("email", user.Email),

                // Role (in multiple common types)
                new(ClaimTypes.Role, user.Role.ToString()),
                new("role", user.Role.ToString())
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_cfg.Key));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var now = DateTime.UtcNow;
            var expires = now.AddMinutes(_cfg.ExpiresMinutes);

            var token = new JwtSecurityToken(
                issuer: _cfg.Issuer,
                audience: _cfg.Audience,
                claims: claims,
                notBefore: now,
                expires: expires,
                signingCredentials: creds
            );

            return (new JwtSecurityTokenHandler().WriteToken(token), expires);
        }
    }
}
