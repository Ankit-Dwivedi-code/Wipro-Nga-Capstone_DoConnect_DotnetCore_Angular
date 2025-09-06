// Using C# 13.0 features
// Here we define the AppDbContext which manages the database context for the application using Entity Framework Core. It includes DbSet properties for Users, Questions, Answers, and Images, and configures entity relationships and constraints.

using DoConnect.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace DoConnect.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users => Set<User>();
        public DbSet<Question> Questions => Set<Question>();
        public DbSet<Answer> Answers => Set<Answer>();
        public DbSet<ImageFile> Images => Set<ImageFile>();

        protected override void OnModelCreating(ModelBuilder b)
        {
            base.OnModelCreating(b);

            // USERS
            b.Entity<User>(e =>
            {
                e.Property(x => x.Username).HasMaxLength(30).IsRequired();
                e.Property(x => x.Email).HasMaxLength(128).IsRequired();
                e.Property(x => x.PasswordHash).HasMaxLength(256).IsRequired();
                e.HasIndex(u => u.Username).IsUnique();
                e.HasIndex(u => u.Email).IsUnique();
            });

            // QUESTIONS
            b.Entity<Question>(e =>
            {
                e.Property(x => x.Title).HasMaxLength(120).IsRequired();
                e.Property(x => x.Text).HasMaxLength(4000).IsRequired();
                e.Property(x => x.Status).HasMaxLength(20).IsRequired();
                e.HasOne(q => q.User)
                    .WithMany(u => u.Questions)
                    .HasForeignKey(q => q.UserId)
                    .OnDelete(DeleteBehavior.Restrict);

                e.HasIndex(x => x.UserId);
                e.HasIndex(x => x.CreatedAt);
            });

            // ANSWERS
            b.Entity<Answer>(e =>
            {
                e.Property(x => x.Text).HasMaxLength(4000).IsRequired();
                e.Property(x => x.Status).HasMaxLength(20).IsRequired();

                e.HasOne(a => a.User)
                    .WithMany(u => u.Answers)
                    .HasForeignKey(a => a.UserId)
                    .OnDelete(DeleteBehavior.Restrict);

                e.HasOne(a => a.Question)
                    .WithMany(q => q.Answers)
                    .HasForeignKey(a => a.QuestionId)
                    .OnDelete(DeleteBehavior.Cascade);

                e.HasIndex(x => new { x.QuestionId, x.UserId });
                e.HasIndex(x => x.CreatedAt);
            });

            // IMAGES
            b.Entity<ImageFile>(e =>
            {
                e.Property(x => x.Path).HasMaxLength(256).IsRequired();

                // Prevent multiple cascade paths: Question -> Images should NOT cascade
                e.HasOne(i => i.Question)
                    .WithMany(q => q.Images)
                    .HasForeignKey(i => i.QuestionId)
                    .OnDelete(DeleteBehavior.Restrict);

                e.HasOne(i => i.Answer)
                    .WithMany(a => a.Images)
                    .HasForeignKey(i => i.AnswerId)
                    .OnDelete(DeleteBehavior.Cascade);

                e.HasIndex(x => x.QuestionId);
                e.HasIndex(x => x.AnswerId);

                // Either QuestionId or AnswerId must be provided
                e.HasCheckConstraint("CK_Image_Target",
                    "([QuestionId] IS NOT NULL OR [AnswerId] IS NOT NULL)");
            });
        }
    }
}
