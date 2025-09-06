// Here we define the data transfer objects (DTOs) for creating and outputting answers. The AnswerCreateDto is used when creating a new answer, while the AnswerOutDto is used for returning answer details in responses.

using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace DoConnect.Api.Dtos
{
    public class AnswerCreateDto
    {
        [Required, MaxLength(4000)] public string Text { get; set; } = default!;
        public List<IFormFile>? Files { get; set; }
    }

    public class AnswerOutDto
    {
        public Guid Id { get; set; }
        public string Text { get; set; } = default!;
        public string Author { get; set; } = default!;
        public string Status { get; set; } = default!;
        public DateTime CreatedAt { get; set; }
        public List<string> Images { get; set; } = new();
    }
}
