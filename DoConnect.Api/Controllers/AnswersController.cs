using DoConnect.Api.Data;
using DoConnect.Api.Dtos;
using DoConnect.Api.Models;
using DoConnect.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace DoConnect.Api.Controllers
{
    [ApiController]
    [Route("api/questions/{questionId:guid}/[controller]")]
    public class AnswersController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly ImageStorageService _store;
        public AnswersController(AppDbContext db, ImageStorageService store) { _db = db; _store = store; }

        // [Authorize]
        // [HttpPost]
        // public async Task<IActionResult> Create(Guid questionId, [FromForm] AnswerCreateDto dto)
        // {
        //     var question = await _db.Questions.FindAsync(questionId);
        //     if (question == null) return NotFound();

        //     var userId = Guid.Parse(User.FindFirst("sub")!.Value);
        //     var ans = new Answer { QuestionId = questionId, UserId = userId, Text = dto.Text };

        //     if (dto.Files?.Any() == true)
        //         ans.Images = await _store.SaveFilesAsync(dto.Files, questionId: null, answerId: ans.Id);

        //     _db.Answers.Add(ans);
        //     await _db.SaveChangesAsync();

        //     return Created("", new { ans.Id, ans.Text, ans.Status });
        // }
        [Authorize]
[HttpPost]
public async Task<IActionResult> Create(Guid questionId, [FromForm] AnswerCreateDto dto)
{
    var question = await _db.Questions.FindAsync(questionId);
    if (question == null) return NotFound();

    var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
    if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();
    var userId = Guid.Parse(userIdStr);

    //  IMPORTANT: give the Answer a real Id BEFORE saving files
    var ans = new Answer
    {
        Id = Guid.NewGuid(),
        QuestionId = questionId,
        UserId = userId,
        Text = dto.Text,
        Status = ApproveStatus.Pending,
        CreatedAt = DateTime.UtcNow
    };

    _db.Answers.Add(ans);

    if (dto.Files?.Any() == true)
    {
        // images will carry AnswerId = ans.Id (non-empty)
        var imgs = await _store.SaveFilesAsync(dto.Files, questionId: null, answerId: ans.Id);
        ans.Images = imgs;
        // _db.Images.AddRange(imgs);
    }

    await _db.SaveChangesAsync();

    return Created("", new { ans.Id, ans.Text, ans.Status });
}


        [HttpGet]
        public async Task<IActionResult> List(Guid questionId)
        {
            var isAdmin = User.IsInRole(RoleType.Admin.ToString());
            var q = _db.Answers
                .Include(a => a.User)
                .Include(a => a.Images)
                .Where(a => a.QuestionId == questionId);

            if (!isAdmin) q = q.Where(a => a.Status == ApproveStatus.Approved);

            var res = await q.OrderBy(a => a.CreatedAt).ToListAsync();
            return Ok(res.Select(a => new AnswerOutDto
            {
                Id = a.Id,
                Text = a.Text,
                Author = a.User.Username,
                Status = a.Status.ToString(),
                CreatedAt = a.CreatedAt,
                Images = a.Images.Select(i => "/" + i.Path).ToList()
            }));
        }
    }
}
