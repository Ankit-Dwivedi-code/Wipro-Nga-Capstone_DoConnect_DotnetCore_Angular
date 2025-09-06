// Using C# 13.0 features
// Here we define the ImageFile model which represents an image file associated with either a question or an answer in the application. It includes properties for the file path, upload time, and foreign keys to link to questions or answers.

namespace DoConnect.Api.Models
{
    public class ImageFile
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Path { get; set; } = default!;   // relative like "uploads/..."
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

        public Guid? QuestionId { get; set; }
        public Question? Question { get; set; }

        public Guid? AnswerId { get; set; }
        public Answer? Answer { get; set; }
    }
}
