using System.ComponentModel.DataAnnotations;

namespace DoConnect.Api.Contracts
{
    public class AskAiRequest
    {
        [Required, StringLength(2000, MinimumLength = 3)]
        public string Question { get; set; } = default!;
        public string? Context { get; set; }  // optional: include page text, tags, etc.
    }

    public class AskAiResponse
    {
        public string Answer { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public string? Id { get; set; }
    }
}
