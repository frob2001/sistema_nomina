using Microsoft.EntityFrameworkCore;
using webapi.Models;
using Microsoft.AspNetCore.Cors; // Borrar !!!
using Microsoft.Extensions.DependencyInjection; //Borrar !!!
using LearningCqrs.Core.Swagger;
using webapi.Controllers;
using Azure.Identity;
using Microsoft.Extensions.Azure;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Identity.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddDbContext<KattionDataBaseContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DB_CONNECTION_STRING")));

// Todo esto hay que borrar !!!
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", builder =>
    {
        builder
            .WithOrigins("https://localhost:5173", "https://kattionapp.azurewebsites.net") // Agregar la nueva URL aquí
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddMicrosoftIdentityWebApiAuthentication(builder.Configuration, "AzureAd");


builder.Services.AddControllers()
    .AddNewtonsoftJson(options =>
    {
        options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore;
    });
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddSwaggerGenNewtonsoftSupport();
builder.Services.AddSwaggerGen(opt => opt.DocumentFilter<JsonPatchDocumentFilter>());

builder.Services.AddAzureClients(clientBuilder =>
{
    clientBuilder.AddBlobServiceClient(builder.Configuration.GetConnectionString("AzureBlobStorage"), preferMsi: true);
    clientBuilder.AddQueueServiceClient(builder.Configuration.GetConnectionString("AzureQueueStorage"), preferMsi: true);
});



var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseSwagger();
app.UseSwaggerUI();

// Activa HTTP la authenticacion y autorizaci�n
app.UseHttpsRedirection();



app.UseAuthentication();
app.UseAuthorization();

app.UseCors("CorsPolicy");

app.MapControllers();

app.Run();
