using DoConnect.Api.Data;
using DoConnect.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DoConnect.Api.Controllers
{
    [ApiController]
    [Route("api/admin")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _db;
        public AdminController(AppDbContext db) { _db = db; }

        [HttpPost("questions/{id:guid}/approve")]
        public async Task<IActionResult> ApproveQuestion(Guid id)
        {
            var q = await _db.Questions.FindAsync(id);
            if (q == null) return NotFound();
            q.Status = ApproveStatus.Approved;
            await _db.SaveChangesAsync();
            return Ok(new { q.Id, q.Status });
        }

        [HttpPost("questions/{id:guid}/reject")]
        public async Task<IActionResult> RejectQuestion(Guid id)
        {
            var q = await _db.Questions.FindAsync(id);
            if (q == null) return NotFound();
            q.Status = ApproveStatus.Rejected;
            await _db.SaveChangesAsync();
            return Ok(new { q.Id, q.Status });
        }

        [HttpPost("answers/{id:guid}/approve")]
        public async Task<IActionResult> ApproveAnswer(Guid id)
        {
            var a = await _db.Answers.FindAsync(id);
            if (a == null) return NotFound();
            a.Status = ApproveStatus.Approved;
            await _db.SaveChangesAsync();
            return Ok(new { a.Id, a.Status });
        }

        [HttpPost("answers/{id:guid}/reject")]
        public async Task<IActionResult> RejectAnswer(Guid id)
        {
            var a = await _db.Answers.FindAsync(id);
            if (a == null) return NotFound();
            a.Status = ApproveStatus.Rejected;
            await _db.SaveChangesAsync();
            return Ok(new { a.Id, a.Status });
        }

        // [HttpDelete("questions/{id:guid}")]
        // public async Task<IActionResult> DeleteQuestion(Guid id)
        // {
        //     var q = await _db.Questions.Include(x => x.Answers).FirstOrDefaultAsync(x => x.Id == id);
        //     if (q == null) return NotFound();
        //     _db.Questions.Remove(q);
        //     await _db.SaveChangesAsync();
        //     return NoContent();
        // }
        [HttpDelete("questions/{id:guid}")]
        public async Task<IActionResult> DeleteQuestion(Guid id)
        {
            var q = await _db.Questions
                .Include(x => x.Images)                         // images attached to the question
                .Include(x => x.Answers)
                    .ThenInclude(a => a.Images)                 // images attached to each answer
                .FirstOrDefaultAsync(x => x.Id == id);

            if (q == null) return NotFound();

            // 1) delete images of answers
            var answerImages = q.Answers.SelectMany(a => a.Images).ToList();
            if (answerImages.Count > 0) _db.Images.RemoveRange(answerImages);

            // 2) delete images of the question
            if (q.Images?.Count > 0) _db.Images.RemoveRange(q.Images);

            // 3) delete answers
            if (q.Answers?.Count > 0) _db.Answers.RemoveRange(q.Answers);

            // 4) delete question
            _db.Questions.Remove(q);

            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}
