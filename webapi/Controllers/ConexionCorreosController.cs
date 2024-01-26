using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using webapi.Models;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Azure.Storage.Sas;
using Microsoft.Extensions.Configuration;
using Azure.Storage.Blobs.Specialized;
using Azure.Storage;
using Microsoft.AspNetCore.Authorization;

namespace webapi.Controllers
{
    [Authorize]
    [Route("ConexionCorreo")]
    [ApiController]
    public class ConexionCorreosController : ControllerBase
    {
        private readonly KattionDataBaseContext _context;
        private readonly BlobServiceClient _blobServiceClient;

        public ConexionCorreosController(KattionDataBaseContext context, IConfiguration configuration)
        {
            _context = context;
            string connectionString = configuration.GetConnectionString("AzureBlobStorage");
            _blobServiceClient = new BlobServiceClient(connectionString);
        }

        public class CorreoDto
        {
            public required string TablaConexion { get; set; }
            public int IdConexion { get; set; }
            public DateTime Fecha { get; set; }
            public required string Titulo { get; set; }
            public required string Descripcion { get; set; }
            public required string Usuario { get; set; }
            public required IFormFile Archivo { get; set; }
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ConexionCorreo>>> GetConexionCorreos()
        {
            if (_context.ConexionCorreos == null)
            {
                return NotFound();
            }
            return await _context.ConexionCorreos.ToListAsync();
        }

        [HttpGet("Buscar")]
        public async Task<ActionResult<IEnumerable<ConexionCorreo>>> GetConexionCorreosByParameters(string tablaConexion, int idConexion)
        {
            var conexionCorreos = await _context.ConexionCorreos
                .Where(cc => cc.TablaConexion == tablaConexion && cc.IdConexion == idConexion)
                .ToListAsync();

            if (!conexionCorreos.Any())
            {
                return NotFound("No se encontraron correos con los parámetros especificados.");
            }

            return Ok(conexionCorreos);
        }



        [HttpGet("{id}")]
        public async Task<ActionResult> GetConexionCorreo(int id)
        {
            var conexionCorreo = await _context.ConexionCorreos.FindAsync(id);

            if (conexionCorreo == null)
            {
                return NotFound();
            }

            var rutaBlob = $"{conexionCorreo.TablaConexion}{conexionCorreo.IdConexion}/{conexionCorreo.NombreCorreo}";
            var blobClient = _blobServiceClient.GetBlobContainerClient(conexionCorreo.TablaConexion).GetBlobClient(rutaBlob);
            var sasUrl = GenerateSasUrl(blobClient);

            var response = new
            {
                ConexionCorreoId = conexionCorreo.ConexionCorreoId,
                TablaConexion = conexionCorreo.TablaConexion,
                IdConexion = conexionCorreo.IdConexion,
                Fecha = conexionCorreo.Fecha,
                Titulo = conexionCorreo.Titulo,
                Descripcion = conexionCorreo.Descripcion,
                NombreCorreo = conexionCorreo.NombreCorreo,
                Usuario = conexionCorreo.Usuario,
                UrlAcceso = sasUrl
            };

            return Ok(response);
        }

        [HttpPost]
        public async Task<ActionResult<ConexionCorreo>> PostConexionCorreo([FromForm] CorreoDto correoDto)
        {
            if (_context.ConexionCorreos == null)
            {
                return Problem("Entity set 'KattionDataBaseContext.ConexionCorreos' is null.");
            }

            if (correoDto.Archivo != null && correoDto.Archivo.Length > 0)
            {
                var contenedorNombre = correoDto.TablaConexion;
                var contenedorClient = _blobServiceClient.GetBlobContainerClient(contenedorNombre);
                if (!await contenedorClient.ExistsAsync())
                {
                    await contenedorClient.CreateAsync();
                }

                var carpetaNombre = correoDto.TablaConexion + correoDto.IdConexion.ToString();
                var rutaBlob = $"{carpetaNombre}/";
                var nombreArchivoOriginal = Path.GetFileName(correoDto.Archivo.FileName);
                var nombreBlob = $"{rutaBlob}{nombreArchivoOriginal}";
                var blobClient = contenedorClient.GetBlobClient(nombreBlob);

                if (await blobClient.ExistsAsync())
                {
                    return BadRequest("Un archivo con el mismo nombre ya existe.");
                }

                await using (var stream = correoDto.Archivo.OpenReadStream())
                {
                    await blobClient.UploadAsync(stream, true);
                }

                var conexionCorreo = new ConexionCorreo
                {
                    TablaConexion = correoDto.TablaConexion,
                    IdConexion = correoDto.IdConexion,
                    Fecha = DateTime.Now,
                    Titulo = correoDto.Titulo,
                    Descripcion = correoDto.Descripcion,
                    NombreCorreo = nombreArchivoOriginal,
                    Usuario = correoDto.Usuario
                };
                _context.ConexionCorreos.Add(conexionCorreo);
                await _context.SaveChangesAsync();

                return CreatedAtAction("GetConexionCorreo", new { id = conexionCorreo.ConexionCorreoId }, conexionCorreo);
            }
            else
            {
                return BadRequest("El archivo no se proporcionó o está vacío.");
            }
        }

        public class CorreoUpdateDto
        {
            public string? Titulo { get; set; }
            public string? Descripcion { get; set; }
        }

        [HttpPatch("{id}")]
        public async Task<IActionResult> PatchConexionCorreo(int id, [FromBody] CorreoUpdateDto correoUpdateDto)
        {
            var conexionCorreo = await _context.ConexionCorreos.FindAsync(id);
            if (conexionCorreo == null)
            {
                return NotFound();
            }

            if (correoUpdateDto.Titulo != null)
            {
                conexionCorreo.Titulo = correoUpdateDto.Titulo;
            }

            if (correoUpdateDto.Descripcion != null)
            {
                conexionCorreo.Descripcion = correoUpdateDto.Descripcion;
            }

            _context.ConexionCorreos.Update(conexionCorreo);
            await _context.SaveChangesAsync();

            return Ok(conexionCorreo);
        }



        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteConexionCorreo(int id)
        {
            var conexionCorreo = await _context.ConexionCorreos.FindAsync(id);
            if (conexionCorreo == null)
            {
                return NotFound();
            }

            var containerClient = _blobServiceClient.GetBlobContainerClient(conexionCorreo.TablaConexion);
            var rutaBlob = $"{conexionCorreo.TablaConexion}{conexionCorreo.IdConexion}/{conexionCorreo.NombreCorreo}";
            var blobClient = containerClient.GetBlobClient(rutaBlob);

            await blobClient.DeleteIfExistsAsync();

            _context.ConexionCorreos.Remove(conexionCorreo);
            await _context.SaveChangesAsync();

            return NoContent();
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

        private bool ConexionCorreoExists(int id)
        {
            return (_context.ConexionCorreos?.Any(e => e.ConexionCorreoId == id)).GetValueOrDefault();
        }
    }
}
