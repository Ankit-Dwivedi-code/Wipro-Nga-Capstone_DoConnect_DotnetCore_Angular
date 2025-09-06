using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using DoConnect.Api.Options;
using Microsoft.Extensions.Options;

namespace DoConnect.Api.Services
{
    public class GroqAiService
    {
        private readonly HttpClient _http;
        private readonly GroqOptions _opt;
        private static readonly JsonSerializerOptions JsonOpts = new()
        {
            PropertyNameCaseInsensitive = true
        };

        public GroqAiService(HttpClient http, IOptions<GroqOptions> opt)
        {
            _http = http;
            _opt = opt.Value;

            // Ensure base URL ends with a trailing slash and includes /openai/v1
            var baseUrl = string.IsNullOrWhiteSpace(_opt.BaseUrl)
                ? "https://api.groq.com/openai/v1"
                : _opt.BaseUrl;

            if (!baseUrl.EndsWith("/")) baseUrl += "/";
            _http.BaseAddress = new Uri(baseUrl);

            if (!string.IsNullOrWhiteSpace(_opt.ApiKey))
            {
                _http.DefaultRequestHeaders.Authorization =
                    new AuthenticationHeaderValue("Bearer", _opt.ApiKey);
            }
        }

        // Minimal models to deserialize non-streaming response
        private sealed class ChatReq
        {
            public string model { get; set; } = default!;
            public object[] messages { get; set; } = default!;
            public int? max_tokens { get; set; }
            public float? temperature { get; set; }
            public bool stream { get; set; } = false;
        }

        private sealed class ChatRes
        {
            public string id { get; set; } = "";
            public string model { get; set; } = "";
            public List<Choice> choices { get; set; } = new();

            public sealed class Choice
            {
                public Message message { get; set; } = new();

                public sealed class Message
                {
                    public string role { get; set; } = "";
                    public string content { get; set; } = "";
                }
            }
        }

        public async Task<(string answer, string model, string id)> AskAsync(
            string question,
            string? context,
            string? userName,
            CancellationToken ct)
        {
            var sys = string.IsNullOrWhiteSpace(_opt.SystemPrompt)
                ? "You are a helpful assistant."
                : _opt.SystemPrompt!;

            var content = string.IsNullOrWhiteSpace(context)
                ? question
                : $"{question}\n\n[Extra context]\n{context}";

            var body = new ChatReq
            {
                model = string.IsNullOrWhiteSpace(_opt.Model) ? "llama-3.3-70b-versatile" : _opt.Model,
                max_tokens = _opt.MaxTokens,
                temperature = _opt.Temperature,
                messages = new object[]
                {
                    new { role = "system", content = sys },
                    new { role = "user", content = content }
                }
            };

            using var json = new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json");

            // IMPORTANT: no leading slash here (so BaseAddress path is preserved)
            using var res = await _http.PostAsync("chat/completions", json, ct);
            var txt = await res.Content.ReadAsStringAsync(ct);

            if (!res.IsSuccessStatusCode)
                throw new InvalidOperationException($"Groq returned {(int)res.StatusCode}: {txt}");

            var parsed = JsonSerializer.Deserialize<ChatRes>(txt, JsonOpts) ?? new ChatRes();
            var answer = parsed.choices.FirstOrDefault()?.message?.content?.Trim() ?? "";
            return (answer, parsed.model, parsed.id);
        }
    }
}
