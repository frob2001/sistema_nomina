using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Azure.Storage.Sas;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using webapi.Models;
using static webapi.Controllers.ConexionLogoesController;

namespace webapi.Controllers
{
    [Route("ConexionLogo")]
    [ApiController]
    public class ConexionLogoesController : ControllerBase
    {
        private readonly KattionDataBaseContext _context;
        private readonly BlobServiceClient _blobServiceClient;

        public ConexionLogoesController(KattionDataBaseContext context, IConfiguration configuration)
        {
            _context = context;
            string connectionString = configuration.GetConnectionString("AzureBlobStorage");
            _blobServiceClient = new BlobServiceClient(connectionString);
        }

        public class LogoDto
        {
            public int MarcaId { get; set; }
            public IFormFile Archivo { get; set; }
        }

        private string GenerateSasUrl(BlobClient blobClient)
        {
            var sasBuilder = new BlobSasBuilder
            {
                BlobContainerName = blobClient.BlobContainerName,
                BlobName = blobClient.Name,
                Resource = "b",
                StartsOn = DateTimeOffset.UtcNow,
                ExpiresOn = DateTimeOffset.UtcNow.AddHours(1)
            };

            sasBuilder.SetPermissions(BlobSasPermissions.Read);

            var sasToken = blobClient.GenerateSasUri(sasBuilder).Query;
            return $"{blobClient.Uri}{sasToken}";
        }

        [HttpGet("{id}")]
        public async Task<ActionResult> GetConexionLogo(int id)
        {
            var conexionLogo = await _context.ConexionLogos.FindAsync(id);

            if (conexionLogo == null)
            {
                return NotFound("No se encontró el logo de conexión con el ID proporcionado.");
            }

            var rutaBlob = $"signo{conexionLogo.MarcaId}/{conexionLogo.NombreArchivo}";
            var blobClient = _blobServiceClient.GetBlobContainerClient("signo").GetBlobClient(rutaBlob);

            // Verificar si el Blob existe
            if (!await blobClient.ExistsAsync())
            {
                return NotFound("El archivo Blob asociado no existe.");
            }

            var sasUrl = GenerateSasUrl(blobClient);

            var response = new
            {
                MarcaId = conexionLogo.MarcaId,
                NombreArchivo = conexionLogo.NombreArchivo,
                UrlAcceso = sasUrl
            };

            return Ok(response);
        }

        [HttpPost]
        public async Task<ActionResult<ConexionLogo>> PostConexionLogo([FromForm] LogoDto logoDto)
        {
            if (_context.ConexionLogos == null)
            {
                return Problem("Entity set 'KattionDataBaseContext.ConexionLogos' is null.");
            }

            await DeleteExistingBlob(logoDto.MarcaId, "signo");

            var contenedorNombre = "signo";
            var contenedorClient = _blobServiceClient.GetBlobContainerClient(contenedorNombre);
            if (!await contenedorClient.ExistsAsync())
            {
                await contenedorClient.CreateAsync();
            }

            var rutaBlob = $"signo{logoDto.MarcaId}/";
            var nombreArchivoOriginal = Path.GetFileName(logoDto.Archivo.FileName);
            var nombreBlob = $"{rutaBlob}{nombreArchivoOriginal}";
            var blobClient = contenedorClient.GetBlobClient(nombreBlob);

            await using (var stream = logoDto.Archivo.OpenReadStream())
            {
                string extension = Path.GetExtension(logoDto.Archivo.FileName).ToLowerInvariant();
                string contentType;

                switch (extension)
                {
                    case ".jpg":
                    case ".jpeg":
                        contentType = "image/jpeg";
                        break;
                    case ".png":
                        contentType = "image/png";
                        break;
                    case ".svg":
                        contentType = "image/svg+xml";
                        break;
                    default:
                        return BadRequest("Formato de archivo no soportado.");
                }

                var blobHttpHeaders = new BlobHttpHeaders { ContentType = contentType };
                await blobClient.UploadAsync(stream, new BlobUploadOptions { HttpHeaders = blobHttpHeaders });
            }


            var conexionLogo = new ConexionLogo
            {
                MarcaId = logoDto.MarcaId,
                NombreArchivo = nombreArchivoOriginal,
            };

            _context.ConexionLogos.Add(conexionLogo);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetConexionLogo", new { id = conexionLogo.MarcaId }, conexionLogo);
        }

        private async Task<bool> DeleteExistingBlob(int marcaId, string contenedorNombre)
        {
            var conexionLogoExistente = await _context.ConexionLogos.FirstOrDefaultAsync(c => c.MarcaId == marcaId);
            if (conexionLogoExistente != null)
            {
                var contenedorClient = _blobServiceClient.GetBlobContainerClient(contenedorNombre);
                var blobClient = contenedorClient.GetBlobClient(conexionLogoExistente.NombreArchivo);
                await blobClient.DeleteIfExistsAsync();
                return true;
            }
            return false;
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteConexionLogo(int id)
        {
            if (_context.ConexionLogos == null)
            {
                return NotFound("Entity set 'KattionDataBaseContext.ConexionLogos' is null.");
            }

            var conexionLogo = await _context.ConexionLogos.FindAsync(id);
            if (conexionLogo == null)
            {
                return NotFound();
            }

            // Eliminar el blob de Azure Blob Storage
            var contenedorNombre = "signo";
            var contenedorClient = _blobServiceClient.GetBlobContainerClient(contenedorNombre);
            var blobClient = contenedorClient.GetBlobClient(conexionLogo.NombreArchivo);

            await blobClient.DeleteIfExistsAsync();

            // Eliminar el registro de la base de datos
            _context.ConexionLogos.Remove(conexionLogo);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ConexionLogoExists(int id)
        {
            return (_context.ConexionLogos?.Any(e => e.MarcaId == id)).GetValueOrDefault();
        }
    }
}
