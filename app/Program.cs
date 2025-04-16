using Microsoft.AspNetCore.Mvc;
using OpenAI_API;
using OpenAI_API.Chat;
using Stripe;
using Stripe.Checkout;
using System.IO;
using iTextSharp.text;
using iTextSharp.text.pdf;
using Microsoft.AspNetCore.StaticFiles;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure Stripe
StripeConfiguration.ApiKey = builder.Configuration["Stripe:SecretKey"];

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
    {
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");
app.UseAuthorization();

// Ensure documents directory exists
var documentsPath = Path.Combine(Directory.GetCurrentDirectory(), "Documents");
Directory.CreateDirectory(documentsPath);

// Document types
var documentTypes = new Dictionary<string, string>
{
    { "nda", "Non-Disclosure Agreement (NDA)" },
    { "terms", "Website Terms of Service" },
    { "privacy", "Privacy Policy" },
    { "contract", "Freelance Contract" },
    { "employee", "Employment Agreement" },
    { "partnership", "Partnership Agreement" }
};

// API Endpoints
app.MapPost("/create-checkout-session", async ([FromForm] IFormCollection formData) =>
{
    try
    {
        var options = new SessionCreateOptions
        {
            PaymentMethodTypes = new List<string> { "card" },
            LineItems = new List<SessionLineItemOptions>
            {
                new SessionLineItemOptions
                {
                    PriceData = new SessionLineItemPriceDataOptions
                    {
                        Currency = "usd",
                        ProductData = new SessionLineItemPriceDataProductDataOptions
                        {
                            Name = $"Legal Document: {documentTypes.GetValueOrDefault(formData["document_type"], "Custom Document")}",
                            Description = "AI-generated legal document tailored to your business needs",
                        },
                        UnitAmount = 1999, // $19.99 in cents
                    },
                    Quantity = 1,
                },
            },
            Mode = "payment",
            SuccessUrl = $"{formData["hostUrl"]}payment-return?session_id={{CHECKOUT_SESSION_ID}}",
            CancelUrl = formData["hostUrl"],
            Metadata = new Dictionary<string, string>
            {
                { "form_data", System.Text.Json.JsonSerializer.Serialize(formData) }
            }
        };

        var service = new SessionService();
        var session = await service.CreateAsync(options);

        return Results.Ok(new { sessionId = session.Id });
    }
    catch (StripeException e)
    {
        return Results.BadRequest(new { error = e.Message });
    }
});

app.MapGet("/payment-success", async (string session_id) =>
{
    try
    {
        var service = new SessionService();
        var session = await service.GetAsync(session_id);

        var formData = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, string>>(session.Metadata["form_data"]);

        var documentResult = await GenerateDocument(formData);

        if (documentResult.ContainsKey("success") && (bool)documentResult["success"])
        {
            return Results.Ok(documentResult);
        }
        else
        {
            return Results.BadRequest(documentResult);
        }
    }
    catch (StripeException e)
    {
        return Results.BadRequest(new { error = e.Message });
    }
});

app.MapGet("/download/{filename}", (string filename) =>
{
    var filePath = Path.Combine(Directory.GetCurrentDirectory(), "Documents", filename);
    if (!File.Exists(filePath))
    {
        return Results.NotFound();
    }

    var provider = new FileExtensionContentTypeProvider();
    if (!provider.TryGetContentType(filePath, out var contentType))
    {
        contentType = "application/octet-stream";
    }

    return Results.File(filePath, contentType, Path.GetFileName(filePath));
});

app.MapGet("/health", () =>
{
    try
    {
        var service = new AccountService();
        service.Get("self");

        return Results.Ok(new
        {
            status = "healthy",
            timestamp = DateTime.Now.ToString("o")
        });
    }
    catch (Exception e)
    {
        return Results.Problem(detail: e.Message, statusCode: 500);
    }
});

async Task<Dictionary<string, object>> GenerateDocument(Dictionary<string, string> formData)
{
    try
    {
        var documentType = formData.GetValueOrDefault("document_type");
        var businessName = formData.GetValueOrDefault("business_name");
        var businessType = formData.GetValueOrDefault("business_type");
        var state = formData.GetValueOrDefault("state");
        var industry = formData.GetValueOrDefault("industry");
        var protectionLevel = formData.GetValueOrDefault("protection_level", "2");

        var clauses = new List<string>();
        if (formData.ContainsKey("clause_confidentiality")) clauses.Add("Enhanced Confidentiality");
        if (formData.ContainsKey("clause_arbitration")) clauses.Add("Arbitration Provision");
        if (formData.ContainsKey("clause_termination")) clauses.Add("Advanced Termination Options");
        if (formData.ContainsKey("clause_ip")) clauses.Add("Intellectual Property Protection");

        var additionalInstructions = formData.GetValueOrDefault("additional_instructions", "");

        var prompt = $@"Generate a professional {documentTypes.GetValueOrDefault(documentType, "legal document")} for {businessName}, a {businessType} in the {industry} industry, operating in {state}.

Protection Level: {protectionLevel} out of 3

Special Clauses to Include: {(clauses.Any() ? string.Join(", ", clauses) : "None")}

Additional Instructions: {additionalInstructions}

**Formatting Guidelines:**
- Use clear section headings in bold and all caps (e.g., **TERMS AND CONDITIONS**).
- Use proper indentation and line spacing for readability.
- Ensure signature fields are properly spaced and formatted as follows:

  **Signature:** ______________________  **Date:** _______________

- Use bullet points for lists where appropriate.
- Avoid overly dense paragraphs; break them up into short, digestible sections.
- Use legal language but ensure clarity for business professionals.

Format the document professionally with appropriate sections, headings, and legal language. Include all necessary legal provisions for this type of document in {state}.";

        var openai = new OpenAIAPI(builder.Configuration["OpenAI:ApiKey"]);
        var chatRequest = new ChatRequest
        {
            Model = "gpt-4-turbo-preview",
            Messages = new List<ChatMessage>
            {
                new ChatMessage(ChatMessageRole.System, "You are a legal document generator that creates professional, legally-sound documents tailored to specific business needs and jurisdictions."),
                new ChatMessage(ChatMessageRole.User, prompt)
            },
            MaxTokens = 4000
        };

        var result = await openai.Chat.CreateChatCompletionAsync(chatRequest);
        var documentText = result.Choices[0].Message.Content;

        var uniqueId = Guid.NewGuid().ToString("N")[..8];
        var filename = $"{documentType}_{uniqueId}.pdf";
        var filepath = Path.Combine(Directory.GetCurrentDirectory(), "Documents", filename);

        CreatePdf(documentText, filepath, businessName, documentTypes.GetValueOrDefault(documentType, "Legal Document"));

        return new Dictionary<string, object>
        {
            { "success", true },
            { "download_url", $"/download/{filename}" }
        };
    }
    catch (Exception e)
    {
        return new Dictionary<string, object>
        {
            { "error", e.Message }
        };
    }
}

void CreatePdf(string text, string filepath, string businessName, string documentType)
{
    using var document = new Document(PageSize.LETTER, 72, 72, 72, 72);
    using var writer = PdfWriter.GetInstance(document, new FileStream(filepath, FileMode.Create));
    document.Open();

    // Title
    var titleFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 16, BaseColor.DARK_GRAY);
    var title = new Paragraph(documentType.ToUpper(), titleFont)
    {
        Alignment = Element.ALIGN_CENTER,
        SpacingAfter = 20f
    };
    document.Add(title);

    // Business Name
    var businessNamePara = new Paragraph($"For: {businessName}", titleFont)
    {
        Alignment = Element.ALIGN_CENTER,
        SpacingAfter = 20f
    };
    document.Add(businessNamePara);

    // Date
    var dateFont = FontFactory.GetFont(FontFactory.HELVETICA, 11, BaseColor.DARK_GRAY);
    var date = new Paragraph($"Date: {DateTime.Now:MMMM dd, yyyy}", dateFont)
    {
        Alignment = Element.ALIGN_RIGHT,
        SpacingAfter = 20f
    };
    document.Add(date);

    // Content
    var normalFont = FontFactory.GetFont(FontFactory.HELVETICA, 11);
    var headerFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 13, BaseColor.DARK_GRAY);

    var paragraphs = text.Split('\n');
    foreach (var para in paragraphs)
    {
        if (string.IsNullOrWhiteSpace(para)) continue;

        if (para.Trim().StartsWith('#') || (para.Trim().All(char.IsUpper) && para.Trim().Length > 3))
        {
            var headerText = para.Trim().TrimStart('#').Trim();
            var header = new Paragraph(headerText, headerFont)
            {
                SpacingBefore = 15f,
                SpacingAfter = 10f
            };
            document.Add(header);
        }
        else if (para.Trim().StartsWith("•") || para.Trim().StartsWith("-") || para.Trim().StartsWith("*"))
        {
            var listItem = new Paragraph(para.Trim(), normalFont)
            {
                IndentationLeft = 30,
                FirstLineIndent = 0,
                SpacingBefore = 3f,
                SpacingAfter = 3f
            };
            document.Add(listItem);
        }
        else if (para.ToLower().Contains("signature") || para.ToLower().Contains("sign") || para.ToLower().Contains("date:"))
        {
            var sigPara = new Paragraph(para, normalFont)
            {
                SpacingBefore = 15f,
                SpacingAfter = 15f
            };
            document.Add(sigPara);
        }
        else
        {
            var normalPara = new Paragraph(para, normalFont)
            {
                SpacingAfter = 6f
            };
            document.Add(normalPara);
        }
    }
}

app.Run();