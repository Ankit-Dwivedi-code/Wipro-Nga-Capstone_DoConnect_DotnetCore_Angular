// Using C# 13.0 features
// Here we define the enumerations used in the application, including RoleType for user roles and ApproveStatus for the approval status of questions and answers.
namespace DoConnect.Api.Models
{
    public enum RoleType { User = 0, Admin = 1 }
    public enum ApproveStatus { Pending = 0, Approved = 1, Rejected = 2 }
}
