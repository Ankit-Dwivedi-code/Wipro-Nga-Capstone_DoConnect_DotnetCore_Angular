using DoConnect.Api.Contracts;
using DoConnect.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DoConnect.Api.Controllers
{
    [ApiController]
    [Route("api/ai")]
    [Authorize] // any logged-in user
    public class AiController : ControllerBase
    {
        private readonly GroqAiService _ai;
        private static readonly Dictionary<string, (int count, DateTime windowStart)> _quota = new();
        private const int MAX_PER_MINUTE = 10;

        public AiController(GroqAiService ai) { _ai = ai; }

        [HttpPost("ask")]
        public async Task<ActionResult<AskAiResponse>> Ask([FromBody] AskAiRequest req, CancellationToken ct)
        {
            // very tiny per-user rate limit to avoid abuse
            var uid = User?.Identity?.Name ?? "anon";
            lock (_quota)
            {
                if (!_quota.TryGetValue(uid, out var q) || (DateTime.UtcNow - q.windowStart) > TimeSpan.FromMinutes(1))
                    _quota[uid] = (0, DateTime.UtcNow);
                var cur = _quota[uid];
                if (cur.count >= MAX_PER_MINUTE)
                    return StatusCode(429, new { message = "Too many AI requests. Please wait a minute." });
                _quota[uid] = (cur.count + 1, cur.windowStart);
            }

            var (answer, model, id) = await _ai.AskAsync(req.Question, req.Context, uid, ct);
            return Ok(new AskAiResponse { Answer = answer, Model = model, Id = id });
        }
    }
}
