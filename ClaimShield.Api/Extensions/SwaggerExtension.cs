using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace ClaimShield.Api.Extensions
{
	// Adds support for IFormFile and [FromForm] bindings in Swagger UI
	public class FormFileOperationFilter : IOperationFilter
	{
		public void Apply(OpenApiOperation operation, OperationFilterContext context)
		{
			var formParams = context.MethodInfo?
				.GetParameters()
				.Where(p => p.GetCustomAttribute<FromFormAttribute>() != null)
				.ToList();

			if (formParams == null || !formParams.Any())
			{
				return;
			}

			// Remove any existing parameters that came from form bindings
			operation.Parameters ??= new List<OpenApiParameter>();
			operation.Parameters = operation.Parameters
				.Where(p => p.In != ParameterLocation.Query && p.In != ParameterLocation.Path)
				.ToList();

			var schema = new OpenApiSchema
			{
				Type = "object",
				Properties = new Dictionary<string, OpenApiSchema>()
			};

			foreach (var p in formParams)
			{
				var name = p.Name ?? "file";
				var type = p.ParameterType;

				if (type == typeof(IFormFile) || type == typeof(IFormFile[]) ||
					(type.IsGenericType && type.GetGenericTypeDefinition() == typeof(IEnumerable<>) &&
					 type.GetGenericArguments()[0] == typeof(IFormFile)))
				{
					schema.Properties[name] = new OpenApiSchema
					{
						Type = "string",
						Format = "binary"
					};
				}
				else if (type == typeof(Guid) || type == typeof(Guid?))
				{
					schema.Properties[name] = new OpenApiSchema
					{
						Type = "string",
						Format = "uuid"
					};
				}
				else if (type == typeof(int) || type == typeof(int?))
				{
					schema.Properties[name] = new OpenApiSchema
					{
						Type = "integer",
						Format = "int32"
					};
				}
				else
				{
					schema.Properties[name] = new OpenApiSchema
					{
						Type = "string"
					};
				}
			}

			operation.RequestBody = new OpenApiRequestBody
			{
				Content = new Dictionary<string, OpenApiMediaType>
				{
					["multipart/form-data"] = new OpenApiMediaType
					{
						Schema = schema
					}
				}
			};
		}
	}
}
