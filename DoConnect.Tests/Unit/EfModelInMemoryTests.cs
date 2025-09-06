// Using C# 13.0 features
// Here we define unit tests for Entity Framework Core models using an in-memory database. The tests    verify that we can insert and relate User, Question, and Answer entities correctly.

using System.Threading.Tasks;
using DoConnect.Api.Data;
using DoConnect.Api.Models;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace DoConnect.Tests.Unit
{
    public class EfModelInMemoryTests
    {
        private static AppDbContext CreateInMemory()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: "DoConnect_Unit_" + System.Guid.NewGuid())
                .Options;
            return new AppDbContext(options);
        }

        [Fact]
        public async Task Can_Insert_User_Question_Answer_Graph()
        {
            await using var db = CreateInMemory();

            var user = new User { Username = "u", Email = "u@e.com", PasswordHash = "hash" };
            var q = new Question { Title = "T", Text = "Text", User = user };
            var a = new Answer { Text = "Answer", Question = q, User = user };
            db.AddRange(user, q, a);

            await db.SaveChangesAsync();

            (await db.Users.CountAsync()).Should().Be(1);
            (await db.Questions.CountAsync()).Should().Be(1);
            (await db.Answers.CountAsync()).Should().Be(1);
        }
    }
}
