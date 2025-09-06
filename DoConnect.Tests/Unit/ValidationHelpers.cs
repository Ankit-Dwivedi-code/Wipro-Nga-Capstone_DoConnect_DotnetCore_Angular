// Using C# 13.0 features
// Here we define a helper class to validate objects using DataAnnotations. This is useful for unit tests to ensure that models and DTOs conform to their validation attributes.

using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace DoConnect.Tests.Unit
{
    /// <summary>
    /// Runs DataAnnotations validation on an object instance.
    /// </summary>
    public static class ValidationHelpers
    {
        public static IList<ValidationResult> ValidateObject(object instance)
        {
            var ctx = new ValidationContext(instance);
            var results = new List<ValidationResult>();
            Validator.TryValidateObject(instance, ctx, results, validateAllProperties: true);
            return results;
        }
    }
}
