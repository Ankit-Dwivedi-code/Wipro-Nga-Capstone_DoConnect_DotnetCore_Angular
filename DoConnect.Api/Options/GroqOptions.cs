namespace DoConnect.Api.Options
{
    public class GroqOptions
    {
        public string ApiKey { get; set; } = string.Empty;
        public string Model { get; set; } = "llama-3.3-70b-versatile";
        public string? SystemPrompt { get; set; }
        public int MaxTokens { get; set; } = 800;
        public float Temperature { get; set; } = 0.2f;
        public string BaseUrl { get; set; } = "https://api.groq.com/openai/v1";
    }
}
